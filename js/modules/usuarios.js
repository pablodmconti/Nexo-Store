/* =====================================================================
Datos de los usuarios en Cloud Firestore
   ---------------------------------------------------------------------
  
   Authentication guarda el correo y la contraseña. Todo lo demás
   (nombre, rol, fecha de registro) vive en Firestore, en la colección
   "usuarios", con un documento por persona cuyo id es su uid:

     usuarios / {uid}
       ├─ nombre:        "Ana Pérez"
       ├─ correo:        "ana@correo.com"
       ├─ rol:           "cliente"
       └─ fechaRegistro: 20 de setiembre de 2026, 18:30

   Este archivo SOLO habla con la base de datos: no toca el HTML.
   ===================================================================== */

import { db } from "../firebase/config.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* Crea el documento del usuario recién registrado.
   Usar el uid como id del documento permite encontrarlo después sin
   hacer ninguna búsqueda: es la misma idea que el id de un producto. */
export async function crearPerfilUsuario(uid, nombre, correo) {
  await setDoc(doc(db, "usuarios", uid), {
    nombre: nombre,
    correo: correo,
    rol: "cliente",          // todos entran como cliente; admin se asigna a mano
    fechaRegistro: new Date()
  });
}

/* Devuelve los datos guardados del usuario, o null si el documento
   no existe (por ejemplo, una cuenta creada antes de este sprint). */
export async function obtenerPerfilUsuario(uid) {
  const documento = await getDoc(doc(db, "usuarios", uid));

  if (documento.exists()) {
    return documento.data();
  }

  return null;
}
