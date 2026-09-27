/* =====================================================================
Agregar al carrito validando stock y disponibilidad
   ---------------------------------------------------------------------

   El stock puede cambiar en Firestore desde que se mostró la página
   (otra persona compró, el administrador desactivó el producto...).
   Por eso, antes de agregar, se vuelve a consultar el producto y se
   decide con los datos actuales.

   La usan el catálogo (botón de cada tarjeta) y la ficha del producto.
   ===================================================================== */

import { obtenerProducto } from "./productos-firestore.js";

export async function agregarConValidacion(idProducto, boton) {
  const textoOriginal = boton.textContent;

  /* Mientras se consulta, el botón no se puede volver a apretar */
  boton.disabled = true;
  boton.textContent = "Comprobando stock…";

  try {
    const producto = await obtenerProducto(idProducto);

    if (producto) {
      /* agregarAlCarrito() está en base.js: revisa disponible y stock
         contra lo que ya hay en el carrito, guarda y avisa */
      agregarAlCarrito(producto);
    } else {
      mostrarAviso("Este producto ya no está en la tienda.");
    }
  } catch (error) {
    console.error("Error al comprobar el stock:", error);
    mostrarAviso("No pudimos comprobar el stock. Revisá tu conexión y volvé a intentar.");
  }

  boton.disabled = false;
  boton.textContent = textoOriginal;
}
