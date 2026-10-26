/* =====================================================================
   Worker de pagos · Nivel 99 (Sprint 4)
   ---------------------------------------------------------------------
   Corre en Cloudflare Workers, NO en el navegador. Es el único lugar
   que conoce el Access Token de Mercado Pago, guardado como secreto
   del Worker (Settings → Variables and Secrets → MP_ACCESS_TOKEN).
   El token nunca aparece en este archivo ni en el repositorio.

   Se copia en el editor del Worker en Cloudflare (Edit code → Deploy).

   Rutas:
     POST /crear-pago        { idPedido }  + Authorization: Bearer <token de Firebase>
                             → { url }  dirección de pago de Mercado Pago
     GET  /verificar-pago?pago=123&pedido=ABC
                             → { estado, detalle, monto }  según Mercado Pago

   Credenciales de PRUEBA: no se cobra dinero real.
   ===================================================================== */

const PROYECTO_FIREBASE = "login-nexostore";
const API_KEY_FIREBASE = "AIzaSyBHIJuumx0Q1kBGuOin7bAE05R6QXBymds"; // pública, la misma de config.js
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROYECTO_FIREBASE}/databases/(default)/documents`;

/* Página a la que vuelve Mercado Pago. Mercado Pago le agrega
   payment_id, status, external_reference (el id del pedido) y otros */
const RETORNO = "https://pablodmconti.github.io/Nexo-Store/pago.html";

/* Sitios que pueden llamar al Worker (el publicado y Live Server) */
const ORIGENES = ["https://pablodmconti.github.io", "http://127.0.0.1:5500", "http://localhost:5500"];

/* Mismas condiciones de envío que base.js */
const MONTO_ENVIO_GRATIS = 2000;
const COSTO_ENVIO = 290;

export default {
  async fetch(request, env) {
    const origen = request.headers.get("Origin");
    const cors = {
      "Access-Control-Allow-Origin": ORIGENES.includes(origen) ? origen : ORIGENES[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin"
    };

    /* El navegador pregunta antes de un POST con JSON (preflight) */
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/crear-pago") {
        return await crearPago(request, env, cors);
      }

      if (request.method === "GET" && url.pathname === "/verificar-pago") {
        return await verificarPago(url, env, cors);
      }

      return responder({ error: "Ruta no encontrada." }, 404, cors);
    } catch (error) {
      console.log("Error inesperado:", error);
      return responder({ error: "El servicio de pagos tuvo un problema. Probá de nuevo en un rato." }, 500, cors);
    }
  }
};

function responder(datos, estado, cors) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" }
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
async function crearPago(request, env, cors) {
  const autorizacion = request.headers.get("Authorization") || "";
  const datos = await request.json().catch(() => ({}));
  const idPedido = datos.idPedido;

  if (!autorizacion.startsWith("Bearer ") || !idPedido) {
    return responder({ error: "Faltan datos para iniciar el pago." }, 400, cors);
  }

  /* 1. El pedido se lee CON el token del usuario: las reglas de
        Firestore solo lo devuelven si es suyo */
  const respuestaPedido = await fetch(`${FIRESTORE}/pedidos/${encodeURIComponent(idPedido)}`, {
    headers: { Authorization: autorizacion }
  });

  if (!respuestaPedido.ok) {
    return responder({ error: "No encontramos ese pedido en tu cuenta." }, 403, cors);
  }

  const pedido = (await respuestaPedido.json()).fields;

  if (texto(pedido.estado) !== "pendiente"
    || texto(subcampo(pedido.pago, "metodo")) !== "mercadopago"
    || texto(subcampo(pedido.pago, "estado")) === "aprobado") {
    return responder({ error: "Este pedido no tiene un pago pendiente con Mercado Pago." }, 409, cors);
  }

  /* 2. Los precios salen de la colección productos (lectura pública),
        no de lo que mande el navegador */
  const items = [];
  let subtotal = 0;
  const productosPedido = pedido.productos.arrayValue.values || [];

  for (const valor of productosPedido) {
    const item = valor.mapValue.fields;
    const idProducto = texto(item.idProducto);
    const cantidad = numero(item.cantidad);

    const respuestaProducto = await fetch(`${FIRESTORE}/productos/${encodeURIComponent(idProducto)}?key=${API_KEY_FIREBASE}`);

    if (!respuestaProducto.ok) {
      return responder({ error: "Uno de los productos del pedido ya no está en la tienda." }, 409, cors);
    }

    const producto = (await respuestaProducto.json()).fields;
    const precio = numero(producto.precio);

    if (precio !== numero(item.precioUnitario)) {
      return responder({ error: `El precio de ${texto(producto.nombre)} cambió desde que hiciste el pedido. Escribinos para actualizarlo.` }, 409, cors);
    }

    items.push({
      id: idProducto,
      title: texto(producto.nombre),
      quantity: cantidad,
      unit_price: precio,
      currency_id: "UYU"
    });

    subtotal += precio * cantidad;
  }

  const envio = subtotal >= MONTO_ENVIO_GRATIS ? 0 : COSTO_ENVIO;

  if (envio > 0) {
    items.push({ id: "envio", title: "Envío", quantity: 1, unit_price: envio, currency_id: "UYU" });
  }

  /* 3. La preferencia de Checkout Pro, firmada con el Access Token */
  const respuestaMP = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      items: items,
      external_reference: idPedido,
      back_urls: { success: RETORNO, failure: RETORNO, pending: RETORNO },
      auto_return: "approved",
      statement_descriptor: "NIVEL99"
    })
  });

  const preferencia = await respuestaMP.json();

  if (!respuestaMP.ok) {
    console.log("Mercado Pago rechazó la preferencia:", JSON.stringify(preferencia));
    return responder({ error: "Mercado Pago no pudo iniciar el pago. Probá de nuevo en un rato." }, 502, cors);
  }

  return responder({ url: preferencia.init_point }, 200, cors);
}

/* ---------------------------------------------------------------
   GET /verificar-pago?pago=123&pedido=ABC
   La página de retorno no le cree a la URL: pregunta a Mercado Pago
   el estado real del pago y que corresponda a ese pedido.
   --------------------------------------------------------------- */
async function verificarPago(url, env, cors) {
  const idPago = url.searchParams.get("pago") || "";
  const idPedido = url.searchParams.get("pedido") || "";

  if (!/^[0-9]+$/.test(idPago) || idPedido === "") {
    return responder({ error: "Faltan datos del pago." }, 400, cors);
  }

  const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${idPago}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` }
  });

  if (!respuesta.ok) {
    return responder({ error: "No encontramos ese pago en Mercado Pago." }, 404, cors);
  }

  const pago = await respuesta.json();

  if (pago.external_reference !== idPedido) {
    return responder({ error: "Ese pago no corresponde a este pedido." }, 404, cors);
  }

  return responder({
    estado: pago.status,             // approved, rejected, pending, in_process...
    detalle: pago.status_detail,
    monto: pago.transaction_amount
  }, 200, cors);
}
