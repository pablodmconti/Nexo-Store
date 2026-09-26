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
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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
