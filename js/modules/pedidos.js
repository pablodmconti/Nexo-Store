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
       └─ estado:        "pendiente"

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ---------------------------------------------------------------
   1. CONFIRMAR UNA COMPRA
   ---------------------------------------------------------------
   Recibe el usuario autenticado y el carrito de LocalStorage.
   Devuelve un objeto con el resultado:
     { confirmado: true,  idPedido, total }
     { confirmado: false, problemas: ["...", "..."] }
   Si falla la conexión con Firestore, el error sube a quien la llamó.
   --------------------------------------------------------------- */
export async function confirmarPedido(usuario, carrito) {
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
    estado: "pendiente"
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
