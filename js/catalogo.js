/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/catalogo.js - Catálogo dinámico (Sprint 2 · 23/8, 30/8 y 13/9)
   ---------------------------------------------------------------------
   Genera las tarjetas del catálogo a partir del array "productos" de
   js/productos.js, permite buscarlas por nombre, filtrarlas por
   categoría y ordenarlas sin recargar la página, y agregar cualquiera
   de ellas al carrito desde la propia tarjeta.

   Contenidos de clase utilizados:
     Semana 5 · const y let, funciones, funciones flecha, template
               literals, if / else, ===, push(), includes(),
               arrays de objetos, forEach(), filter(), sort()
     Semana 6 · querySelector(), innerHTML, textContent, value,
               mostrarProductos(), addEventListener(), preventDefault(),
               toLowerCase() + includes() para buscar
     Semana 8 · eventos en botones creados dinámicamente y data-id

   Depende de que js/base.js y js/productos.js se carguen antes que
   este archivo: de ahí salen formatearPrecio(), describirStock() y
   agregarAlCarrito().
   ===================================================================== */

/* ---------------------------------------------------------------
   1. MOSTRAR PRODUCTOS
   --------------------------------------------------------------- */

/* Genera todas las tarjetas del catálogo a partir de un array de productos.
   Recibe el array por parámetro, así la misma función sirve tanto para
   mostrar el catálogo completo como el resultado de una búsqueda. */
function mostrarProductos(productos) {
  const contenedor = document.querySelector("#catalogo");
  contenedor.innerHTML = "";

  productos.forEach((producto) => {
    /* El mensaje y el color del stock los arma describirStock(), en base.js */
    const disponibilidad = describirStock(producto.stock);

    /* Un producto agotado se muestra igual, pero sin poder agregarse */
    let textoBoton = "Agregar al carrito";
    let botonDeshabilitado = "";

    if (producto.stock === 0) {
      textoBoton = "Sin stock";
      botonDeshabilitado = "disabled";
    }

    contenedor.innerHTML += `
      <article class="col-md-6 col-xl-3">
        <div class="card h-100 tarjeta-producto">
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.imagenAlt}">
          <div class="card-body d-flex flex-column">
            <span class="etiqueta-seccion">${producto.categoria}</span>
            <h3 class="h5 card-title">${producto.nombre}</h3>
            <p class="card-text texto-suave small">${producto.descripcion}</p>
            <p class="disponibilidad ${disponibilidad.clase}">${disponibilidad.texto}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                <span class="precio">${formatearPrecio(producto.precio)}</span>
                <a class="btn btn-outline-primary btn-sm" href="producto.html?id=${producto.id}"
                   aria-label="Ver el producto ${producto.nombre}">Ver producto</a>
              </div>
              <button class="btn btn-primary btn-sm w-100 btn-agregar" type="button"
                      data-id="${producto.id}" ${botonDeshabilitado}
                      aria-label="Agregar ${producto.nombre} al carrito">${textoBoton}</button>
            </div>
          </div>
        </div>
      </article>
    `;
  });

  /* Los botones no existían cuando se cargó la página: se crearon
     recién ahora, dentro del forEach. Por eso los eventos se conectan
     después de dibujar las tarjetas. El id del producto viaja en el
     atributo data-id de cada botón y se lee con dataset.id. */
  document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
      agregarAlCarrito(boton.dataset.id);
    });
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

/* Ordena la lista según lo elegido en el selector.
   Importante: sort() modifica el array que recibe, por eso acá se le
   pasa siempre el resultado de filter(), que es un array nuevo. El
   array "productos" original nunca se toca y conserva su orden. */
function ordenarProductos(lista) {
  const criterio = document.querySelector("#ordenCatalogo").value;

  if (criterio === "precioMenor") {
    lista.sort((a, b) => a.precio - b.precio);
  } else if (criterio === "precioMayor") {
    lista.sort((a, b) => b.precio - a.precio);
  } else if (criterio === "nombre") {
    /* Para textos no sirve la resta: se comparan con los mismos
       operadores de comparación que usamos con números. La función
       devuelve -1 si a va antes, 1 si va después y 0 si son iguales. */
    lista.sort((a, b) => {
      if (a.nombre < b.nombre) {
        return -1;
      } else if (a.nombre > b.nombre) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  return lista;
}

/* Aplica la búsqueda, el filtro y el orden sobre el catálogo completo.
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

  /* El orden se aplica al final, sobre lo que quedó filtrado */
  resultado = ordenarProductos(resultado);

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
  document.querySelector("#ordenCatalogo").value = "destacados";
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

/* change: se dispara al elegir otra opción de cualquiera de los dos selectores */
document.querySelector("#filtroCategoria").addEventListener("change", () => {
  aplicarFiltros();
});

document.querySelector("#ordenCatalogo").addEventListener("change", () => {
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
