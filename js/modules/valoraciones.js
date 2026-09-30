/* =====================================================================
Valoraciones y comentarios en Cloud Firestore
   ---------------------------------------------------------------------

   Cada opinión es un documento de la colección "valoraciones". Su id
   combina el producto y el usuario (p1_Xy12...), así cada persona
   tiene UNA opinión por producto: si vuelve a opinar, se actualiza
   la misma en lugar de duplicarse.

     valoraciones / p1_Xy12...
       ├─ idProducto:    "p1"
       ├─ uid:           "Xy12..."
       ├─ nombreUsuario: "Ana Pérez"
       ├─ puntuacion:    4          (entero de 1 a 5)
       ├─ comentario:    "Muy buen teclado..."
       └─ fecha

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export const COMENTARIO_MINIMO = 10;
export const COMENTARIO_MAXIMO = 500;

/* Devuelve un texto con el problema, o "" si los datos son válidos.
   Se usa antes de guardar para no mandar datos incorrectos a Firestore. */
export function validarValoracion(puntuacion, comentario) {
  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return "Elegí una puntuación de 1 a 5 estrellas.";
  }

  if (comentario.length < COMENTARIO_MINIMO) {
    return `El comentario debe tener al menos ${COMENTARIO_MINIMO} caracteres.`;
  }

  if (comentario.length > COMENTARIO_MAXIMO) {
    return `El comentario no puede superar los ${COMENTARIO_MAXIMO} caracteres.`;
  }

  return "";
}

/* Guarda (o actualiza) la opinión del usuario sobre un producto */
export async function guardarValoracion(usuario, idProducto, puntuacion, comentario) {
  const idValoracion = `${idProducto}_${usuario.uid}`;

  await setDoc(doc(db, "valoraciones", idValoracion), {
    idProducto: idProducto,
    uid: usuario.uid,
    nombreUsuario: usuario.displayName || usuario.email,
    puntuacion: puntuacion,
    comentario: comentario,
    fecha: new Date()
  });
}

/* Trae solo las opiniones de un producto, las más recientes primero */
export async function obtenerValoraciones(idProducto) {
  const consulta = query(collection(db, "valoraciones"), where("idProducto", "==", idProducto));
  const snapshot = await getDocs(consulta);

  const valoraciones = snapshot.docs.map((documento) => {
    return { id: documento.id, ...documento.data() };
  });

  valoraciones.sort((a, b) => b.fecha.toDate() - a.fecha.toDate());

  return valoraciones;
}
