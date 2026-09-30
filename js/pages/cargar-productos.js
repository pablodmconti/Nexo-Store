/* =====================================================================
Carga inicial de la colección productos
   ---------------------------------------------------------------------

   Página de un solo uso: toma el arreglo de js/productos.js
   como semilla y lo sube a Firestore en un único lote con writeBatch().
   Si se vuelve a ejecutar, actualiza los mismos documentos (p1 a p12)
   en lugar de crear copias.

   Antes de publicar el sitio (Sprint 4) esta página se elimina.
   ===================================================================== */

import { productos } from "../productos.js";
import { cargarProductos } from "../modules/productos-firestore.js";

const boton = document.querySelector("#btnCargarProductos");
const mensaje = document.querySelector("#mensaje");

document.querySelector("#totalProductos").textContent = productos.length;

/* Explica los errores más comunes de Firestore en esta carga */
const MOTIVOS_ERROR = {
  "not-found": "La base de datos de Firestore todavía no existe. Creala en la consola: Firestore Database → Crear base de datos.",
  "permission-denied": "Las reglas de Firestore no permiten escribir. Revisá la pestaña Reglas o iniciá sesión antes de cargar.",
  "failed-precondition": "La base de datos de Firestore todavía no existe o no terminó de crearse. Revisala en la consola.",
  "unavailable": "No hay conexión con Firestore. Revisá tu internet y volvé a intentar."
};

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo} mt-4 mb-0`;
}

boton.addEventListener("click", async () => {
  boton.disabled = true;
  mostrarMensaje("Cargando productos…", "info");

  try {
    await cargarProductos(productos);
    mostrarMensaje(`Productos cargados correctamente: ${productos.length} documentos en la colección productos.`, "success");
  } catch (error) {
    console.error("Error al cargar productos:", error);
    const motivo = MOTIVOS_ERROR[error.code] || "Revisá la conexión y que la base de Firestore esté creada.";
    mostrarMensaje(`No fue posible cargar los productos. ${motivo} (código: ${error.code})`, "danger");
  } finally {
    boton.disabled = false;
  }
});
