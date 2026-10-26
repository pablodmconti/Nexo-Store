/* =====================================================================
Carrito de compras
   ---------------------------------------------------------------------
   El carrito sigue guardado en LocalStorage con la forma
   { idProducto, cantidad }. Desde el Sprint 3 el nombre, el precio, la
   imagen y el stock de cada producto se toman de Cloud Firestore, así
   el carrito muestra siempre la información actual de la tienda.
   Desde el 11/10 el botón "Confirmar compra" registra el pedido.
   Desde el Sprint 4 se elige la forma de pago: con Mercado Pago el
   pedido se registra y se pasa a la pasarela simulada (pago.html).
   ===================================================================== */

import { auth } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerProductos } from "./modules/productos-firestore.js";
import { confirmarPedido } from "./modules/pedidos.js";

/* Productos de la tienda, tal como llegan de Firestore */
let productos = [];

/* Usuario autenticado (o null). Lo mantiene al día onAuthStateChanged() */
let usuarioActual = null;

/* ---------------------------------------------------------------
   1. CÁLCULOS
   --------------------------------------------------------------- */

/* Lo que cuesta un producto por la cantidad elegida */
function calcularSubtotal(producto, cantidad) {
  return producto.precio * cantidad;
}

/* Suma los subtotales de todo el carrito.
   reduce() recorre el arreglo arrastrando un acumulador: empieza en 0
   y en cada vuelta le suma el subtotal de ese ítem. */
function calcularTotal() {
  const carrito = obtenerCarrito();

  return carrito.reduce((total, item) => {
    const producto = productos.find((p) => p.id === item.idProducto);
    return total + calcularSubtotal(producto, item.cantidad);
  }, 0);
}

/* calcularEnvio() está en base.js: la usan este resumen y el pedido */

/* ---------------------------------------------------------------
   2. MOSTRAR EL CARRITO
   --------------------------------------------------------------- */

/* Actualiza el panel lateral con las unidades, el envío y el total */
function mostrarResumen() {
  const carrito = obtenerCarrito();
  const subtotal = calcularTotal();
  const envio = calcularEnvio(subtotal);

  document.querySelector("#resumenProductos").textContent = carrito.length;
  document.querySelector("#resumenUnidades").textContent = contarUnidades();
  document.querySelector("#resumenSubtotal").textContent = formatearPrecio(subtotal);

  /* Cuando el envío es gratis conviene decirlo con palabras, no con "$ 0" */
  if (envio === 0) {
    document.querySelector("#resumenEnvio").textContent = "Gratis";
  } else {
    document.querySelector("#resumenEnvio").textContent = formatearPrecio(envio);
  }

  document.querySelector("#resumenTotal").textContent = formatearPrecio(subtotal + envio);
}

/* Dibuja una fila por cada producto del carrito.
   Si el carrito está vacío, esconde la lista y muestra el aviso. */
function mostrarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.querySelector("#listaCarrito");
  const seccionCarrito = document.querySelector("#carritoConProductos");
  const seccionVacio = document.querySelector("#carritoVacio");

  if (carrito.length === 0) {
    seccionCarrito.classList.add("d-none");
    seccionVacio.classList.remove("d-none");
    return;
  }

  seccionCarrito.classList.remove("d-none");
  seccionVacio.classList.add("d-none");

  contenedor.innerHTML = "";

  carrito.forEach((item) => {
    /* find() vuelve a aparecer: es la forma de unir los dos arreglos */
    const producto = productos.find((p) => p.id === item.idProducto);
    const subtotal = calcularSubtotal(producto, item.cantidad);

    /* Si el administrador desactivó el producto, se avisa en la fila */
    let disponibilidad = describirStock(producto.stock);

    if (!producto.disponible) {
      disponibilidad = { texto: "No disponible por el momento", clase: "agotado" };
    }

    /* El botón "+" se apaga cuando ya se llegó al tope del stock
       o cuando el producto dejó de estar disponible */
    let sumarDeshabilitado = "";

    if (!producto.disponible || item.cantidad >= producto.stock) {
      sumarDeshabilitado = "disabled";
    }

    contenedor.innerHTML += `
      <article class="fila-carrito">
        <img class="imagen-carrito" src="${producto.imagenes[0]}" alt="${producto.imagenAlt}">
        <div class="datos-carrito">
          <span class="etiqueta-seccion">${producto.categoria}</span>
          <h2 class="h6 nombre-carrito">${producto.nombre}</h2>
          <p class="disponibilidad ${disponibilidad.clase}">${disponibilidad.texto}</p>
          <p class="precio-unitario">${formatearPrecio(producto.precio)} por unidad</p>
        </div>
        <div class="acciones-carrito">
          <div class="control-cantidad">
            <button class="btn-cantidad restar" type="button" data-id="${producto.id}"
                    aria-label="Quitar una unidad de ${producto.nombre}">&minus;</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad sumar" type="button" data-id="${producto.id}" ${sumarDeshabilitado}
                    aria-label="Agregar una unidad de ${producto.nombre}">+</button>
          </div>
          <span class="precio subtotal-carrito">${formatearPrecio(subtotal)}</span>
          <button class="btn-eliminar" type="button" data-id="${producto.id}"
                  aria-label="Eliminar ${producto.nombre} del carrito">Eliminar</button>
        </div>
      </article>
    `;
  });

  conectarBotonesDeLasFilas();
  mostrarResumen();
}

/* ---------------------------------------------------------------
   3. MODIFICAR EL CARRITO
   --------------------------------------------------------------- */

/* Suma una unidad, siempre que quede stock del producto */
function aumentarCantidad(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === idProducto);

  if (!producto.disponible) {
    mostrarAviso(`${producto.nombre} no está disponible por el momento.`);
  } else if (item.cantidad < producto.stock) {
    item.cantidad++;
    guardarCarrito(carrito);
    mostrarCarrito();
  } else {
    mostrarAviso(`No hay más stock disponible de ${producto.nombre}.`);
  }
}

/* Resta una unidad. Si quedaba una sola, tiene más sentido sacar el
   producto del carrito que dejarlo en 0. */
function disminuirCantidad(idProducto) {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === idProducto);

  if (item.cantidad > 1) {
    item.cantidad--;
    guardarCarrito(carrito);
    mostrarCarrito();
  } else {
    eliminarDelCarrito(idProducto);
  }
}

/* Quita el producto entero. filter() devuelve un arreglo nuevo con
   todos los ítems menos el que se quiere sacar. */
function eliminarDelCarrito(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  let carrito = obtenerCarrito();

  carrito = carrito.filter((i) => i.idProducto !== idProducto);

  guardarCarrito(carrito);
  mostrarCarrito();
  mostrarAviso(`${producto.nombre} se quitó del carrito.`);
}

/* Deja el carrito en cero guardando un arreglo vacío */
function vaciarCarrito() {
  guardarCarrito([]);
  mostrarCarrito();
  mostrarAviso("El carrito quedó vacío.");
}

/* ---------------------------------------------------------------
   4. EVENTOS
   --------------------------------------------------------------- */

/* Los botones de cada fila se crean junto con la fila, así que los
   eventos se conectan después de dibujarlas. El id del producto viaja
   en data-id y se lee con dataset.id. */
function conectarBotonesDeLasFilas() {
  document.querySelectorAll(".sumar").forEach((boton) => {
    boton.addEventListener("click", () => {
      aumentarCantidad(boton.dataset.id);
    });
  });

  document.querySelectorAll(".restar").forEach((boton) => {
    boton.addEventListener("click", () => {
      disminuirCantidad(boton.dataset.id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => {
      eliminarDelCarrito(boton.dataset.id);
    });
  });
}

/* Estos dos botones sí están en el HTML desde el principio */
document.querySelector("#btnVaciar").addEventListener("click", () => {
  vaciarCarrito();
});

/* ---------------------------------------------------------------
   CONFIRMAR LA COMPRA
   --------------------------------------------------------------- */
const btnConfirmar = document.querySelector("#btnConfirmar");
const mensajeCompra = document.querySelector("#mensajeCompra");

/* Muestra un mensaje dentro del panel de resumen.
   tipo: "warning", "danger"... (colores de alerta de Bootstrap) */
function mostrarMensajeCompra(html, tipo) {
  mensajeCompra.innerHTML = html;
  mensajeCompra.className = `alert alert-${tipo} mt-3 mb-0 small`;
}

function ocultarMensajeCompra() {
  mensajeCompra.className = "d-none";
}

/* El botón cambia según haya o no una sesión */
onAuthStateChanged(auth, (usuario) => {
  usuarioActual = usuario;

  if (usuario) {
    btnConfirmar.textContent = "Confirmar compra";
    ocultarMensajeCompra();
  } else {
    btnConfirmar.textContent = "Ingresá para comprar";
  }
});

/* Pantalla final: la compra quedó registrada */
function mostrarCompraConfirmada(resultado) {
  document.querySelector("#carritoConProductos").classList.add("d-none");
  document.querySelector("#carritoVacio").classList.add("d-none");

  /* Los primeros 6 caracteres del id alcanzan como número de pedido */
  document.querySelector("#numeroPedido").textContent = resultado.idPedido.slice(0, 6).toUpperCase();
  document.querySelector("#totalPedido").textContent = formatearPrecio(resultado.total);
  const confirmacion = document.querySelector("#compraConfirmada");
  confirmacion.classList.remove("d-none");
  confirmacion.scrollIntoView({ behavior: "smooth", block: "center" });
}

btnConfirmar.addEventListener("click", async () => {
  ocultarMensajeCompra();

  /* 1. Sin sesión no hay compra: se ofrece ingresar y volver acá */
  if (!usuarioActual) {
    mostrarMensajeCompra(
      `Para confirmar la compra tenés que iniciar sesión.
       <a class="alert-link" href="login.html?volver=carrito.html">Ingresar o crear una cuenta</a>`,
      "warning"
    );
    return;
  }

  /* Forma de pago elegida: el botón de radio marcado del grupo */
  const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;

  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "Confirmando compra…";

  let resultado;

  try {
    /* 2. pedidos.js revisa stock y disponibilidad actuales, calcula el
          total, guarda el pedido y descuenta el stock en un solo lote */
    resultado = await confirmarPedido(usuarioActual, obtenerCarrito(), metodoPago);
  } catch (error) {
    console.error("Error al confirmar la compra:", error);
    mostrarMensajeCompra("No pudimos registrar la compra. Revisá tu conexión y volvé a intentar: tu carrito sigue guardado.", "danger");
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Confirmar compra";
    return;
  }

  if (!resultado.confirmado) {
    /* 3. Algo cambió en la tienda: se explica qué y se actualiza el
          carrito con los datos nuevos. El carrito NO se vacía. */
    let lista = "";

    resultado.problemas.forEach((problema) => {
      lista += `<li>${problema}</li>`;
    });

    mostrarMensajeCompra(`No pudimos confirmar la compra:<ul class="mb-0 mt-2">${lista}</ul>Ajustá el carrito y volvé a intentar.`, "warning");

    try {
      productos = await obtenerProductos();
      quitarProductosInexistentes();
      mostrarCarrito();
    } catch (error) {
      console.error("Error al actualizar el carrito:", error);
    }

    btnConfirmar.disabled = false;
    btnConfirmar.textContent = "Confirmar compra";
    return;
  }

  /* 4. Todo salió bien: recién ahora se vacía el carrito */
  guardarCarrito([]);

  /* 5. Con Mercado Pago el pedido ya quedó reservado y se pasa a la
        pasarela simulada, con el id del pedido en la URL (Semana 7) */
  if (metodoPago === "mercadopago") {
    window.location.href = `pago.html?pedido=${resultado.idPedido}`;
    return;
  }

  mostrarCompraConfirmada(resultado);
});

/* ---------------------------------------------------------------
   5. ARRANQUE
   ---------------------------------------------------------------
   Se lee lo que haya quedado guardado en LocalStorage y se piden a
   Firestore los datos actuales de los productos. */

/* Si un producto guardado en el carrito ya no existe en la tienda,
   se lo quita para que no rompa los cálculos */
function quitarProductosInexistentes() {
  const carrito = obtenerCarrito();
  const vigentes = carrito.filter((item) =>
    productos.find((p) => p.id === item.idProducto)
  );

  if (vigentes.length < carrito.length) {
    guardarCarrito(vigentes);
    mostrarAviso("Quitamos del carrito productos que ya no están en la tienda.");
  }
}

async function iniciarCarrito() {
  const estado = document.querySelector("#estadoCarrito");

  /* Con el carrito vacío no hace falta consultar nada */
  if (obtenerCarrito().length === 0) {
    mostrarCarrito();
    return;
  }

  estado.innerHTML = htmlCargando("Cargando tu carrito…");

  try {
    productos = await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar los productos del carrito:", error);
    estado.innerHTML = htmlMensaje("No pudimos cargar los datos de tu carrito. Revisá tu conexión a internet y recargá la página. Tus productos siguen guardados.");
    return;
  }

  estado.innerHTML = "";
  quitarProductosInexistentes();
  mostrarCarrito();
}

iniciarCarrito();
