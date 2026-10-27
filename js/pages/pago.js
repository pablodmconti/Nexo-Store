/* =====================================================================
Pago en línea simulado (Sprint 4)
   ---------------------------------------------------------------------

   Imita el recorrido de una pasarela de pago sin conectarse a ningún
   medio de pago real:

     1. carrito.js registra el pedido y lleva a pago.html?pedido=ID
        (el perfil también trae acá los pedidos que quedaron sin pagar)
     2. Esta página muestra el resumen y dos botones: aprobar o
        rechazar el pago. No se piden datos de tarjeta.
     3. Cada botón vuelve a esta misma página con el resultado en la URL
        (Semana 7), igual que una pasarela real vuelve a la tienda:
          pago.html?pedido=ID&estado=aprobado&operacion=SIM-1761500000000
     4. Se guarda el resultado en el campo pago del pedido y se muestra
        el mensaje final.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPedido, registrarPago } from "../modules/pedidos.js";

/* Parámetros de la URL (Semana 7) */
const parametros = new URLSearchParams(window.location.search);
const idPedido = parametros.get("pedido");
const estadoUrl = parametros.get("estado");       // "aprobado", "rechazado" o null
const operacionUrl = parametros.get("operacion"); // número de operación SIM-...

/* ---------------------------------------------------------------
   1. AYUDAS PARA LA INTERFAZ
   --------------------------------------------------------------- */

/* La página tiene cuatro bloques y se ve uno solo a la vez */
function mostrarSeccion(idSeccion) {
  ["pagoCargando", "pagoError", "pagoResumen", "pagoResultado"].forEach((id) => {
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
function mostrarResumen(pedido) {
  const lista = document.querySelector("#pagoProductos");
  lista.innerHTML = "";

  /* Los datos del pedido los guardó el navegador: se escapan (base.js) */
  pedido.productos.forEach((item) => {
    lista.innerHTML += `
      <li class="linea-pedido">
        <span>${escaparHtml(item.nombre)} <span class="texto-suave">× ${escaparHtml(item.cantidad)}</span></span>
        <span>${escaparHtml(formatearPrecio(item.subtotal))}</span>
      </li>
    `;
  });

  if (pedido.envio > 0) {
    lista.innerHTML += `<li class="linea-pedido texto-suave"><span>Envío</span><span>${escaparHtml(formatearPrecio(pedido.envio))}</span></li>`;
  }

  document.querySelector("#pagoNumero").textContent = numeroPedido(pedido.id);
  document.querySelector("#pagoTotal").textContent = formatearPrecio(pedido.total);
  mostrarSeccion("pagoResumen");
}

/* Cada botón "vuelve" a la tienda con el resultado en la URL.
   El número de operación usa la fecha en milisegundos, que no se
   repite de un pago a otro: SIM-1761500000000 */
function simularPago(estado) {
  document.querySelector("#btnSimularAprobado").disabled = true;
  document.querySelector("#btnSimularRechazado").disabled = true;

  const operacion = `SIM-${Date.now()}`;
  window.location.href = `pago.html?pedido=${idPedido}&estado=${estado}&operacion=${operacion}`;
}

document.querySelector("#btnSimularAprobado").addEventListener("click", () => {
  simularPago("aprobado");
});

document.querySelector("#btnSimularRechazado").addEventListener("click", () => {
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
    texto.textContent = `Se aprobó el pago del pedido #${numero} por ${formatearPrecio(pedido.total)}. Te vamos a escribir para coordinar la entrega.`;
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
      <a class="btn btn-primary" href="pago.html?pedido=${escaparHtml(pedido.id)}">Intentar de nuevo</a>
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

  /* Solo los pedidos con pago en línea pasan por acá */
  if (!pedido.pago || pedido.pago.metodo !== "simulado") {
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

  /* Sin resultado en la URL: todavía falta elegir en la pasarela */
  if (estadoUrl !== "aprobado" && estadoUrl !== "rechazado") {
    mostrarResumen(pedido);
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
    mostrarError("No pudimos guardar el resultado del pago. Recargá esta página en un momento.");
    return;
  }

  /* Se quitan de la dirección los datos del pago: si se recarga la
     página, no se vuelven a procesar */
  window.history.replaceState(null, "", `pago.html?pedido=${idPedido}`);

  mostrarResultado(pedido, estadoUrl);
});
