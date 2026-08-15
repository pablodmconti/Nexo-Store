/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/base.js - Comportamiento comun de la interfaz (Sprint 1)
   ---------------------------------------------------------------------
   En este sprint el archivo solo se ocupa de la navegacion y de los
   avisos de las funcionalidades que se desarrollaran mas adelante.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = document.body.dataset.page;

  /* Marca visualmente el enlace de la pagina que se esta visitando */
  document.querySelectorAll(".nav-link[data-page]").forEach((enlace) => {
    const esActual = enlace.dataset.page === paginaActual;
    enlace.classList.toggle("active", esActual);
    if (esActual) {
      enlace.setAttribute("aria-current", "page");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });

  /* Aviso reutilizable mediante el componente Toast de Bootstrap */
  const toast = document.querySelector("#appToast");
  const mensaje = document.querySelector("#toastMessage");

  const mostrarAviso = (texto) => {
    if (!toast || !mensaje) return;
    mensaje.textContent = texto;
    bootstrap.Toast.getOrCreateInstance(toast).show();
  };

  /* Funcionalidades bloqueadas en el Sprint 1 */
  document.querySelector("#btnLoginPlaceholder")?.addEventListener("click", () => {
    mostrarAviso("El inicio de sesión será desarrollado en el Sprint 3.");
  });

  document.querySelector("#btnCartPlaceholder")?.addEventListener("click", () => {
    mostrarAviso("El carrito de compras será desarrollado en el Sprint 2.");
  });

  /* Modal informativo de la pagina de inicio */
  document.querySelector("#btnProjectInfo")?.addEventListener("click", () => {
    const modal = document.querySelector("#projectInfoModal");
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  });
});
