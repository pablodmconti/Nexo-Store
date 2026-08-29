/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/catalogo.js - Catálogo dinámico (Sprint 2 · 23/8)
   ---------------------------------------------------------------------
   Este archivo recorre el arreglo "productos" definido en
   js/productos.js y genera una tarjeta por cada uno dentro de
   catalogo.html. Las tarjetas ya no están escritas en el HTML: el
   HTML solo aporta el contenedor vacío.

   Depende de que js/productos.js se cargue antes que este archivo.
   ===================================================================== */

/* Formato de precio en pesos uruguayos: 21900 -> "$ 21.900" */
const formatoPrecio = new Intl.NumberFormat("es-UY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const mostrarPrecio = (precio) => `$ ${formatoPrecio.format(precio)}`;

/* Traduce el número de stock a un texto y a una clase de color.
   Se devuelve un objeto para no repetir la decisión en dos lugares. */
const describirStock = (stock) => {
  if (stock === 0) {
    return { texto: "Sin stock", clase: "agotado" };
  }
  if (stock <= 5) {
    return { texto: `Últimas ${stock} unidades`, clase: "limitado" };
  }
  return { texto: `En stock · ${stock} unidades`, clase: "disponible" };
};

/* Construye el elemento <article> completo de un producto */
const crearTarjeta = (producto) => {
  const disponibilidad = describirStock(producto.stock);

  const columna = document.createElement("article");
  columna.className = "col-md-6 col-xl-3";
  columna.dataset.id = producto.id;

  columna.innerHTML = `
    <div class="card h-100 tarjeta-producto">
      <img src="${producto.imagen}" class="card-img-top" alt="${producto.imagenAlt}"
           onerror="this.onerror=null; this.src='assets/img/producto-placeholder.svg'">
      <div class="card-body d-flex flex-column">
        <span class="etiqueta-seccion">${producto.categoria}</span>
        <h3 class="h5 card-title">${producto.nombre}</h3>
        <p class="card-text texto-suave small">${producto.descripcion}</p>
        <p class="disponibilidad ${disponibilidad.clase}">${disponibilidad.texto}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
          <span class="precio">${mostrarPrecio(producto.precio)}</span>
          <a class="btn btn-primary btn-sm" href="producto.html?id=${producto.id}"
             aria-label="Ver el producto ${producto.nombre}">Ver producto</a>
        </div>
      </div>
    </div>
  `;

  return columna;
};

/* Recorre el arreglo recibido y deja las tarjetas dentro del contenedor */
const mostrarProductos = (lista, contenedor) => {
  contenedor.innerHTML = "";

  lista.forEach((producto) => {
    contenedor.appendChild(crearTarjeta(producto));
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector("#grillaCatalogo");
  const contador = document.querySelector("#contadorCatalogo");

  if (!contenedor) return;

  mostrarProductos(productos, contenedor);

  if (contador) {
    contador.textContent = `${productos.length} productos en el catálogo`;
  }
});
