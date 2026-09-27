/* =====================================================================
Catálogo de productos
   ---------------------------------------------------------------------
   Desde el Sprint 3 los productos se obtienen de la colección
   "productos" de Cloud Firestore. Una vez que llegan, vuelven a ser un
   array común, así que la búsqueda, el filtro y el orden del Sprint 2
   funcionan sin cambios.
   ===================================================================== */

import { obtenerProductos } from "./modules/productos-firestore.js";
import { agregarConValidacion } from "./modules/agregar-carrito.js";

/* Productos que se pueden vender, tal como llegaron de Firestore.
   Empieza vacío y se completa en iniciarCatalogo(). */
let productos = [];

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

    if (producto.stock <= 0) {
      textoBoton = "Sin stock";
      botonDeshabilitado = "disabled";
    }

    contenedor.innerHTML += `
      <article class="col-md-6 col-xl-3">
        <div class="card h-100 tarjeta-producto">
          <img src="${producto.imagenes[0]}" class="card-img-top" alt="${producto.imagenAlt}">
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
     atributo data-id de cada botón y se lee con dataset.id.
     agregarConValidacion() vuelve a consultar el producto en Firestore
     antes de agregarlo, por si el stock cambió. */
  document.querySelectorAll(".btn-agregar").forEach((boton) => {
    boton.addEventListener("click", () => {
      agregarConValidacion(boton.dataset.id, boton);
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
  } else {
    /* "Orden de la tienda": p1, p2, p3... Firestore entrega los
       documentos ordenados por id como TEXTO (p1, p10, p11, p2...),
       por eso se compara el número que viene después de la "p". */
    lista.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
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

  /* Búsqueda por nombre o descripción, sin distinguir mayúsculas
     de minúsculas: alcanza con que el texto aparezca en uno de los dos */
  const buscado = texto.toLowerCase();

  resultado = resultado.filter((producto) =>
    producto.nombre.toLowerCase().includes(buscado) ||
    producto.descripcion.toLowerCase().includes(buscado)
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
   4. ARRANQUE: PEDIR LOS PRODUCTOS A FIRESTORE
   --------------------------------------------------------------- */

/* Los controles de búsqueda no sirven hasta que llegan los productos */
function habilitarFiltros(habilitar) {
  document.querySelectorAll("#formFiltros input, #formFiltros select, #formFiltros button").forEach((control) => {
    control.disabled = !habilitar;
  });
}

async function iniciarCatalogo() {
  const contenedor = document.querySelector("#catalogo");
  const contador = document.querySelector("#contadorCatalogo");

  /* Estado de carga: la grilla no queda en blanco mientras se espera */
  habilitarFiltros(false);
  contador.textContent = "Cargando productos…";
  contenedor.innerHTML = htmlCargando("Cargando productos desde la tienda…");

  try {
    const todos = await obtenerProductos();

    /* Solo se muestran los productos activos (disponible: true) */
    productos = todos.filter((producto) => producto.disponible);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    contador.textContent = "";
    contenedor.innerHTML = htmlMensaje("No pudimos cargar los productos. Revisá tu conexión a internet y recargá la página.");
    return;
  }

  if (productos.length === 0) {
    contador.textContent = "";
    contenedor.innerHTML = htmlMensaje("Todavía no hay productos disponibles en la tienda. Volvé a visitarnos pronto.");
    return;
  }

  cargarCategorias();
  habilitarFiltros(true);
  aplicarFiltros();
}

iniciarCatalogo();
