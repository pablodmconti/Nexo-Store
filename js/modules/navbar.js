/* =====================================================================
   Barra de navegación según la sesión
   ---------------------------------------------------------------------

   Se carga en TODAS las páginas (con type="module"). Escucha el
   estado real de la sesión y cambia el navbar:

     Sin sesión  → botón "Ingresar"
     Con sesión  → enlace "Mi perfil" y menú con el nombre y
                   "Cerrar sesión"
     Rol "admin" → además, los enlaces "Administración" del menú y
                   del pie de página (marcados con data-solo-admin)

   Ocultar el enlace NO protege el panel: admin.js vuelve a comprobar
   el rol al cargar la página, como pide la consigna.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { cerrarSesion } from "./auth.js";
import { obtenerPerfilUsuario } from "./usuarios.js";

const btnIngresar = document.querySelector("#btnIngresar");
const menuUsuario = document.querySelector("#menuUsuario");
const nombreUsuarioNav = document.querySelector("#nombreUsuarioNav");
const navPerfil = document.querySelector("#navPerfil");

/* Todos los accesos al panel: el del menú y el del pie de página */
const enlacesAdmin = document.querySelectorAll("[data-solo-admin]");

function mostrarEnlacesAdmin(visibles) {
  enlacesAdmin.forEach((enlace) => {
    enlace.classList.toggle("d-none", !visibles);
  });
}

/* Muestra "Administración" solo si el documento usuarios/{uid} dice
   rol: "admin". Si la consulta falla, los enlaces quedan ocultos. */
async function mostrarEnlaceAdmin(uid) {
  try {
    const perfil = await obtenerPerfilUsuario(uid);

    if (perfil && perfil.rol === "admin") {
      mostrarEnlacesAdmin(true);
    }
  } catch (error) {
    console.error("No se pudo leer el rol del usuario:", error);
  }
}

/* onAuthStateChanged() se ejecuta al cargar la página (con la sesión
   que Firebase recordó) y cada vez que alguien entra o sale. */
onAuthStateChanged(auth, (usuario) => {
  if (usuario) {
    /* Si todavía no tiene nombre guardado, se muestra el correo */
    nombreUsuarioNav.textContent = usuario.displayName || usuario.email;

    btnIngresar.classList.add("d-none");
    menuUsuario.classList.remove("d-none");
    navPerfil.classList.remove("d-none");
    mostrarEnlaceAdmin(usuario.uid);
  } else {
    btnIngresar.classList.remove("d-none");
    menuUsuario.classList.add("d-none");
    navPerfil.classList.add("d-none");
    mostrarEnlacesAdmin(false);
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
