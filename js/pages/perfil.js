/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/pages/perfil.js - Página privada perfil.html
   ---------------------------------------------------------------------
   Sprint 3 · 20/9

   La página arranca mostrando solo "Comprobando tu sesión…". Recién
   cuando onAuthStateChanged() confirma que hay un usuario se
   completan y se muestran sus datos. Sin sesión, se redirige a
   login.html y nunca aparece información privada.

   Los datos salen de dos lugares:
     Authentication → uid y correo (siempre están)
     Firestore      → nombre, rol y fecha de registro (usuarios/{uid})

   Contenidos de clase utilizados:
     Semana 6  · querySelector(), textContent, classList
     Semana 9  · onAuthStateChanged(), uid, email, displayName
     Semana 10 · getDoc() (en usuarios.js), async / await, try / catch
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPerfilUsuario } from "../modules/usuarios.js";

const perfilCargando = document.querySelector("#perfilCargando");
const perfilContenido = document.querySelector("#perfilContenido");
const perfilAviso = document.querySelector("#perfilAviso");

/* Firestore devuelve las fechas como un "Timestamp": toDate() lo
   convierte en un Date común para poder mostrarlo en español. */
function formatearFecha(fechaFirestore) {
  const fecha = fechaFirestore.toDate();

  return fecha.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });
}

function mostrarAvisoPerfil(texto) {
  perfilAviso.textContent = texto;
  perfilAviso.classList.remove("d-none");
}

/* Completa la tarjeta con lo que haya: si Firestore no respondió,
   se usan los datos de Authentication y un rol por defecto. */
function mostrarPerfil(usuario, datos) {
  let nombre = usuario.displayName || usuario.email;
  let rol = "cliente";

  if (datos) {
    nombre = datos.nombre;
    rol = datos.rol;
    document.querySelector("#perfilFecha").textContent = formatearFecha(datos.fechaRegistro);
  }

  document.querySelector("#perfilSaludo").textContent = `Hola, ${nombre.split(" ")[0]}`;
  document.querySelector("#perfilNombre").textContent = nombre;
  document.querySelector("#perfilCorreo").textContent = usuario.email;
  document.querySelector("#perfilInicial").textContent = nombre[0].toUpperCase();
  document.querySelector("#perfilRol").textContent = rol;
  document.querySelector("#perfilUid").textContent = usuario.uid;

  perfilCargando.classList.add("d-none");
  perfilContenido.classList.remove("d-none");
}

onAuthStateChanged(auth, async (usuario) => {
  /* Sin sesión: afuera, antes de mostrar nada.
     Si la sesión se acaba de cerrar con el botón, navbar.js ya está
     llevando al inicio y no hace falta ir a login.html. */
  if (!usuario) {
    if (document.body.dataset.cerrandoSesion !== "si") {
      window.location.href = "login.html";
    }
    return;
  }

  /* Con sesión: se buscan sus datos en Firestore */
  try {
    const datos = await obtenerPerfilUsuario(usuario.uid);

    if (!datos) {
      mostrarAvisoPerfil("No encontramos los datos guardados de tu cuenta. Mostramos la información básica.");
    }

    mostrarPerfil(usuario, datos);
  } catch (error) {
    mostrarAvisoPerfil("No pudimos cargar todos tus datos en este momento. Mostramos la información básica.");
    mostrarPerfil(usuario, null);
  }
});
