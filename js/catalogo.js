/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/catalogo.js - Catálogo dinámico (Sprint 2 · 23/8 y 30/8)
   ---------------------------------------------------------------------
   Genera las tarjetas del catálogo a partir del array "productos" de
   js/productos.js, y permite buscarlas por nombre y filtrarlas por
   categoría sin recargar la página.

   Contenidos de clase utilizados:
     Semana 5 · const y let, funciones, funciones flecha, template
               literals, if / else, ===, push(), includes(),
               arrays de objetos, forEach(), filter()
     Semana 6 · querySelector(), innerHTML, textContent, value,
               mostrarProductos(), addEventListener(), preventDefault(),
               toLowerCase() + includes() para buscar

   Depende de que js/productos.js se cargue antes que este archivo.
   ===================================================================== */

/* ---------------------------------------------------------------
   1. MOSTRAR PRODUCTOS
   --------------------------------------------------------------- */

/* Devuelve el precio con el formato de la tienda: 21900 -> "$ 21.900" */
function formatearPrecio(precio) {
  return "$ " + precio.toLocaleString("es-UY");
}

/* Genera todas las tarjetas del catálogo a partir de un array de productos.
   Recibe el array por parámetro, así la misma función sirve tanto para
   mostrar el catálogo completo como el resultado de una búsqueda. */
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

/* Reemplaza las tarjetas por un aviso cuando la búsqueda no encuentra nada */
function mostrarSinResultados() {
  const contenedor = document.querySelector("#catalogo");

  contenedor.innerHTML = `
    <div class="col-12">
      <p class="sin-resultados">No se encontraron productos con esa búsqueda o esa categoría.
      Probá con otro nombre o volvé a ver todo el catálogo con el botón Limpiar.</p>
    </div>
  `;
}

/* Muestra arriba de la grilla cuántos productos se están viendo */
function mostrarContador(cantidad) {
  const contador = document.querySelector("#contadorCatalogo");
  contador.textContent = `Mostrando ${cantidad} de ${productos.length} productos`;
}

/* ---------------------------------------------------------------
   2. BÚSQUEDA Y FILTROS
   --------------------------------------------------------------- */

/* Completa el selector con las categorías que realmente existen en el
   array, para que la lista nunca quede desactualizada. Se recorre el
   array y se usa includes() para no repetir una categoría ya agregada. */
function cargarCategorias() {
  const selector = document.querySelector("#filtroCategoria");
  const categorias = [];

  productos.forEach((producto) => {
    if (!categorias.includes(producto.categoria)) {
      categorias.push(producto.categoria);
    }
  });

  categorias.forEach((categoria) => {
    selector.innerHTML += `<option value="${categoria}">${categoria}</option>`;
  });
}

/* Aplica la búsqueda y el filtro sobre el catálogo completo.
   Las dos condiciones se encadenan: cada filter() recibe el resultado
   del anterior, así se pueden combinar. filter() devuelve siempre un
   array nuevo, por lo que el array "productos" nunca se modifica. */
function aplicarFiltros() {
  const texto = document.querySelector("#buscador").value;
  const categoria = document.querySelector("#filtroCategoria").value;

  let resultado = productos;

  /* Búsqueda por nombre, sin distinguir mayúsculas de minúsculas */
  resultado = resultado.filter((producto) =>
    producto.nombre.toLowerCase().includes(texto.toLowerCase())
  );

  /* Filtro por categoría, salvo que esté elegida la opción "Todas" */
  if (categoria !== "Todas") {
    resultado = resultado.filter((producto) => producto.categoria === categoria);
  }

  if (resultado.length === 0) {
    mostrarSinResultados();
  } else {
    mostrarProductos(resultado);
  }

  mostrarContador(resultado.length);
}

/* Deja los controles como al principio y vuelve a mostrar todo */
function limpiarFiltros() {
  document.querySelector("#buscador").value = "";
  document.querySelector("#filtroCategoria").value = "Todas";
  aplicarFiltros();
}

/* ---------------------------------------------------------------
   3. EVENTOS
   --------------------------------------------------------------- */

/* input: se dispara con cada tecla, así el catálogo se filtra mientras
   se escribe, sin necesidad de apretar ningún botón */
document.querySelector("#buscador").addEventListener("input", () => {
  aplicarFiltros();
});

/* change: se dispara al elegir otra opción del selector */
document.querySelector("#filtroCategoria").addEventListener("change", () => {
  aplicarFiltros();
});

/* click: vuelve al catálogo completo */
document.querySelector("#btnLimpiar").addEventListener("click", () => {
  limpiarFiltros();
});

/* submit: si se aprieta Enter dentro del formulario, el navegador
   recargaría la página. preventDefault() lo evita. */
document.querySelector("#formFiltros").addEventListener("submit", (evento) => {
  evento.preventDefault();
  aplicarFiltros();
});

/* ---------------------------------------------------------------
   4. ARRANQUE
   ---------------------------------------------------------------
   Este archivo se carga al final del <body>, así que el HTML ya existe
   cuando se ejecutan estas líneas. */
cargarCategorias();
mostrarProductos(productos);
mostrarContador(productos.length);
