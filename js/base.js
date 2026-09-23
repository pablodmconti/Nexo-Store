/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/base.js - Comportamiento común de todas las páginas
   ---------------------------------------------------------------------
   Sprint 1 · navegación activa y avisos de la interfaz.
   Sprint 2 · 13/9 · funciones que usan el catálogo, la ficha y el
              carrito, más el carrito guardado en LocalStorage.
   Sprint 3 · 20/9 · se quita el aviso provisorio del botón Ingresar,
              que ahora resuelve js/modules/navbar.js con Firebase.

   Este archivo se carga en todas las páginas del sitio y antes que
   los demás, así que lo que está acá está disponible para todos.

   Contenidos de clase utilizados:
     Semana 5 · const y let, funciones, if / else, ===, template
               literals, objetos, arrays, forEach(), find(), push()
     Semana 6 · querySelector(), textContent, addEventListener()
     Semana 8 · localStorage.setItem(), localStorage.getItem(),
               JSON.stringify(), JSON.parse(), valor por defecto || []
   ===================================================================== */

/* ---------------------------------------------------------------
   1. AVISOS DE LA INTERFAZ
   Un único lugar para mostrar mensajes, con el componente Toast de
   Bootstrap que ya se usaba en el Sprint 1.
   --------------------------------------------------------------- */
function mostrarAviso(texto) {
  const toast = document.querySelector("#appToast");
  const mensaje = document.querySelector("#toastMessage");

  if (!toast || !mensaje) return;

  mensaje.textContent = texto;
  bootstrap.Toast.getOrCreateInstance(toast).show();
}

/* ---------------------------------------------------------------
   2. FORMATO DE PRECIO Y TEXTO DE STOCK
   Antes estaban repetidos en catalogo.js y en producto.js. Al vivir
   acá, el catálogo, la ficha y el carrito muestran siempre lo mismo
   y se corrigen en un solo lugar.
   --------------------------------------------------------------- */

/* Devuelve el precio con el formato de la tienda: 21900 -> "$ 21.900" */
function formatearPrecio(precio) {
  return "$ " + precio.toLocaleString("es-UY");
}

/* Traduce el stock a un mensaje y a una clase de color.
   Devuelve un objeto con las dos cosas, porque quien lo llama
   necesita las dos: { texto: "Sin stock", clase: "agotado" } */
function describirStock(stock) {
  let disponibilidad;

  if (stock === 0) {
    disponibilidad = { texto: "Sin stock", clase: "agotado" };
  } else if (stock <= 5) {
    disponibilidad = { texto: `Últimas ${stock} unidades`, clase: "limitado" };
  } else {
    disponibilidad = { texto: `En stock · ${stock} unidades`, clase: "disponible" };
  }

  return disponibilidad;
}

/* ---------------------------------------------------------------
   3. EL CARRITO GUARDADO EN LOCALSTORAGE
   ---------------------------------------------------------------
   El carrito es un array de objetos con la forma:
     [ { idProducto: "p1", cantidad: 2 }, { idProducto: "p4", cantidad: 1 } ]

   Guarda solamente el id y la cantidad: el nombre, el precio y el
   stock se buscan en el array "productos" cada vez que hacen falta,
   así la información no queda duplicada ni desactualizada.
   --------------------------------------------------------------- */

/* Nombre de la "caja" donde el navegador guarda el carrito */
const CLAVE_CARRITO = "carritoNivel99";

/* Lee el carrito. La primera vez todavía no hay nada guardado:
   getItem() devuelve null, JSON.parse(null) también, y el || []
   deja igual un array vacío para poder trabajar. */
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
}

/* Guarda el carrito. LocalStorage solo entiende texto, por eso el
   array se convierte con JSON.stringify() antes de guardarlo. */
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  actualizarContadorCarrito();
}

/* Suma las cantidades de todos los ítems: 2 teclados + 1 monitor = 3 */
function contarUnidades() {
  const carrito = obtenerCarrito();
  let unidades = 0;

  carrito.forEach((item) => {
    unidades += item.cantidad;
  });

  return unidades;
}

/* Refresca el número del ícono del carrito de la barra superior */
function actualizarContadorCarrito() {
  const contador = document.querySelector(".badge-carrito");

  if (!contador) return;

  contador.textContent = contarUnidades();
}

/* Agrega un producto al carrito, desde el catálogo o desde la ficha.
   Si el producto ya estaba, suma una unidad; si no, entra como nuevo.
   El stock vive en el array "productos", así que hay que combinar los
   dos arrays para saber si todavía queda disponibilidad. */
function agregarAlCarrito(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === idProducto);

  /* Cuántas unidades de ese producto ya hay reservadas en el carrito */
  let cantidadEnCarrito = 0;

  if (item) {
    cantidadEnCarrito = item.cantidad;
  }

  /* Control de stock: no se puede vender más de lo que hay.
     Si el producto está agotado, 0 >= 0 y tampoco deja agregar. */
  if (cantidadEnCarrito >= producto.stock) {
    mostrarAviso(`No hay más stock disponible de ${producto.nombre}.`);
  } else {
    if (item) {
      item.cantidad++;
    } else {
      carrito.push({ idProducto: producto.id, cantidad: 1 });
    }

    guardarCarrito(carrito);
    mostrarAviso(`${producto.nombre} se agregó al carrito.`);
  }
}

/* ---------------------------------------------------------------
   4. ARRANQUE DE LA INTERFAZ
   --------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const paginaActual = document.body.dataset.page;

  /* Marca visualmente el enlace de la página que se está visitando */
  document.querySelectorAll(".nav-link[data-page]").forEach((enlace) => {
    const esActual = enlace.dataset.page === paginaActual;
    enlace.classList.toggle("active", esActual);
    if (esActual) {
      enlace.setAttribute("aria-current", "page");
    } else {
      enlace.removeAttribute("aria-current");
    }
  });

  /* El número del carrito se muestra en todas las páginas */
  actualizarContadorCarrito();

  /* El botón "Ingresar" y el menú de la cuenta los maneja
     js/modules/navbar.js desde el Sprint 3 (20/9). */

  /* Modal informativo de la página de inicio */
  document.querySelector("#btnProjectInfo")?.addEventListener("click", () => {
    const modal = document.querySelector("#projectInfoModal");
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  });
});
