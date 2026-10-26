/* =====================================================================
Pago simulado con Mercado Pago (Sprint 4)
   ---------------------------------------------------------------------

   Imita el recorrido de Mercado Pago (Checkout Pro) sin conectarse a
   Mercado Pago:

     1. carrito.js registra el pedido y lleva a pago.html?pedido=ID
     2. Esta página muestra la "pasarela" con el total del pedido
     3. Cada botón vuelve a esta misma página con el resultado en la URL:
          pago.html?pedido=ID&estado=aprobado&operacion=SIM-1761500000000
        Mercado Pago real vuelve a la tienda de la misma forma, con
        parámetros como external_reference, status y payment_id.
     4. Con el estado en la URL, se guarda el resultado en el campo
        pago del pedido y se muestra el mensaje final.

   Una integración real necesita un servidor que guarde la clave
   privada de Mercado Pago (Access Token). Un sitio publicado en
   GitHub Pages no tiene servidor, por eso el pago se simula.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPedido, registrarPago } from "../modules/pedidos.js";

/* Parámetros de la URL (Semana 7) */
const parametros = new URLSearchParams(window.location.search);
const idPedido = parametros.get("pedido");
const estadoUrl = parametros.get("estado");       // "aprobado", "rechazado" o null
const operacionUrl = parametros.get("operacion"); // número de operación simulado

/* ---------------------------------------------------------------
   1. AYUDAS PARA LA INTERFAZ
   --------------------------------------------------------------- */

/* La página tiene cuatro bloques y se ve uno solo a la vez */
function mostrarSeccion(idSeccion) {
  ["pagoCargando", "pagoError", "pagoPasarela", "pagoResultado"].forEach((id) => {
    document.querySelector(`#${id}`).classList.toggle("d-none", id !== idSeccion);
  });
}

function mostrarError(texto) {
  document.querySelector("#textoPagoError").textContent = texto;
  mostrarSeccion("pagoError");
}

/* Los primeros 6 caracteres del id, como en el carrito y el perfil */
function numeroPedido(id) {
  return id.slice(0, 6).toUpperCase();
}

/* Solo se acepta un número de operación con la forma SIM-123456...
   (las reglas de Firestore hacen el mismo control) */
function operacionValida(texto) {
  return texto !== null
    && texto.startsWith("SIM-")
    && texto.length > 4
    && Number.isInteger(Number(texto.slice(4)));
}

/* ---------------------------------------------------------------
   2. PASARELA SIMULADA
   --------------------------------------------------------------- */
function mostrarPasarela(pedido) {
  const lista = document.querySelector("#pagoProductos");
  lista.innerHTML = "";

  pedido.productos.forEach((item) => {
    lista.innerHTML += `
      <li class="linea-pedido">
        <span>${item.nombre} <span class="texto-suave">× ${item.cantidad}</span></span>
        <span>${formatearPrecio(item.subtotal)}</span>
      </li>
    `;
  });

  if (pedido.envio > 0) {
    lista.innerHTML += `<li class="linea-pedido texto-suave"><span>Envío</span><span>${formatearPrecio(pedido.envio)}</span></li>`;
  }

  document.querySelector("#pagoNumero").textContent = numeroPedido(pedido.id);
  document.querySelector("#pagoTotal").textContent = formatearPrecio(pedido.total);
  mostrarSeccion("pagoPasarela");
}

/* Cada botón "vuelve" a la tienda con el resultado en la URL.
   El número de operación usa la fecha en milisegundos, que no se
   repite de un pago a otro: SIM-1761500000000 */
function simularPago(estado) {
  document.querySelector("#btnPagoAprobado").disabled = true;
  document.querySelector("#btnPagoRechazado").disabled = true;

  const operacion = `SIM-${Date.now()}`;
  window.location.href = `pago.html?pedido=${idPedido}&estado=${estado}&operacion=${operacion}`;
}

document.querySelector("#btnPagoAprobado").addEventListener("click", () => {
  simularPago("aprobado");
});

document.querySelector("#btnPagoRechazado").addEventListener("click", () => {
  simularPago("rechazado");
});

/* ---------------------------------------------------------------
   3. RESULTADO DEL PAGO
   --------------------------------------------------------------- */
function mostrarResultado(pedido, estado) {
  const icono = document.querySelector("#pagoIcono");
  const titulo = document.querySelector("#pagoTitulo");
  const texto = document.querySelector("#pagoTexto");
  const botones = document.querySelector("#pagoBotones");
  const numero = numeroPedido(pedido.id);

  if (estado === "aprobado") {
    icono.textContent = "✓";
    icono.className = "icono-confirmada";
    titulo.textContent = "¡Pago aprobado!";
    texto.textContent = `Registramos el pago del pedido #${numero} por ${formatearPrecio(pedido.total)}. Te vamos a escribir para coordinar la entrega.`;
    botones.innerHTML = `
      <a class="btn btn-primary" href="perfil.html">Ver mis pedidos</a>
      <a class="btn btn-outline-primary" href="catalogo.html">Seguir comprando</a>
    `;
  } else {
    icono.textContent = "✕";
    icono.className = "icono-confirmada icono-rechazado";
    titulo.textContent = "El pago fue rechazado";
    texto.textContent = `Tu pedido #${numero} sigue reservado. Podés intentar de nuevo ahora o pagarlo más tarde desde tu perfil.`;
    botones.innerHTML = `
      <a class="btn btn-primary" href="pago.html?pedido=${pedido.id}">Intentar de nuevo</a>
      <a class="btn btn-outline-primary" href="perfil.html">Ver mis pedidos</a>
    `;
  }

  mostrarSeccion("pagoResultado");
}

/* ---------------------------------------------------------------
   4. ARRANQUE
   --------------------------------------------------------------- */
onAuthStateChanged(auth, async (usuario) => {
  if (!idPedido) {
    mostrarError("No indicaste qué pedido querés pagar. Elegilo desde tu perfil.");
    return;
  }

  /* Sin sesión: a ingresar y después volver a este mismo pedido.
     encodeURIComponent() protege el "?" que lleva el destino adentro. */
  if (!usuario) {
    if (document.body.dataset.cerrandoSesion !== "si") {
      const volver = encodeURIComponent(`pago.html?pedido=${idPedido}`);
      window.location.href = `login.html?volver=${volver}`;
    }
    return;
  }

  let pedido;

  try {
    pedido = await obtenerPedido(idPedido);
  } catch (error) {
    /* permission-denied: las reglas no dejan leer pedidos ajenos (ni
       ids que no existen), así que no es un error de la página */
    if (error.code === "permission-denied") {
      mostrarError("No encontramos ese pedido en tu cuenta.");
    } else {
      console.error("Error al leer el pedido:", error);
      mostrarError("No pudimos cargar el pedido. Revisá tu conexión y recargá la página.");
    }
    return;
  }

  if (!pedido) {
    mostrarError("No encontramos ese pedido en tu cuenta.");
    return;
  }

  const numero = numeroPedido(pedido.id);

  /* Solo los pedidos que eligieron Mercado Pago pasan por acá */
  if (!pedido.pago || pedido.pago.metodo !== "mercadopago") {
    mostrarError(`El pedido #${numero} se paga coordinando con el equipo de Nivel 99. Te vamos a escribir con los datos.`);
    return;
  }

  /* Ya pagado: se muestra el resultado sin volver a guardar nada */
  if (pedido.pago.estado === "aprobado") {
    mostrarResultado(pedido, "aprobado");
    return;
  }

  /* Un pedido cancelado o ya en preparación no se paga desde acá */
  if (pedido.estado !== "pendiente") {
    mostrarError(`El pedido #${numero} está ${pedido.estado} y no se puede pagar desde la tienda.`);
    return;
  }

  /* Sin resultado en la URL: todavía falta pasar por la pasarela */
  if (estadoUrl !== "aprobado" && estadoUrl !== "rechazado") {
    mostrarPasarela(pedido);
    return;
  }

  if (!operacionValida(operacionUrl)) {
    mostrarError("El resultado del pago no es válido. Volvé a intentarlo desde tu perfil.");
    return;
  }

  /* Volvió de la pasarela: se guarda el resultado en el pedido */
  try {
    await registrarPago(idPedido, estadoUrl, operacionUrl);
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    mostrarError("No pudimos registrar el pago. Revisá tu conexión y volvé a intentarlo desde tu perfil.");
    return;
  }

  mostrarResultado(pedido, estadoUrl);
});
