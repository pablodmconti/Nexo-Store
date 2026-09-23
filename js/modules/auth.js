/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/modules/auth.js - Registro, inicio y cierre de sesión
   ---------------------------------------------------------------------
   Sprint 3 · 20/9

   Reúne las operaciones de Firebase Authentication. Las páginas
   (login.js, perfil.js, navbar.js) llaman a estas funciones y se
   ocupan solamente de mostrar el resultado.

   La sesión la guarda Firebase: no se usa LocalStorage para "simular"
   que alguien está logueado. Al recargar, onAuthStateChanged() vuelve
   a avisar quién es el usuario.

   Contenidos de clase utilizados:
     Semana 9 · createUserWithEmailAndPassword(), updateProfile(),
                signInWithEmailAndPassword(), signOut(), async / await,
                objetos como "diccionario" de mensajes
   ===================================================================== */

import { auth } from "../firebase/config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { crearPerfilUsuario } from "./usuarios.js";

/* ---------------------------------------------------------------
   1. REGISTRO
   Son tres pasos, uno detrás del otro gracias a await:
     1) crear la cuenta en Authentication
     2) guardar el nombre en la cuenta (displayName, para el navbar)
     3) crear el documento usuarios/{uid} en Firestore
   Si cualquiera falla, el error sube hasta quien llamó a la función.
   --------------------------------------------------------------- */
export async function registrarUsuario(nombre, correo, contrasena) {
  const credenciales = await createUserWithEmailAndPassword(auth, correo, contrasena);
  const usuario = credenciales.user;

  await updateProfile(usuario, { displayName: nombre });
  await crearPerfilUsuario(usuario.uid, nombre, correo);

  return usuario;
}

/* ---------------------------------------------------------------
   2. INICIO Y CIERRE DE SESIÓN
   --------------------------------------------------------------- */
export async function iniciarSesion(correo, contrasena) {
  const credenciales = await signInWithEmailAndPassword(auth, correo, contrasena);
  return credenciales.user;
}

export async function cerrarSesion() {
  await signOut(auth);
}

/* ---------------------------------------------------------------
   3. MENSAJES DE ERROR COMPRENSIBLES
   Firebase responde con códigos como "auth/invalid-credential".
   Este objeto los traduce a una frase para la persona que usa el
   sitio. Si llega un código que no está en la lista, se usa el
   mensaje general del final (el mismo || que en obtenerCarrito()).
   --------------------------------------------------------------- */
const MENSAJES_ERROR = {
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Probá iniciar sesión.",
  "auth/invalid-email": "El correo no tiene un formato válido.",
  "auth/weak-password": "La contraseña es muy débil: usá al menos 6 caracteres.",
  "auth/missing-password": "Escribí tu contraseña.",
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/user-not-found": "El correo o la contraseña no son correctos.",
  "auth/wrong-password": "El correo o la contraseña no son correctos.",
  "auth/user-disabled": "Esta cuenta está deshabilitada. Escribinos para revisarla.",
  "auth/too-many-requests": "Hubo demasiados intentos seguidos. Esperá unos minutos y volvé a probar.",
  "auth/network-request-failed": "No pudimos conectarnos. Revisá tu conexión a internet.",
  "auth/operation-not-allowed": "El registro con correo todavía no está habilitado en la tienda.",
  "permission-denied": "La base de datos rechazó la operación.",
  "unavailable": "La base de datos no responde en este momento. Probá de nuevo en un rato."
};

export function traducirError(error) {
  return MENSAJES_ERROR[error.code] || "Ocurrió un error inesperado. Intentá de nuevo.";
}
