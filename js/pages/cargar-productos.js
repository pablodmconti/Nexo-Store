/* =====================================================================
Carga inicial de la colección productos
   ---------------------------------------------------------------------

   Recorre el arreglo "productos" de js/productos.js y guarda cada uno
   en Firestore con guardarProducto(). Se usa una sola vez para crear
   la colección; si se vuelve a ejecutar, actualiza los mismos
   documentos (p1 a p12) en lugar de crear copias.

   Los productos se guardan de a uno con await dentro de un for...of,
   así la lista muestra el avance en orden y, si uno falla, se sabe
   exactamente cuál fue.
   ===================================================================== */

import { guardarProducto } from "../modules/productos-firestore.js";

const btnCargar = document.querySelector("#btnCargarProductos");
const listaCarga = document.querySelector("#listaCarga");
const resultadoCarga = document.querySelector("#resultadoCarga");

document.querySelector("#totalProductos").textContent = productos.length;

/* Explica los errores más comunes de Firestore en esta carga */
const MOTIVOS_ERROR = {
  "not-found": "La base de datos de Firestore todavía no existe. Creala en la consola: Firestore Database → Crear base de datos.",
  "permission-denied": "Las reglas de Firestore no permiten escribir. En la consola, Firestore Database → Reglas, dejá la base en modo de prueba.",
  "failed-precondition": "La base de datos de Firestore todavía no existe o no terminó de crearse. Revisala en la consola.",
  "unavailable": "No hay conexión con Firestore. Revisá tu internet y volvé a intentar."
};

function mostrarResultado(texto, tipo) {
  resultadoCarga.textContent = texto;
  resultadoCarga.className = `alert alert-${tipo} mt-4`;
}

btnCargar.addEventListener("click", async () => {
  btnCargar.disabled = true;
  btnCargar.textContent = "Cargando…";
  listaCarga.innerHTML = "";
  resultadoCarga.className = "d-none";

  let guardados = 0;
  let conError = 0;
  let ultimoError = null;

  for (const producto of productos) {
    const fila = document.createElement("li");
    fila.textContent = `${producto.id} · ${producto.nombre} — guardando…`;
    listaCarga.appendChild(fila);

    try {
      await guardarProducto(producto);
      fila.textContent = `${producto.id} · ${producto.nombre} — guardado ✓`;
      fila.classList.add("carga-ok");
      guardados++;
    } catch (error) {
      console.error(`Error al guardar ${producto.id}:`, error);
      fila.textContent = `${producto.id} · ${producto.nombre} — no se pudo guardar`;
      fila.classList.add("carga-error");
      conError++;
      ultimoError = error;
    }
  }

  if (conError === 0) {
    mostrarResultado(`Listo: ${guardados} productos guardados en la colección productos.`, "success");
  } else {
    const motivo = MOTIVOS_ERROR[ultimoError.code] || "Revisá la conexión y que la base de Firestore esté creada.";
    mostrarResultado(`Se guardaron ${guardados} productos y fallaron ${conError}. ${motivo} (código: ${ultimoError.code})`, "danger");
  }

  btnCargar.disabled = false;
  btnCargar.textContent = "Volver a cargar";
});
