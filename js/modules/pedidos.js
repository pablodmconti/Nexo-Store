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
       ├─ subtotal, envio, total
       ├─ fecha:         momento de la confirmación
       ├─ estado:        "pendiente"
       └─ pago:          { metodo, estado, idOperacion, fecha }
                         (Sprint 4: "mercadopago" o "coordinar")

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ---------------------------------------------------------------
   0. FORMAS DE PAGO (Sprint 4)
   ---------------------------------------------------------------
   Textos para mostrar el pago en el perfil y en el panel. Los pedidos
   anteriores al Sprint 4 no tienen el campo pago: se muestran como
   "A coordinar con el equipo".
   --------------------------------------------------------------- */
export const METODOS_PAGO = {
  mercadopago: "Mercado Pago (simulado)",
  coordinar: "A coordinar con el equipo"
};

export const ESTADOS_PAGO = {
  pendiente: "pago pendiente",
  aprobado: "pago aprobado",
  rechazado: "pago rechazado"
};

/* Ejemplo: "Mercado Pago (simulado) · pago aprobado" */
export function describirPago(pedido) {
  if (!pedido.pago) {
    return METODOS_PAGO.coordinar;
  }

  let texto = METODOS_PAGO[pedido.pago.metodo];

  if (pedido.pago.metodo === "mercadopago") {
    texto += ` · ${ESTADOS_PAGO[pedido.pago.estado]}`;
  }

  return texto;
}

/* ---------------------------------------------------------------
   1. CONFIRMAR UNA COMPRA
   ---------------------------------------------------------------
   Recibe el usuario autenticado, el carrito de LocalStorage y la forma
   de pago elegida ("mercadopago" o "coordinar").
   Devuelve un objeto con el resultado:
     { confirmado: true,  idPedido, total }
     { confirmado: false, problemas: ["...", "..."] }
   Si falla la conexión con Firestore, el error sube a quien la llamó.
   --------------------------------------------------------------- */
export async function confirmarPedido(usuario, carrito, metodoPago) {
  const items = [];
  const problemas = [];

  /* Paso 1: volver a leer CADA producto. El stock y el precio pueden
     haber cambiado desde que se armó el carrito. */
  for (const item of carrito) {
    const snapshot = await getDoc(doc(db, "productos", item.idProducto));

    if (!snapshot.exists()) {
      problemas.push("Uno de los productos del carrito ya no está en la tienda.");
    } else {
      const producto = { id: snapshot.id, ...snapshot.data() };

      if (!producto.disponible) {
        problemas.push(`${producto.nombre} no está disponible por el momento.`);
      } else if (item.cantidad > producto.stock) {
        problemas.push(`De ${producto.nombre} quedan ${producto.stock} unidades y en el carrito hay ${item.cantidad}.`);
      } else {
        items.push({ producto, cantidad: item.cantidad });
      }
    }
  }

  /* Si algo no alcanza, no se guarda nada */
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

  /* Paso 3: un solo lote (writeBatch) con el pedido nuevo y
     el descuento de stock de cada producto. commit() confirma todo
     junto: si algo falla, no queda un pedido sin descontar stock ni
     stock descontado sin pedido. */
  const lote = writeBatch(db);

  /* doc() sobre la colección, sin id, reserva un id automático */
  const referenciaPedido = doc(collection(db, "pedidos"));

  lote.set(referenciaPedido, {
    uid: usuario.uid,
    nombreUsuario: usuario.displayName || usuario.email,
    correo: usuario.email,
    productos: productosPedido,
    subtotal: subtotal,
    envio: envio,
    total: total,
    fecha: new Date(),
    estado: "pendiente",
    pago: {
      metodo: metodoPago,
      estado: "pendiente"
    }
  });

  items.forEach(({ producto, cantidad }) => {
    const nuevoStock = producto.stock - cantidad;

    /* Nunca negativo: la cantidad ya se comparó con el stock en el
       paso 1, pero se vuelve a controlar antes de escribir */
    if (nuevoStock >= 0) {
      lote.update(doc(db, "productos", producto.id), { stock: nuevoStock });
    }
  });

  await lote.commit();

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
   Si se CANCELA, las unidades vuelven al stock de cada producto en el
   mismo lote: o se cancela y se devuelve el stock, o no cambia nada.
   Un pedido ya cancelado no se puede volver a cambiar, para no
   devolver el stock dos veces (se controla también en admin.js). */
export async function cambiarEstadoPedido(pedido, nuevoEstado) {
  const lote = writeBatch(db);

  lote.update(doc(db, "pedidos", pedido.id), { estado: nuevoEstado });

  if (nuevoEstado === "cancelado" && pedido.estado !== "cancelado") {
    for (const item of pedido.productos) {
      const referencia = doc(db, "productos", item.idProducto);
      const snapshot = await getDoc(referencia);

      /* Si el producto fue eliminado, no hay stock que devolver */
      if (snapshot.exists()) {
        lote.update(referencia, { stock: snapshot.data().stock + item.cantidad });
      }
    }
  }

  await lote.commit();
}

/* ---------------------------------------------------------------
   4. PAGO SIMULADO CON MERCADO PAGO (Sprint 4)
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

/* Guarda en el pedido el resultado que devolvió la pasarela.
   updateDoc() cambia SOLO el campo pago: las reglas de Firestore
   rechazan que un cliente toque el estado, el total o los productos. */
export async function registrarPago(idPedido, estadoPago, idOperacion) {
  await updateDoc(doc(db, "pedidos", idPedido), {
    pago: {
      metodo: "mercadopago",
      estado: estadoPago,
      idOperacion: idOperacion,
      fecha: new Date()
    }
  });
}
