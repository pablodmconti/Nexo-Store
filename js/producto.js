/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/producto.js - Detalle dinámico del producto (Sprint 2 · 6/9 y 13/9)
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
     Semana 8 · agregar al carrito desde la ficha

   Depende de que js/base.js y js/productos.js se carguen antes que
   este archivo: de ahí salen formatearPrecio(), describirStock() y
   agregarAlCarrito().
   ===================================================================== */

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

  /* El mensaje y el color del stock salen de describirStock(), en
     base.js, así la ficha y las tarjetas del catálogo dicen lo mismo */
  const stock = document.querySelector("#productoStock");
  const disponibilidad = describirStock(producto.stock);

  stock.textContent = disponibilidad.texto;
  stock.classList.add(disponibilidad.clase);

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
   AGREGAR AL CARRITO DESDE LA FICHA (13/9)
   ---------------------------------------------------------------
   El evento se conecta solamente si el producto existe: si el id de
   la URL era incorrecto, la ficha ni siquiera se muestra.
   agregarAlCarrito() está en base.js y se encarga del control de
   stock, de guardar en LocalStorage y de avisar al usuario. */
if (productoSeleccionado) {
  document.querySelector("#btnAgregarCarrito").addEventListener("click", () => {
    agregarAlCarrito(productoSeleccionado.id);
  });
}
