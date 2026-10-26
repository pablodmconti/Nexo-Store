/* =====================================================================
   Worker de pagos · Nivel 99 (Sprint 4)
   ---------------------------------------------------------------------
   Corre en Cloudflare Workers, NO en el navegador. Es el único lugar
   que conoce el Access Token de Mercado Pago, guardado como secreto
   del Worker. El token nunca aparece en este archivo ni en el repo.

   Se copia en el editor del Worker nivel99-pagos (Edit code → Deploy).

   Rutas:
     GET  /                  Comprueba que el Worker funciona y si tiene
                             el Access Token configurado.
     POST /crear-pago        { idPedido, volverA }
                             + Authorization: Bearer <token de Firebase>
                             Lee el pedido (solo si es de quien lo pide) y
                             los precios desde Firestore, crea la preferencia
                             de Checkout Pro y devuelve { url } del checkout.
     GET  /volver            Mercado Pago vuelve acá al terminar y el Worker
                             reenvía a pago.html con payment_id, status y
                             external_reference. Pasar por acá permite probar
                             desde Live Server, que Mercado Pago no acepta
                             como dirección de retorno.
     GET  /verificar-pago?pago=123&pedido=ABC
                             Consulta el pago en Mercado Pago y devuelve su
                             estado, el motivo y el importe, si corresponde
                             a ese pedido.

   Variables del Worker (Settings → Variables and Secrets):
     MP_ACCESS_TOKEN  secreto, obligatorio: Access Token de PRUEBA.
     MONEDA           opcional: moneda del cobro. Si no se define, "UYU".
   ===================================================================== */

const PROYECTO_FIREBASE = "login-nexostore";
const API_KEY_FIREBASE = "AIzaSyBHIJuumx0Q1kBGuOin7bAE05R6QXBymds"; // pública, la misma de config.js
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROYECTO_FIREBASE}/databases/(default)/documents`;

/* Sitios que pueden usar este Worker: el publicado y Live Server */
const ORIGENES_PERMITIDOS = ["https://pablodmconti.github.io"];
const PATRONES_PERMITIDOS = [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];

/* Mismas condiciones de envío que base.js */
const MONTO_ENVIO_GRATIS = 2000;
const COSTO_ENVIO = 290;

function origenPermitido(origen) {
  if (!origen) return false;
  return ORIGENES_PERMITIDOS.includes(origen) || PATRONES_PERMITIDOS.some((patron) => patron.test(origen));
}

function encabezadosCors(origen) {
  const encabezados = { "Vary": "Origin" };

  if (origenPermitido(origen)) {
    encabezados["Access-Control-Allow-Origin"] = origen;
    encabezados["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    encabezados["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  }

  return encabezados;
}

function responder(datos, estado, origen) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "Content-Type": "application/json; charset=utf-8", ...encabezadosCors(origen) }
  });
}

/* Firestore REST devuelve cada campo con su tipo:
   { stringValue: "p1" }, { integerValue: "2" }, { doubleValue: 4.5 }, { mapValue: { fields } } */
function texto(campo) {
  return campo ? campo.stringValue : undefined;
}

function numero(campo) {
  if (!campo) return NaN;
  if (campo.integerValue !== undefined) return Number(campo.integerValue);
  return Number(campo.doubleValue);
}

function subcampo(campo, nombre) {
  return campo && campo.mapValue && campo.mapValue.fields ? campo.mapValue.fields[nombre] : undefined;
}

/* ---------------------------------------------------------------
   POST /crear-pago
   --------------------------------------------------------------- */
async function crearPago(request, env, origen) {
  const autorizacion = request.headers.get("Authorization") || "";
  const datos = await request.json().catch(() => ({}));
  const { idPedido, volverA } = datos;

  if (!autorizacion.startsWith("Bearer ") || typeof idPedido !== "string" || !/^[A-Za-z0-9]{1,40}$/.test(idPedido)) {
    return responder({ error: "Faltan los datos del pedido o de la sesión." }, 400, origen);
  }

  /* La página de retorno tiene que ser de un sitio permitido */
  let destino = null;

  try {
    destino = new URL(volverA);
  } catch (error) {
    destino = null;
  }

  if (!destino || !origenPermitido(destino.origin)) {
    return responder({ error: "La página de retorno no está permitida." }, 400, origen);
  }

  /* 1. El pedido se lee CON el token del usuario: las reglas de
        Firestore solo lo devuelven si es suyo */
  const respuestaPedido = await fetch(`${FIRESTORE}/pedidos/${idPedido}`, {
    headers: { Authorization: autorizacion }
  });

  if (!respuestaPedido.ok) {
    return responder({ error: "No encontramos ese pedido en tu cuenta." }, 403, origen);
  }

  const pedido = (await respuestaPedido.json()).fields || {};

  if (texto(pedido.estado) !== "pendiente"
    || texto(subcampo(pedido.pago, "metodo")) !== "mercadopago"
    || texto(subcampo(pedido.pago, "estado")) === "aprobado") {
    return responder({ error: "Este pedido no tiene un pago pendiente con Mercado Pago." }, 409, origen);
  }

  /* 2. Los precios salen de la colección productos (lectura pública),
        no de lo que mande el navegador */
  const moneda = env.MONEDA || "UYU";
  const items = [];
  let subtotal = 0;
  const productosPedido = (pedido.productos && pedido.productos.arrayValue.values) || [];

  for (const valor of productosPedido) {
    const item = valor.mapValue.fields;
    const idProducto = texto(item.idProducto);
    const cantidad = numero(item.cantidad);

    const respuestaProducto = await fetch(`${FIRESTORE}/productos/${encodeURIComponent(idProducto)}?key=${API_KEY_FIREBASE}`);

    if (!respuestaProducto.ok) {
      return responder({ error: "Uno de los productos del pedido ya no está en la tienda." }, 409, origen);
    }

    const producto = (await respuestaProducto.json()).fields;
    const precio = numero(producto.precio);

    if (precio !== numero(item.precioUnitario)) {
      return responder({ error: `El precio de ${texto(producto.nombre)} cambió desde que hiciste el pedido. Escribinos para actualizarlo.` }, 409, origen);
    }

    items.push({ id: idProducto, title: texto(producto.nombre), quantity: cantidad, unit_price: precio, currency_id: moneda });
    subtotal += precio * cantidad;
  }

  if (items.length === 0) {
    return responder({ error: "El pedido no tiene productos." }, 409, origen);
  }

  const envio = subtotal >= MONTO_ENVIO_GRATIS ? 0 : COSTO_ENVIO;

  if (envio > 0) {
    items.push({ id: "envio", title: "Envío", quantity: 1, unit_price: envio, currency_id: moneda });
  }

  /* Mercado Pago vuelve primero al Worker (/volver) y el Worker reenvía
     a la página indicada */
  const volver = new URL("/volver", request.url);
  volver.searchParams.set("destino", destino.href);

  /* 3. La preferencia de Checkout Pro, firmada con el Access Token */
  const respuestaMP = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: items,
      external_reference: idPedido,
      back_urls: { success: volver.href, failure: volver.href, pending: volver.href },
      auto_return: "approved",
      statement_descriptor: "NIVEL99",
      /* Sin pagos en efectivo (Abitab, Red Pagos): quedarían pendientes y
         el sitio no tiene cómo enterarse de cuándo se acreditan. En una
         sola cuota, así el importe cobrado es exactamente el del pedido. */
      payment_methods: { excluded_payment_types: [{ id: "ticket" }], installments: 1 }
    })
  });

  const preferencia = await respuestaMP.json().catch(() => ({}));

  if (!respuestaMP.ok) {
    console.log("Mercado Pago rechazó la preferencia:", respuestaMP.status, JSON.stringify(preferencia));
    return responder({ error: "Mercado Pago no aceptó el pago: " + (preferencia.message || "error " + respuestaMP.status) }, 502, origen);
  }

  /* Las credenciales viejas de prueba empiezan con TEST- y usan el
     checkout de sandbox */
  const url = env.MP_ACCESS_TOKEN.startsWith("TEST-") ? preferencia.sandbox_init_point : preferencia.init_point;

  return responder({ url: url }, 200, origen);
}

/* ---------------------------------------------------------------
   GET /volver
   Reenvía a pago.html con los datos del pago que manda Mercado Pago.
   --------------------------------------------------------------- */
function volverAlSitio(url) {
  let destino = null;

  try {
    destino = new URL(url.searchParams.get("destino"));
  } catch (error) {
    destino = null;
  }

  if (!destino || !origenPermitido(destino.origin)) {
    return new Response("Destino no permitido.", { status: 400 });
  }

  const idPago = url.searchParams.get("payment_id") || url.searchParams.get("collection_id") || "null";
  const estado = url.searchParams.get("status") || url.searchParams.get("collection_status") || "null";
  destino.searchParams.set("payment_id", idPago);
  destino.searchParams.set("status", estado);

  const referencia = url.searchParams.get("external_reference");

  if (referencia) {
    destino.searchParams.set("external_reference", referencia);
  }

  return Response.redirect(destino.href, 302);
}

/* ---------------------------------------------------------------
   GET /verificar-pago?pago=123&pedido=ABC
   La página de retorno no le cree a la URL: pregunta a Mercado Pago
   el estado real del pago y que corresponda a ese pedido.
   --------------------------------------------------------------- */
async function verificarPago(url, env, origen) {
  const idPago = url.searchParams.get("pago") || "";
  const idPedido = url.searchParams.get("pedido") || "";

  if (!/^\d{1,20}$/.test(idPago) || idPedido === "") {
    return responder({ error: "El número de pago no es válido." }, 400, origen);
  }

  const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${idPago}`, {
    headers: { "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}` }
  });

  if (respuesta.status === 404) {
    return responder({ error: "No encontramos ese pago en Mercado Pago." }, 404, origen);
  }

  const pago = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    console.log("No se pudo consultar el pago:", respuesta.status, JSON.stringify(pago));
    return responder({ error: "No pudimos consultar el pago en Mercado Pago." }, 502, origen);
  }

  if (pago.external_reference !== idPedido) {
    return responder({ error: "Ese pago no corresponde a este pedido." }, 404, origen);
  }

  return responder({
    id: String(pago.id),
    estado: pago.status,              // approved, rejected, pending, in_process...
    detalle: pago.status_detail,      // motivo, por ejemplo cc_rejected_high_risk
    importe: pago.transaction_amount,
    moneda: pago.currency_id
  }, 200, origen);
}

/* ---------------------------------------------------------------
   ENTRADA DEL WORKER
   --------------------------------------------------------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origen = request.headers.get("Origin");

    /* El navegador pregunta antes de un POST con JSON (preflight) */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: encabezadosCors(origen) });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return responder({
        servicio: "Servidor de pagos de Nivel 99",
        accessTokenConfigurado: Boolean(env.MP_ACCESS_TOKEN),
        moneda: env.MONEDA || "UYU"
      }, 200, origen);
    }

    if (request.method === "GET" && url.pathname === "/volver") {
      return volverAlSitio(url);
    }

    if (!origenPermitido(origen)) {
      return responder({ error: "Este sitio no puede usar el servidor de pagos." }, 403, origen);
    }

    if (!env.MP_ACCESS_TOKEN) {
      return responder({ error: "El servidor de pagos no tiene configurado el Access Token de Mercado Pago." }, 500, origen);
    }

    try {
      if (request.method === "POST" && url.pathname === "/crear-pago") {
        return await crearPago(request, env, origen);
      }

      if (request.method === "GET" && url.pathname === "/verificar-pago") {
        return await verificarPago(url, env, origen);
      }

      return responder({ error: "Ruta no encontrada." }, 404, origen);
    } catch (error) {
      console.log("Error inesperado en el servidor de pagos:", error);
      return responder({ error: "Ocurrió un error en el servidor de pagos. Intentá nuevamente." }, 500, origen);
    }
  }
};
