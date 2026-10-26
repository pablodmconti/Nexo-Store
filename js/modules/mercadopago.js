/* =====================================================================
Conexión con el Worker de pagos (Sprint 4)
   ---------------------------------------------------------------------
   El sitio no habla directamente con Mercado Pago: le pide todo al
   Worker de Cloudflare, que guarda el Access Token como secreto (ver
   cloudflare/worker-pagos.js). El navegador nunca ve ese token.

   Este archivo SOLO habla con el Worker: no toca el HTML.
   ===================================================================== */

/* Dirección del Worker publicado en Cloudflare (uno propio de Nivel 99) */
export const URL_WORKER = "https://nivel99-pagos.pablodmconti.workers.dev";

/* Hace el pedido al Worker y devuelve su respuesta (un objeto).
   Si no hay conexión o el Worker responde con un error, lanza un
   Error con un mensaje en español para mostrar en la página. */
async function pedirAlWorker(ruta, opciones) {
  let respuesta;

  try {
    respuesta = await fetch(`${URL_WORKER}${ruta}`, opciones);
  } catch (error) {
    throw new Error("No pudimos conectarnos con el servicio de pagos. Revisá tu conexión y volvé a intentar.");
  }

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "El servicio de pagos no respondió como esperábamos.");
  }

  return datos;
}

/* Pide la dirección de pago de Mercado Pago para un pedido.
   Se envía el token de la sesión de Firebase: con él, el Worker lee
   el pedido con los permisos de su dueño (las reglas hacen el resto). */
export async function iniciarPago(usuario, idPedido) {
  const token = await usuario.getIdToken();

  const datos = await pedirAlWorker("/crear-pago", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ idPedido: idPedido })
  });

  return datos.url;
}

/* Pregunta el estado REAL de un pago a Mercado Pago, a través del
   Worker. Devuelve { estado, detalle, monto }; estado es el de
   Mercado Pago: "approved", "rejected", "pending", "in_process"... */
export async function consultarPago(idPago, idPedido) {
  const ruta = `/verificar-pago?pago=${encodeURIComponent(idPago)}&pedido=${encodeURIComponent(idPedido)}`;
  return await pedirAlWorker(ruta, { method: "GET" });
}
