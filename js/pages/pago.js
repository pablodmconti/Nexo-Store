/* =====================================================================
Pago con Mercado Pago (Sprint 4)
   ---------------------------------------------------------------------

   Recorrido de Checkout Pro, con credenciales de prueba:

     1. carrito.js registra el pedido, le pide al Worker de Cloudflare
        el pago y lleva directo al checkout de Mercado Pago.
     2. Al terminar, Mercado Pago vuelve al Worker (/volver), que
        reenvía a esta página con el resultado en la URL (Semana 7):
          pago.html?payment_id=123&status=approved&external_reference=ID
     3. La página NO le cree a la URL: le pide al Worker que consulte
        ese pago en Mercado Pago, controla que el importe sea el del
        pedido, guarda el resultado (campo pago) y muestra el mensaje.

   Con pago.html?pedido=ID (desde el perfil, o si el checkout no se
   pudo abrir) se muestra el resumen con el botón "Ir a Mercado Pago".

   El Access Token de Mercado Pago vive solo en el Worker
   (cloudflare/worker-pagos.js): el navegador nunca lo ve.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPedido, registrarPago } from "../modules/pedidos.js";
import { iniciarPago, consultarPago } from "../modules/mercadopago.js";

/* Parámetros de la URL. Desde el carrito o el perfil llega ?pedido=ID;
   desde Mercado Pago, el mismo id viene en external_reference */
const parametros = new URLSearchParams(window.location.search);
const idPedido = parametros.get("pedido") || parametros.get("external_reference");

/* payment_id solo existe a la vuelta de Mercado Pago. Si la persona
   volvió sin pagar, Mercado Pago lo manda con el texto "null". */
const idPago = parametros.get("payment_id");
const volvioDeMercadoPago = idPago !== null;
const hayPago = volvioDeMercadoPago && idPago !== "null";

let usuarioActual = null;

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

/* Motivos de rechazo más comunes (status_detail de Mercado Pago) */
const MOTIVOS_RECHAZO = {
  cc_rejected_high_risk: "Mercado Pago lo rechazó por prevención de fraude. En modo de prueba pasa si en el checkout no se ingresó con la cuenta compradora de prueba.",
  cc_rejected_insufficient_amount: "La tarjeta no tiene fondos suficientes.",
  cc_rejected_bad_filled_security_code: "El código de seguridad no es correcto.",
  cc_rejected_bad_filled_date: "La fecha de vencimiento no es correcta.",
  cc_rejected_bad_filled_other: "Algún dato de la tarjeta no es correcto.",
  cc_rejected_call_for_authorize: "La tarjeta pide autorizar el pago con el banco.",
  cc_rejected_other_reason: "La tarjeta rechazó el pago."
};

/* Estados de Mercado Pago → estados del pago del pedido */
function traducirEstado(estadoMercadoPago) {
  if (estadoMercadoPago === "approved") {
    return "aprobado";
  }

  if (estadoMercadoPago === "rejected" || estadoMercadoPago === "cancelled") {
    return "rechazado";
  }

  return "en proceso"; // pending, in_process...
}

/* ---------------------------------------------------------------
   2. RESUMEN E INICIO DEL PAGO
   --------------------------------------------------------------- */
function mostrarResumen(pedido) {
  const lista = document.querySelector("#pagoProductos");
  lista.innerHTML = "";

  pedido.productos.forEach((item) => {
    lista.innerHTML += `
      <li class="linea-pedido">
        <span>${escaparHtml(item.nombre)} <span class="texto-suave">× ${escaparHtml(item.cantidad)}</span></span>
        <span>${formatearPrecio(item.subtotal)}</span>
      </li>
    `;
  });

  if (pedido.envio > 0) {
    lista.innerHTML += `<li class="linea-pedido texto-suave"><span>Envío</span><span>${formatearPrecio(pedido.envio)}</span></li>`;
  }

  document.querySelector("#pagoNumero").textContent = numeroPedido(pedido.id);
  document.querySelector("#pagoTotal").textContent = formatearPrecio(pedido.total);
  mostrarSeccion("pagoResumen");
}

const btnIrAPagar = document.querySelector("#btnIrAPagar");

btnIrAPagar.addEventListener("click", async () => {
  btnIrAPagar.disabled = true;
  btnIrAPagar.textContent = "Conectando con Mercado Pago…";

  try {
    /* El Worker crea la preferencia de pago y devuelve su dirección */
    const urlPago = await iniciarPago(usuarioActual, idPedido);
    window.location.href = urlPago;
  } catch (error) {
    console.error("Error al iniciar el pago:", error);
    mostrarAviso(error.message);
    btnIrAPagar.disabled = false;
    btnIrAPagar.textContent = "Ir a Mercado Pago";
  }
});

/* ---------------------------------------------------------------
   3. RESULTADO DEL PAGO
   --------------------------------------------------------------- */
function mostrarResultado(pedido, estado, detalle) {
  const icono = document.querySelector("#pagoIcono");
  const titulo = document.querySelector("#pagoTitulo");
  const texto = document.querySelector("#pagoTexto");
  const botones = document.querySelector("#pagoBotones");
  const numero = numeroPedido(pedido.id);

  if (estado === "aprobado") {
    icono.textContent = "✓";
    icono.className = "icono-confirmada";
    titulo.textContent = "¡Pago aprobado!";
    texto.textContent = `Mercado Pago aprobó el pago del pedido #${numero} por ${formatearPrecio(pedido.total)}. Te vamos a escribir para coordinar la entrega.`;
    botones.innerHTML = `
      <a class="btn btn-primary" href="perfil.html">Ver mis pedidos</a>
      <a class="btn btn-outline-primary" href="catalogo.html">Seguir comprando</a>
    `;
  } else if (estado === "rechazado") {
    icono.textContent = "✕";
    icono.className = "icono-confirmada icono-rechazado";
    titulo.textContent = "El pago fue rechazado";
    const motivo = MOTIVOS_RECHAZO[detalle] || "";
    texto.textContent = `${motivo} Tu pedido #${numero} sigue reservado. Podés intentar de nuevo con otro medio de pago o pagarlo más tarde desde tu perfil.`.trim();
    botones.innerHTML = `
      <a class="btn btn-primary" href="pago.html?pedido=${pedido.id}">Intentar de nuevo</a>
      <a class="btn btn-outline-primary" href="perfil.html">Ver mis pedidos</a>
    `;
  } else {
    icono.textContent = "…";
    icono.className = "icono-confirmada icono-pendiente";
    titulo.textContent = "Tu pago está en proceso";
    texto.textContent = `Mercado Pago todavía está procesando el pago del pedido #${numero}. Revisá el estado en un rato desde tu perfil.`;
    botones.innerHTML = `<a class="btn btn-primary" href="perfil.html">Ver mis pedidos</a>`;
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

  usuarioActual = usuario;

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

  /* Todavía no hay pago: se muestra el resumen con el botón */
  if (!hayPago) {
    mostrarResumen(pedido);

    if (volvioDeMercadoPago) {
      mostrarAviso("No se completó el pago. Podés intentarlo de nuevo cuando quieras.");
    }
    return;
  }

  /* Volvió de Mercado Pago con un pago: se confirma con el Worker */
  let consulta;

  try {
    consulta = await consultarPago(idPago, idPedido);
  } catch (error) {
    console.error("Error al confirmar el pago:", error);
    mostrarError(`${error.message} Si el pago se hizo, recargá esta página en un momento.`);
    return;
  }

  const estado = traducirEstado(consulta.estado);

  /* Un pago aprobado tiene que ser por el total del pedido */
  if (estado === "aprobado" && Number(consulta.importe) !== Number(pedido.total)) {
    mostrarError(`El importe pagado ($ ${consulta.importe}) no coincide con el total del pedido (${formatearPrecio(pedido.total)}). Escribinos para revisarlo.`);
    return;
  }

  try {
    await registrarPago(idPedido, estado, idPago);
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    mostrarError("No pudimos guardar el resultado del pago. Recargá esta página en un momento.");
    return;
  }

  /* Se quitan de la dirección los datos del pago: si se recarga la
     página, no se vuelven a procesar */
  window.history.replaceState(null, "", `pago.html?pedido=${idPedido}`);

  mostrarResultado(pedido, estado, consulta.detalle);
});
