/* =====================================================================
Pago en línea de un pedido (Sprint 4)
   ---------------------------------------------------------------------

   La forma de pago del pedido decide el recorrido:

   PASARELA SIMULADA (pedido.pago.metodo = "simulado")
     1. carrito.js registra el pedido y lleva a pago.html?pedido=ID
     2. Esta página muestra el resumen y dos botones: aprobar o
        rechazar el pago. No se piden datos de tarjeta.
     3. Cada botón vuelve a esta misma página con el resultado en la URL
        (Semana 7), igual que una pasarela real vuelve a la tienda:
          pago.html?pedido=ID&estado=aprobado&operacion=SIM-1761500000000
     4. Se guarda el resultado en el campo pago del pedido y se muestra
        el mensaje final.

   MERCADO PAGO (pedido.pago.metodo = "mercadopago", solo con el
   interruptor MERCADO_PAGO_ACTIVO de mercadopago.js en true)
     1. carrito.js le pide al Worker de Cloudflare el pago y lleva al
        checkout de Mercado Pago.
     2. Mercado Pago vuelve al Worker (/volver), que reenvía acá con
          pago.html?payment_id=123&status=approved&external_reference=ID
     3. La página no le cree a la URL: consulta el pago a través del
        Worker, controla que el importe sea el del pedido y lo guarda.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPedido, registrarPago } from "../modules/pedidos.js";
import { iniciarPago, consultarPago, MERCADO_PAGO_ACTIVO } from "../modules/mercadopago.js";

/* Parámetros de la URL. Desde el carrito o el perfil llega ?pedido=ID;
   desde Mercado Pago, el mismo id viene en external_reference */
const parametros = new URLSearchParams(window.location.search);
const idPedido = parametros.get("pedido") || parametros.get("external_reference");

/* Vuelta de la pasarela simulada */
const estadoSimulado = parametros.get("estado");     // "aprobado", "rechazado" o null
const operacionSimulada = parametros.get("operacion"); // SIM-...

/* Vuelta de Mercado Pago. Si la persona volvió sin pagar, Mercado Pago
   manda payment_id con el texto "null". */
const idPagoMP = parametros.get("payment_id");
const volvioDeMercadoPago = idPagoMP !== null;
const hayPagoMP = volvioDeMercadoPago && idPagoMP !== "null";

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

/* Solo se acepta un número de operación simulado con la forma
   SIM-123456... (las reglas de Firestore hacen el mismo control) */
function operacionSimuladaValida(texto) {
  return texto !== null
    && texto.startsWith("SIM-")
    && texto.length > 4
    && Number.isInteger(Number(texto.slice(4)));
}

/* Motivos de rechazo más comunes de Mercado Pago (status_detail) */
const MOTIVOS_RECHAZO = {
  cc_rejected_high_risk: "Mercado Pago lo rechazó por prevención de fraude.",
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
   2. RESUMEN ANTES DE PAGAR
   --------------------------------------------------------------- */
function mostrarResumen(pedido) {
  const lista = document.querySelector("#pagoProductos");
  lista.innerHTML = "";

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

  /* Texto y botones según la forma de pago del pedido */
  const explicacion = document.querySelector("#pagoExplicacion");

  if (pedido.pago.metodo === "simulado") {
    document.querySelector("#pagoEtiqueta").textContent = "Simulación";
    document.querySelector("#pagoTituloResumen").textContent = "Pago en línea";
    explicacion.textContent = "Esta pasarela simula el paso por un medio de pago: elegí si el pago se aprueba o se rechaza. No se piden datos de tarjeta ni se cobra dinero.";
    document.querySelector("#btnSimularAprobado").classList.remove("d-none");
    document.querySelector("#btnSimularRechazado").classList.remove("d-none");
  } else {
    document.querySelector("#pagoEtiqueta").textContent = "Modo de prueba";
    document.querySelector("#pagoTituloResumen").textContent = "Pagar con Mercado Pago";
    explicacion.textContent = "Te vamos a llevar al sitio de Mercado Pago para completar el pago y después volvés a Nivel 99. Funciona solo con credenciales de prueba: no se cobra dinero real.";
    document.querySelector("#btnIrAPagar").classList.remove("d-none");
  }

  mostrarSeccion("pagoResumen");
}

/* Pasarela simulada: cada botón "vuelve" a la tienda con el resultado
   en la URL. El número de operación usa la fecha en milisegundos, que
   no se repite de un pago a otro: SIM-1761500000000 */
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

/* Mercado Pago: el Worker crea el pago y devuelve la dirección del checkout */
const btnIrAPagar = document.querySelector("#btnIrAPagar");

btnIrAPagar.addEventListener("click", async () => {
  btnIrAPagar.disabled = true;
  btnIrAPagar.textContent = "Conectando con Mercado Pago…";

  try {
    window.location.href = await iniciarPago(usuarioActual, idPedido);
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
    texto.textContent = `Se aprobó el pago del pedido #${numero} por ${formatearPrecio(pedido.total)}. Te vamos a escribir para coordinar la entrega.`;
    botones.innerHTML = `
      <a class="btn btn-primary" href="perfil.html">Ver mis pedidos</a>
      <a class="btn btn-outline-primary" href="catalogo.html">Seguir comprando</a>
    `;
  } else if (estado === "rechazado") {
    const motivo = MOTIVOS_RECHAZO[detalle] || "";
    icono.textContent = "✕";
    icono.className = "icono-confirmada icono-rechazado";
    titulo.textContent = "El pago fue rechazado";
    texto.textContent = `${motivo} Tu pedido #${numero} sigue reservado. Podés intentar de nuevo ahora o pagarlo más tarde desde tu perfil.`.trim();
    botones.innerHTML = `
      <a class="btn btn-primary" href="pago.html?pedido=${escaparHtml(pedido.id)}">Intentar de nuevo</a>
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

/* Guarda el resultado, quita los datos del pago de la dirección (así
   una recarga no lo vuelve a procesar) y muestra el mensaje final */
async function guardarYMostrar(pedido, metodo, estado, idOperacion, detalle) {
  try {
    await registrarPago(idPedido, metodo, estado, idOperacion);
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    mostrarError("No pudimos guardar el resultado del pago. Recargá esta página en un momento.");
    return;
  }

  window.history.replaceState(null, "", `pago.html?pedido=${idPedido}`);
  mostrarResultado(pedido, estado, detalle);
}

/* ---------------------------------------------------------------
   4. RECORRIDO DE CADA FORMA DE PAGO
   --------------------------------------------------------------- */
async function procesarPagoSimulado(pedido) {
  /* Sin resultado en la URL: todavía falta elegir en la pasarela */
  if (estadoSimulado !== "aprobado" && estadoSimulado !== "rechazado") {
    mostrarResumen(pedido);
    return;
  }

  if (!operacionSimuladaValida(operacionSimulada)) {
    mostrarError("El resultado del pago no es válido. Volvé a intentarlo desde tu perfil.");
    return;
  }

  await guardarYMostrar(pedido, "simulado", estadoSimulado, operacionSimulada, "");
}

async function procesarPagoMercadoPago(pedido) {
  if (!MERCADO_PAGO_ACTIVO) {
    mostrarError(`El pago con Mercado Pago no está disponible por ahora. Escribinos para coordinar el pago del pedido #${numeroPedido(pedido.id)}.`);
    return;
  }

  /* Todavía no hay pago: resumen con el botón "Ir a Mercado Pago" */
  if (!hayPagoMP) {
    mostrarResumen(pedido);

    if (volvioDeMercadoPago) {
      mostrarAviso("No se completó el pago. Podés intentarlo de nuevo cuando quieras.");
    }
    return;
  }

  /* Volvió de Mercado Pago con un pago: se confirma con el Worker */
  let consulta;

  try {
    consulta = await consultarPago(idPagoMP, idPedido);
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

  await guardarYMostrar(pedido, "mercadopago", estado, idPagoMP, consulta.detalle);
}

/* ---------------------------------------------------------------
   5. ARRANQUE
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
  const metodo = pedido.pago ? pedido.pago.metodo : "coordinar";

  /* Solo los pedidos con pago en línea pasan por acá */
  if (metodo !== "simulado" && metodo !== "mercadopago") {
    mostrarError(`El pedido #${numero} se paga coordinando con el equipo de Nivel 99. Te vamos a escribir con los datos.`);
    return;
  }

  /* Ya pagado: se muestra el resultado sin volver a guardar nada */
  if (pedido.pago.estado === "aprobado") {
    mostrarResultado(pedido, "aprobado", "");
    return;
  }

  /* Un pedido cancelado o ya en preparación no se paga desde acá */
  if (pedido.estado !== "pendiente") {
    mostrarError(`El pedido #${numero} está ${pedido.estado} y no se puede pagar desde la tienda.`);
    return;
  }

  if (metodo === "simulado") {
    await procesarPagoSimulado(pedido);
  } else {
    await procesarPagoMercadoPago(pedido);
  }
});
