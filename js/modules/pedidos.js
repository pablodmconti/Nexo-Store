/* =====================================================================
Pedidos en Cloud Firestore
   ---------------------------------------------------------------------

   Cada compra confirmada es un documento de la colección "pedidos":

     pedidos / {id automático}
       ├─ uid:           "Xy12..."   (quién compró)
       ├─ nombreUsuario: "Ana Pérez"
       ├─ correo:        "ana@correo.com"
       ├─ productos:     [{ idProducto, nombre, precioUnitario,
       │                    cantidad, subtotal }, ...]
       ├─ cantidades:    { idProducto: cantidad, ... }
       │                 (lo mismo en forma de mapa, para las reglas)
       ├─ subtotal, envio, total
       ├─ fecha:         momento de la confirmación (hora del servidor)
       ├─ estado:        "pendiente"
       └─ pago:          { metodo, estado, idOperacion, fecha }
                         (Sprint 4: "simulado" o "coordinar")

   Al comprar, cada producto guarda el id del pedido en el campo
   ultimoPedido. Así las reglas de Firestore pueden comprobar que el
   stock baja solo junto con un pedido nuevo de la misma cuenta.

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ---------------------------------------------------------------
   0. FORMAS DE PAGO
   ---------------------------------------------------------------
   Textos para mostrar el pago en el perfil y en el panel. Los pedidos
   anteriores al Sprint 4 no tienen el campo pago: se muestran como
   "A coordinar con el equipo". "mercadopago" queda solo para mostrar
   los pedidos de prueba de una integración que se retiró.
   --------------------------------------------------------------- */
export const METODOS_PAGO = {
  simulado: "Pago en línea (simulado)",
  coordinar: "A coordinar con el equipo",
  mercadopago: "Mercado Pago (prueba retirada)"
};

/* El pago en línea es el único que se paga desde la tienda */
export function esPagoEnLinea(pedido) {
  return Boolean(pedido.pago) && pedido.pago.metodo === "simulado";
}

export const ESTADOS_PAGO = {
  pendiente: "pago pendiente",
  aprobado: "pago aprobado",
  rechazado: "pago rechazado"
};

/* Ejemplo: "Pago en línea (simulado) · pago aprobado" */
export function describirPago(pedido) {
  if (!pedido.pago) {
    return METODOS_PAGO.coordinar;
  }

  let texto = METODOS_PAGO[pedido.pago.metodo];

  if (pedido.pago.metodo !== "coordinar") {
    texto += ` · ${ESTADOS_PAGO[pedido.pago.estado]}`;
  }

  return texto;
}

/* ---------------------------------------------------------------
   1. CONFIRMAR UNA COMPRA
   ---------------------------------------------------------------
   Recibe el usuario autenticado, el carrito de LocalStorage y la forma
   de pago elegida ("simulado" o "coordinar").
   Devuelve un objeto con el resultado:
     { confirmado: true,  idPedido, total }
     { confirmado: false, problemas: ["...", "..."] }
   Si falla la conexión con Firestore, el error sube a quien la llamó.
   --------------------------------------------------------------- */
export async function confirmarPedido(usuario, carrito, metodoPago) {
  /* Las reglas de Firestore revisan uno por uno los productos de un
     pedido y aceptan hasta 5 distintos (base.js lo controla al agregar;
     esto cubre un carrito guardado antes de ese límite) */
  if (carrito.length > MAXIMO_PRODUCTOS_CARRITO) {
    return {
      confirmado: false,
      problemas: [`El carrito tiene ${carrito.length} productos distintos y una compra admite hasta ${MAXIMO_PRODUCTOS_CARRITO}. Quitá algunos y compralos en otro pedido.`]
    };
  }

  /* doc() sobre la colección, sin id, reserva un id automático */
  const referenciaPedido = doc(collection(db, "pedidos"));

  /* runTransaction(): todo lo que pasa adentro se confirma junto o no
     se confirma. Además, Firestore vigila los productos que se leyeron:
     si otra compra cambia su stock antes de terminar, rechaza la
     escritura y la transacción se repite con los datos nuevos. Así dos
     compras simultáneas del mismo producto no se pisan (con un
     writeBatch() las dos calculaban el stock a partir del mismo valor
     viejo).

     Ese rechazo a veces llega como "permission-denied": las reglas
     comparan el stock nuevo con el que hay AHORA en la base, y una
     escritura calculada con el valor viejo no las cumple. Firestore no
     repite sola la transacción ante ese error, así que se vuelve a
     intentar desde acá, hasta 3 veces. Si el permiso falta de verdad,
     los 3 intentos fallan igual y el error sube a carrito.js. */
  for (let intento = 1; ; intento++) {
    try {
      return await runTransaction(db, (transaccion) => {
        return comprarEnTransaccion(transaccion, referenciaPedido, usuario, carrito, metodoPago);
      });
    } catch (error) {
      if (error.code !== "permission-denied" || intento === 3) {
        throw error;
      }
    }
  }
}

/* El contenido de la transacción de compra: primero todas las
   lecturas, después todas las escrituras */
async function comprarEnTransaccion(transaccion, referenciaPedido, usuario, carrito, metodoPago) {
  const items = [];
  const problemas = [];

  /* Paso 1: volver a leer CADA producto, dentro de la transacción.
     El stock y el precio pueden haber cambiado desde que se armó el
     carrito. En una transacción, todas las lecturas van primero. */
  for (const item of carrito) {
    const referencia = doc(db, "productos", item.idProducto);
    const snapshot = await transaccion.get(referencia);

    if (!snapshot.exists()) {
      problemas.push("Uno de los productos del carrito ya no está en la tienda.");
    } else {
      const producto = { id: snapshot.id, ...snapshot.data() };

      if (!producto.disponible) {
        problemas.push(`${producto.nombre} no está disponible por el momento.`);
      } else if (item.cantidad > producto.stock) {
        problemas.push(`De ${producto.nombre} quedan ${producto.stock} unidades y en el carrito hay ${item.cantidad}.`);
      } else {
        items.push({ referencia, producto, cantidad: item.cantidad });
      }
    }
  }

  /* Si algo no alcanza, no se escribe nada */
  if (problemas.length > 0) {
    return { confirmado: false, problemas: problemas };
  }

  /* Paso 2: calcular con la información ACTUAL de Firestore */
  const productosPedido = items.map(({ producto, cantidad }) => {
    return {
      idProducto: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad: cantidad,
      subtotal: producto.precio * cantidad
    };
  });

  const subtotal = productosPedido.reduce((suma, p) => suma + p.subtotal, 0);
  const envio = calcularEnvio(subtotal); // está en base.js
  const total = subtotal + envio;

  /* Las cantidades también como mapa { p3: 2, p7: 1 }. Las reglas de
     Firestore no pueden recorrer la lista productos para buscar un
     producto, pero en un mapa lo encuentran directo por su id */
  const cantidades = {};
  items.forEach(({ producto, cantidad }) => {
    cantidades[producto.id] = cantidad;
  });

  /* Paso 3: las escrituras, después de todas las lecturas: el pedido
     nuevo y el descuento de stock de cada producto. Cada producto anota
     el id del pedido (ultimoPedido): las reglas solo dejan bajar el
     stock si ese pedido se crea en esta misma transacción, es de quien
     compra y pide exactamente esa cantidad */
  transaccion.set(referenciaPedido, {
    uid: usuario.uid,
    nombreUsuario: usuario.displayName || usuario.email,
    correo: usuario.email,
    productos: productosPedido,
    cantidades: cantidades,
    subtotal: subtotal,
    envio: envio,
    total: total,
    /* La hora la pone el servidor: las reglas exigen que sea la del
       momento de la compra, así nadie registra un pedido con otra fecha */
    fecha: serverTimestamp(),
    estado: "pendiente",
    pago: {
      metodo: metodoPago,
      estado: "pendiente"
    }
  });

  items.forEach(({ referencia, producto, cantidad }) => {
    transaccion.update(referencia, {
      stock: producto.stock - cantidad,
      ultimoPedido: referenciaPedido.id
    });
  });

  return { confirmado: true, idPedido: referenciaPedido.id, total: total };
}

/* ---------------------------------------------------------------
   2. PEDIDOS DEL USUARIO AUTENTICADO
   ---------------------------------------------------------------
   query() + where() piden a Firestore SOLO los documentos cuyo campo
   uid coincide con el del usuario: los pedidos de otras personas no
   llegan nunca al navegador.
   --------------------------------------------------------------- */
export async function obtenerPedidosDeUsuario(uid) {
  const consulta = query(collection(db, "pedidos"), where("uid", "==", uid));
  const snapshot = await getDocs(consulta);

  const pedidos = snapshot.docs.map((documento) => {
    return { id: documento.id, ...documento.data() };
  });

  /* Los más recientes primero. Firestore devuelve las fechas como
     Timestamp: toDate() las convierte en Date para poder restarlas. */
  pedidos.sort((a, b) => b.fecha.toDate() - a.fecha.toDate());

  return pedidos;
}

/* ---------------------------------------------------------------
   3. PEDIDOS EN EL PANEL ADMINISTRATIVO
   --------------------------------------------------------------- */

/* Los estados posibles de un pedido, en el orden en que avanza */
export const ESTADOS_PEDIDO = ["pendiente", "en preparación", "enviado", "entregado", "cancelado"];

/* Todos los pedidos de la tienda, los más recientes primero */
export async function obtenerTodosLosPedidos() {
  const snapshot = await getDocs(collection(db, "pedidos"));

  const pedidos = snapshot.docs.map((documento) => {
    return { id: documento.id, ...documento.data() };
  });

  pedidos.sort((a, b) => b.fecha.toDate() - a.fecha.toDate());

  return pedidos;
}

/* Cambia el estado de un pedido.
   Si se CANCELA, las unidades vuelven al stock de cada producto en la
   misma transacción: o se cancela y se devuelve el stock, o no cambia
   nada. Se trabaja con los datos ACTUALES (no con los que tenía la
   pantalla del panel): si una compra cambia el stock al mismo tiempo,
   la transacción se repite sola, y un pedido que ya estaba cancelado
   no se vuelve a cancelar, para no devolver el stock dos veces. */
export async function cambiarEstadoPedido(pedido, nuevoEstado) {
  const referenciaPedido = doc(db, "pedidos", pedido.id);

  await runTransaction(db, async (transaccion) => {
    /* Primero todas las lecturas: el pedido como está ahora y, si se
       cancela, el stock actual de cada uno de sus productos */
    const pedidoActual = (await transaccion.get(referenciaPedido)).data();

    if (pedidoActual.estado === "cancelado") {
      const error = new Error("El pedido ya estaba cancelado.");
      error.code = "ya-cancelado";
      throw error;
    }

    const devoluciones = [];

    if (nuevoEstado === "cancelado") {
      for (const item of pedidoActual.productos) {
        const referencia = doc(db, "productos", item.idProducto);
        const snapshot = await transaccion.get(referencia);

        /* Si el producto fue eliminado, no hay stock que devolver */
        if (snapshot.exists()) {
          devoluciones.push({ referencia, stock: snapshot.data().stock + item.cantidad });
        }
      }
    }

    /* Después las escrituras */
    transaccion.update(referenciaPedido, { estado: nuevoEstado });

    devoluciones.forEach(({ referencia, stock }) => {
      transaccion.update(referencia, { stock: stock });
    });
  });
}

/* ---------------------------------------------------------------
   4. PAGO EN LÍNEA SIMULADO (Sprint 4)
   --------------------------------------------------------------- */

/* Un pedido a partir de su id, o null si no existe.
   Las reglas de Firestore solo dejan leerlo a su dueño (y al admin):
   con el id de un pedido ajeno, getDoc() falla con permission-denied. */
export async function obtenerPedido(idPedido) {
  const snapshot = await getDoc(doc(db, "pedidos", idPedido));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

/* Guarda en el pedido el resultado de la pasarela y su número de
   operación (SIM-...). updateDoc() cambia SOLO el campo pago: las
   reglas de Firestore rechazan que un cliente toque el estado, el
   total o los productos. */
export async function registrarPago(idPedido, estadoPago, idOperacion) {
  await updateDoc(doc(db, "pedidos", idPedido), {
    pago: {
      metodo: "simulado",
      estado: estadoPago,
      idOperacion: idOperacion,
      fecha: new Date()
    }
  });
}
