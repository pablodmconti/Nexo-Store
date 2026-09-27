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
  doc,
  getDoc,
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* Guarda un producto en productos/{id}.
   setDoc() crea el documento si no existe y lo reemplaza si ya
   existe, por eso la carga inicial se puede repetir sin duplicar. */
export async function guardarProducto(producto) {
  await setDoc(doc(db, "productos", producto.id), {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    precio: producto.precio,
    stock: producto.stock,
    disponible: producto.disponible,
    imagenes: producto.imagenes,
    imagenAlt: producto.imagenAlt,
    caracteristicas: producto.caracteristicas
  });
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
