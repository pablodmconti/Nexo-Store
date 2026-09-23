/* =====================================================================
Productos destacados de la página de inicio
   ---------------------------------------------------------------------
   Las cuatro tarjetas destacadas estaban escritas a mano en index.html
   desde el Sprint 1. Ahora se generan desde el mismo arreglo que usa el
   catálogo, así el precio, el stock y la descripción no quedan
   duplicados en dos lugares ni se desactualizan.

   Depende de que js/base.js y js/productos.js se carguen antes que
   este archivo: de ahí salen formatearPrecio() y describirStock().
   ===================================================================== */

/* Los cuatro productos elegidos para la portada, uno por categoría */
const idsDestacados = ["p1", "p2", "p3", "p5"];

function mostrarDestacados() {
  const contenedor = document.querySelector("#grillaDestacados");

  /* Se queda solo con los productos cuyo id está en la lista de arriba */
  const destacados = productos.filter((producto) => idsDestacados.includes(producto.id));

  contenedor.innerHTML = "";

  destacados.forEach((producto) => {
    const disponibilidad = describirStock(producto.stock);

    contenedor.innerHTML += `
      <article class="col-md-6 col-xl-3">
        <div class="card h-100 tarjeta-producto">
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.imagenAlt}">
          <div class="card-body d-flex flex-column">
            <span class="etiqueta-seccion">${producto.categoria}</span>
            <h3 class="h5 card-title">${producto.nombre}</h3>
            <p class="card-text texto-suave small">${producto.descripcion}</p>
            <p class="disponibilidad ${disponibilidad.clase}">${disponibilidad.texto}</p>
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

/* Este archivo se carga al final del <body>, así que el contenedor ya existe */
mostrarDestacados();
