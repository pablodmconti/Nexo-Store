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
   Desde el Sprint 3 recibe el producto completo, recién consultado en
   Firestore (ver js/modules/agregar-carrito.js), así el control se
   hace con el stock y la disponibilidad actuales. */
function agregarAlCarrito(producto) {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === producto.id);

  /* Cuántas unidades de ese producto ya hay reservadas en el carrito */
  let cantidadEnCarrito = 0;

  if (item) {
    cantidadEnCarrito = item.cantidad;
  }

  /* 1. Un producto desactivado no se vende, aunque tenga stock.
     2. Control de stock: no se puede vender más de lo que hay.
        Si el producto está agotado, 0 >= 0 y tampoco deja agregar. */
  if (!producto.disponible) {
    mostrarAviso(`${producto.nombre} no está disponible por el momento.`);
  } else if (cantidadEnCarrito >= producto.stock) {
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

/* Costo de envío simulado, con las mismas condiciones que anuncia la
   portada: gratis a partir de cierto monto y con costo fijo por debajo.
   Está acá (y no en carrito.js) porque lo usan el resumen del carrito
   y el registro del pedido en js/modules/pedidos.js. */
const MONTO_ENVIO_GRATIS = 2000;
const COSTO_ENVIO = 290;

function calcularEnvio(subtotal) {
  let envio = COSTO_ENVIO;

  if (subtotal >= MONTO_ENVIO_GRATIS) {
    envio = 0;
  }

  return envio;
}

/* ---------------------------------------------------------------
   4. ESTADOS DE CARGA Y MENSAJES (Sprint 3)
   Firestore demora un momento y puede fallar. Estas dos funciones
   devuelven el HTML del aviso, para que el catálogo, el inicio, la
   ficha y el carrito muestren los estados de la misma forma.
   --------------------------------------------------------------- */

/* Rueda de carga de Bootstrap con un texto debajo */
function htmlCargando(texto) {
  return `
    <div class="col-12 estado-carga" role="status">
      <div class="spinner-border text-primary" aria-hidden="true"></div>
      <p class="texto-suave mt-3 mb-0">${texto}</p>
    </div>
  `;
}

/* Recuadro con un mensaje (sin productos, error de conexión...) */
function htmlMensaje(texto) {
  return `
    <div class="col-12">
      <p class="sin-resultados">${texto}</p>
    </div>
  `;
}

/* ---------------------------------------------------------------
   TEXTO ESCRITO POR UN USUARIO DENTRO DE innerHTML (Sprint 4)
   ---------------------------------------------------------------
   innerHTML interpreta las etiquetas: si un cliente se registra con
   un nombre como <img src=x onerror="..."> y ese nombre se inserta
   tal cual en el panel, el código se ejecutaría en la sesión del
   administrador. escaparHtml() reemplaza los caracteres especiales
   por sus entidades, así el texto se ve igual pero nunca se ejecuta.
   Se usa con todo dato que haya escrito un usuario (los de un pedido,
   por ejemplo); donde se puede, se usa textContent, que ya es seguro. */
function escaparHtml(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* ---------------------------------------------------------------
   5. ARRANQUE DE LA INTERFAZ
   --------------------------------------------------------------- */

/* Mensajes que otra página puede pedir mostrar con ?aviso=clave.
   Solo se muestran los de esta lista: un texto escrito a mano en la
   URL no llega nunca a la pantalla. */
const AVISOS_URL = {
  "sin-permisos": "La sección Administración es solo para el equipo de Nivel 99. Te trajimos al inicio."
};

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

  /* Aviso que llega desde otra página por la URL (Semana 7), por
     ejemplo index.html?aviso=sin-permisos cuando un cliente intenta
     abrir admin.html */
  const avisoUrl = new URLSearchParams(window.location.search).get("aviso");

  if (AVISOS_URL[avisoUrl]) {
    mostrarAviso(AVISOS_URL[avisoUrl]);
  }

  /* El botón "Ingresar" y el menú de la cuenta los maneja
     js/modules/navbar.js desde el Sprint 3. */

  /* Modal informativo de la página de inicio */
  document.querySelector("#btnProjectInfo")?.addEventListener("click", () => {
    const modal = document.querySelector("#projectInfoModal");
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
  });
});
