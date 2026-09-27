/* =====================================================================
Productos destacados de la página de inicio
   ---------------------------------------------------------------------
   Las cuatro tarjetas destacadas estaban escritas a mano en index.html
   desde el Sprint 1. Ahora se generan desde el mismo arreglo que usa el
   catálogo, así el precio, el stock y la descripción no quedan
   duplicados en dos lugares ni se desactualizan.

   Desde el Sprint 3 los productos llegan de Cloud Firestore.
   formatearPrecio(), describirStock(), htmlCargando() y htmlMensaje()
   salen de js/base.js, que se carga antes que este archivo.
   ===================================================================== */

import { obtenerProductos } from "./modules/productos-firestore.js";

/* Los cuatro productos elegidos para la portada, uno por categoría */
const idsDestacados = ["p1", "p2", "p3", "p5"];

/* Dibuja las tarjetas de los productos que recibe */
function mostrarDestacados(destacados) {
  const contenedor = document.querySelector("#grillaDestacados");

  contenedor.innerHTML = "";

  destacados.forEach((producto) => {
    const disponibilidad = describirStock(producto.stock);

    contenedor.innerHTML += `
      <article class="col-md-6 col-xl-3">
        <div class="card h-100 tarjeta-producto">
          <img src="${producto.imagenes[0]}" class="card-img-top" alt="${producto.imagenAlt}">
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

/* Pide los productos a Firestore y se queda con los destacados */
async function iniciarDestacados() {
  const contenedor = document.querySelector("#grillaDestacados");
  contenedor.innerHTML = htmlCargando("Cargando productos destacados…");

  let productos;

  try {
    productos = await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar los destacados:", error);
    contenedor.innerHTML = htmlMensaje("No pudimos cargar los productos destacados. Mientras tanto, podés recorrer el catálogo.");
    return;
  }

  /* Solo los que están en la lista de arriba y siguen activos */
  const destacados = productos.filter((producto) =>
    idsDestacados.includes(producto.id) && producto.disponible
  );

  if (destacados.length === 0) {
    contenedor.innerHTML = htmlMensaje("Pronto vas a encontrar acá nuestros productos destacados.");
    return;
  }

  mostrarDestacados(destacados);
}

iniciarDestacados();
