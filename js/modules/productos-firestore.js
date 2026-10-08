/* =====================================================================
Productos en Cloud Firestore
   ---------------------------------------------------------------------

   Cada producto es un documento de la colección "productos". El id
   del documento es el mismo id que usa el sitio (p1, p2...), así que
   no se repite como campo adentro:

     productos / p1
       ├─ nombre:          "Teclado mecánico TKL Aurora"
       ├─ descripcion:     "Switches lineales, doble amortiguación..."
       ├─ categoria:       "Periféricos"
       ├─ precio:          4290
       ├─ stock:           12
       ├─ disponible:      true
       ├─ imagenes:        ["https://...", ...]
       ├─ imagenAlt:       "Teclado mecánico compacto..."
       └─ caracteristicas: ["Formato TKL de 87 teclas", ...]

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ---------------------------------------------------------------
   CARGA INICIAL CON UN LOTE (Semana 11)
   ---------------------------------------------------------------
   writeBatch() agrupa todas las escrituras y commit() las confirma
   juntas: se guardan los 12 productos o ninguno.
   Se usa el id que ya tiene cada producto (doc(db, "productos", id))
   en lugar de addDoc(): si la carga se repite, actualiza los mismos
   documentos y no crea duplicados.
   --------------------------------------------------------------- */
export async function cargarProductos(listaProductos) {
  const lote = writeBatch(db);

  listaProductos.forEach((producto) => {
    /* Se separa el id (nombre del documento) del resto de los campos */
    const { id, ...datosProducto } = producto;
    const referencia = doc(db, "productos", id);
    lote.set(referencia, datosProducto);
  });

  await lote.commit();
}

/* ---------------------------------------------------------------
   LECTURA DE PRODUCTOS
   ---------------------------------------------------------------
   Estas funciones NO atrapan los errores con try / catch: los dejan
   subir hasta la página que las llamó. Así cada página puede
   distinguir entre "no hay productos" (un array vacío) y "falló la
   consulta" (un error), y mostrar el mensaje que corresponde.
   --------------------------------------------------------------- */

/* Trae todos los documentos de la colección y los convierte en el
   mismo array de objetos que usaba el Sprint 2, con el id incluido. */
export async function obtenerProductos() {
  const referencia = collection(db, "productos");
  const snapshot = await getDocs(referencia);

  return snapshot.docs.map((documento) => {
    return { id: documento.id, ...documento.data() };
  });
}

/* Trae un solo producto a partir de su id.
   Devuelve null si no existe un documento con ese id. */
export async function obtenerProducto(idProducto) {
  const referencia = doc(db, "productos", idProducto);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
}

/* ---------------------------------------------------------------
   ADMINISTRACIÓN DE PRODUCTOS (panel administrativo)
   ---------------------------------------------------------------
   Las cuatro operaciones del CRUD sobre la colección productos:
     Crear      → guardarProducto()  con setDoc() y un id nuevo
     Leer       → obtenerProductos() y obtenerProducto(), más arriba
     Actualizar → actualizarProducto() con updateDoc(), que cambia
                  SOLO los campos indicados y deja el resto igual
     Eliminar   → eliminarProducto() con deleteDoc()
   --------------------------------------------------------------- */
export async function guardarProducto(idProducto, datos) {
  await setDoc(doc(db, "productos", idProducto), datos);
}

export async function actualizarProducto(idProducto, cambios) {
  await updateDoc(doc(db, "productos", idProducto), cambios);
}

export async function eliminarProducto(idProducto) {
  await deleteDoc(doc(db, "productos", idProducto));
}

/* Próximo id libre siguiendo el formato de la tienda (p13, p14...),
   así "Orden de la tienda" del catálogo sigue funcionando */
export function siguienteIdProducto(productos) {
  let mayor = 0;

  productos.forEach((producto) => {
    const numero = Number(producto.id.slice(1));

    if (numero > mayor) {
      mayor = numero;
    }
  });

  return `p${mayor + 1}`;
}
