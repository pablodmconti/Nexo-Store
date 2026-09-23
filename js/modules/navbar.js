/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/modules/navbar.js - Barra de navegación según la sesión
   ---------------------------------------------------------------------
   Sprint 3 · 20/9

   Se carga en TODAS las páginas (con type="module"). Escucha el
   estado real de la sesión y cambia el navbar:

     Sin sesión  → botón "Ingresar"
     Con sesión  → enlace "Mi perfil" y menú con el nombre y
                   "Cerrar sesión"

   Contenidos de clase utilizados:
     Semana 6 · querySelector(), classList, textContent, eventos
     Semana 9 · onAuthStateChanged(), displayName, signOut()
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { cerrarSesion } from "./auth.js";

const btnIngresar = document.querySelector("#btnIngresar");
const menuUsuario = document.querySelector("#menuUsuario");
const nombreUsuarioNav = document.querySelector("#nombreUsuarioNav");
const navPerfil = document.querySelector("#navPerfil");

/* onAuthStateChanged() se ejecuta al cargar la página (con la sesión
   que Firebase recordó) y cada vez que alguien entra o sale. */
onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    /* Si todavía no tiene nombre guardado, se muestra el correo */
    nombreUsuarioNav.textContent = usuario.displayName || usuario.email;

    btnIngresar.classList.add("d-none");
    menuUsuario.classList.remove("d-none");
    navPerfil.classList.remove("d-none");
  } else {
    btnIngresar.classList.remove("d-none");
    menuUsuario.classList.add("d-none");
    navPerfil.classList.add("d-none");
  }
});

/* Todos los botones de cierre del sitio (el del menú y el de la página
   de perfil) llevan el atributo data-cerrar-sesion. */
document.querySelectorAll("[data-cerrar-sesion]").forEach((boton) => {
  boton.addEventListener("click", async () => {
    boton.disabled = true;

    /* Marca para las páginas privadas: al cerrar sesión desde acá, la
       redirección la hace este archivo (a index.html) y no perfil.js */
    document.body.dataset.cerrandoSesion = "si";

    try {
      await cerrarSesion();
      window.location.href = "index.html";
    } catch (error) {
      boton.disabled = false;
      document.body.dataset.cerrandoSesion = "";
      mostrarAviso("No se pudo cerrar la sesión. Intentá de nuevo.");
    }
  });
});
