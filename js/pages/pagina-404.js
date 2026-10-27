/* =====================================================================
Página no encontrada (404.html) · Sprint 4
   ---------------------------------------------------------------------
   GitHub Pages muestra 404.html cuando se abre una dirección que no
   existe dentro del sitio. La barra de direcciones conserva la
   dirección que se pidió, y la página la muestra para que se vea qué
   enlace falló.
   ===================================================================== */

/* La dirección pedida, sin el dominio. textContent la muestra como
   texto común: aunque traiga caracteres como < o >, no se interpreta
   como HTML. */
const rutaPedida = decodeURIComponent(window.location.pathname);

document.querySelector("#ruta404").textContent = rutaPedida;
document.querySelector("#direccion404").classList.remove("d-none");

/* Con <base href="/Nivel99/">, el enlace "Saltar al contenido" (#contenido)
   llevaría a la página de inicio. Se arma con la dirección actual para
   que siga bajando al contenido de esta misma página. */
document.querySelector(".salto-contenido").href = window.location.href.split("#")[0] + "#contenido";
