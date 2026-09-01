/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/producto.js - Detalle dinámico del producto (Sprint 2 · 6/9)
   ---------------------------------------------------------------------
   producto.html es una sola página que sirve para todos los productos.
   El identificador del producto viaja en la URL (producto.html?id=p1),
   se lee con URLSearchParams, se busca el objeto en el array con find()
   y el DOM se completa con esa información.

   Contenidos de clase utilizados:
     Semana 5 · const y let, funciones, if / else, ===, find()
     Semana 6 · querySelector(), textContent, classList
     Semana 7 · window.location.search, URLSearchParams, get(),
               find() por id, estructura HTML vacía completada por JS,
               mensaje cuando el producto no existe

   Depende de que js/productos.js se cargue antes que este archivo.
   ===================================================================== */

/* Devuelve el precio con el formato de la tienda: 21900 -> "$ 21.900" */
function formatearPrecio(precio) {
  return "$ " + precio.toLocaleString("es-UY");
}

/* Completa la ficha con los datos del producto encontrado */
function mostrarProducto(producto) {
  /* Imagen y texto alternativo */
  const imagen = document.querySelector("#productoImagen");
  imagen.src = producto.imagen;
  imagen.alt = producto.imagenAlt;

  /* Textos de la ficha */
  document.querySelector("#productoCategoria").textContent = producto.categoria;
  document.querySelector("#productoNombre").textContent = producto.nombre;
  document.querySelector("#productoDescripcion").textContent = producto.descripcion;
  document.querySelector("#productoPrecio").textContent = formatearPrecio(producto.precio);

  /* El stock se traduce a un mensaje y a una clase de color, igual que
     en las tarjetas del catálogo */
  const stock = document.querySelector("#productoStock");

  if (producto.stock === 0) {
    stock.textContent = "Sin stock";
    stock.classList.add("agotado");
  } else if (producto.stock <= 5) {
    stock.textContent = `Últimas ${producto.stock} unidades`;
    stock.classList.add("limitado");
  } else {
    stock.textContent = `En stock · ${producto.stock} unidades`;
    stock.classList.add("disponible");
  }

  /* Si no hay stock, no tiene sentido dejar el botón de compra activo */
  if (producto.stock === 0) {
    const boton = document.querySelector("#btnAgregarCarrito");
    boton.textContent = "Sin stock por ahora";
    boton.disabled = true;
  }

  /* Recién ahora se muestra la ficha, ya completa */
  document.querySelector("#detalleProducto").classList.remove("d-none");
}

/* Muestra el aviso de producto inexistente en lugar de la ficha */
function mostrarMensajeError() {
  document.querySelector("#mensajeError").classList.remove("d-none");
}

/* ---------------------------------------------------------------
   RECORRIDO COMPLETO: de la URL al producto mostrado
   --------------------------------------------------------------- */

/* 1. Se leen los parámetros de la URL actual ("?id=p1") */
const parametros = new URLSearchParams(window.location.search);

/* 2. Se obtiene el valor del parámetro llamado "id" */
const idProducto = parametros.get("id");

/* 3. Se busca en el array el producto con ese id.
      find() devuelve undefined si ninguno coincide. */
const productoSeleccionado = productos.find(
  (producto) => producto.id === idProducto
);

/* 4. Según haya encontrado o no el producto, se muestra la ficha o el aviso */
if (productoSeleccionado) {
  mostrarProducto(productoSeleccionado);
} else {
  mostrarMensajeError();
}

/* ---------------------------------------------------------------
   AVISO DEL CARRITO (se reemplaza en la entrega del 13/9)
   --------------------------------------------------------------- */
document.querySelector("#btnAgregarCarrito").addEventListener("click", () => {
  document.querySelector("#toastMessage").textContent =
    "El carrito de compras se desarrolla en la última entrega del Sprint 2.";
  bootstrap.Toast.getOrCreateInstance(document.querySelector("#appToast")).show();
});
