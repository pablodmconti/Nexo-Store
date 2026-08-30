/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/catalogo.js - Catálogo dinámico (Sprint 2 · 23/8)
   ---------------------------------------------------------------------
   Recorre el array "productos" definido en js/productos.js y genera una
   tarjeta por cada uno dentro de catalogo.html. Las tarjetas ya no
   están escritas en el HTML: el HTML solo aporta el contenedor vacío.

   Contenidos de clase utilizados:
     Semana 5 · const, funciones, funciones flecha, template literals,
               if / else if / else, arrays de objetos, forEach()
     Semana 6 · querySelector(), innerHTML, textContent,
               la función mostrarProductos()

   Depende de que js/productos.js se cargue antes que este archivo.
   ===================================================================== */

/* Devuelve el precio con el formato de la tienda: 21900 -> "$ 21.900" */
function formatearPrecio(precio) {
  return "$ " + precio.toLocaleString("es-UY");
}

/* Genera todas las tarjetas del catálogo a partir de un array de productos.
   Recibe el array por parámetro (y no lo toma directamente de la variable
   global) para poder reutilizar la misma función cuando, en la próxima
   semana, haya que mostrar solo los productos buscados o filtrados. */
function mostrarProductos(productos) {
  const contenedor = document.querySelector("#catalogo");
  contenedor.innerHTML = "";

  productos.forEach((producto) => {
    /* El stock se traduce a un mensaje y a una clase de color */
    let textoStock = "";
    let claseStock = "";

    if (producto.stock === 0) {
      textoStock = "Sin stock";
      claseStock = "agotado";
    } else if (producto.stock <= 5) {
      textoStock = `Últimas ${producto.stock} unidades`;
      claseStock = "limitado";
    } else {
      textoStock = `En stock · ${producto.stock} unidades`;
      claseStock = "disponible";
    }

    contenedor.innerHTML += `
      <article class="col-md-6 col-xl-3">
        <div class="card h-100 tarjeta-producto">
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.imagenAlt}">
          <div class="card-body d-flex flex-column">
            <span class="etiqueta-seccion">${producto.categoria}</span>
            <h3 class="h5 card-title">${producto.nombre}</h3>
            <p class="card-text texto-suave small">${producto.descripcion}</p>
            <p class="disponibilidad ${claseStock}">${textoStock}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
              <span class="precio">${formatearPrecio(producto.precio)}</span>
              <a class="btn btn-primary btn-sm" href="producto.html?id=${producto.id}"
                 aria-label="Ver el producto ${producto.nombre}">Ver producto</a>
            </div>
          </div>
        </div>
      </article>
    `;
  });
}

/* Muestra arriba de la grilla cuántos productos se están viendo */
function mostrarContador(cantidad) {
  const contador = document.querySelector("#contadorCatalogo");
  contador.textContent = `${cantidad} productos en el catálogo`;
}

/* Este archivo se carga al final del <body>, así que el HTML ya existe
   cuando se ejecutan estas dos líneas. */
mostrarProductos(productos);
mostrarContador(productos.length);
