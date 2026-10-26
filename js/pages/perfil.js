/* =====================================================================
Página privada perfil.html
   ---------------------------------------------------------------------

   La página arranca mostrando solo "Comprobando tu sesión…". Recién
   cuando onAuthStateChanged() confirma que hay un usuario se
   completan y se muestran sus datos. Sin sesión, se redirige a
   login.html y nunca aparece información privada.

   Los datos salen de dos lugares:
     Authentication → uid y correo (siempre están)
     Firestore      → nombre, rol y fecha de registro (usuarios/{uid})
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPerfilUsuario } from "../modules/usuarios.js";
import { obtenerPedidosDeUsuario, describirPago } from "../modules/pedidos.js";

const perfilCargando = document.querySelector("#perfilCargando");
const perfilContenido = document.querySelector("#perfilContenido");
const perfilAviso = document.querySelector("#perfilAviso");

/* Firestore devuelve las fechas como un "Timestamp": toDate() lo
   convierte en un Date común para poder mostrarlo en español. */
function formatearFecha(fechaFirestore) {
  const fecha = fechaFirestore.toDate();

  return fecha.toLocaleDateString("es-UY", { day: "numeric", month: "long", year: "numeric" });
}

function mostrarAvisoPerfil(texto) {
  perfilAviso.textContent = texto;
  perfilAviso.classList.remove("d-none");
}

/* Completa la tarjeta con lo que haya: si Firestore no respondió,
   se usan los datos de Authentication y un rol por defecto. */
function mostrarPerfil(usuario, datos) {
  let nombre = usuario.displayName || usuario.email;
  let rol = "cliente";

  if (datos) {
    nombre = datos.nombre;
    rol = datos.rol;
    document.querySelector("#perfilFecha").textContent = formatearFecha(datos.fechaRegistro);
  }

  document.querySelector("#perfilSaludo").textContent = `Hola, ${nombre.split(" ")[0]}`;
  document.querySelector("#perfilNombre").textContent = nombre;
  document.querySelector("#perfilCorreo").textContent = usuario.email;
  document.querySelector("#perfilInicial").textContent = nombre[0].toUpperCase();
  document.querySelector("#perfilRol").textContent = rol;
  document.querySelector("#perfilUid").textContent = usuario.uid;

  perfilCargando.classList.add("d-none");
  perfilContenido.classList.remove("d-none");
}

/* ---------------------------------------------------------------
   HISTORIAL DE PEDIDOS 
   --------------------------------------------------------------- */
const listaPedidos = document.querySelector("#listaPedidos");

/* Arma la tarjeta de un pedido: fecha, estado, productos y total */
function htmlPedido(pedido) {
  let filas = "";

  pedido.productos.forEach((item) => {
    filas += `
      <li class="linea-pedido">
        <span>${escaparHtml(item.nombre)} <span class="texto-suave">× ${escaparHtml(item.cantidad)}</span></span>
        <span>${formatearPrecio(item.subtotal)}</span>
      </li>
    `;
  });

  let envio = formatearPrecio(pedido.envio);

  if (pedido.envio === 0) {
    envio = "Gratis";
  }

  /* Forma de pago (Sprint 4). Un pedido con Mercado Pago sin pagar
     (o con el pago rechazado) ofrece volver a intentarlo. */
  let botonPagar = "";

  if (pedido.pago && pedido.pago.metodo === "mercadopago" && pedido.estado === "pendiente"
      && (pedido.pago.estado === "pendiente" || pedido.pago.estado === "rechazado")) {
    botonPagar = `<a class="btn btn-primary btn-sm mt-3" href="pago.html?pedido=${pedido.id}">Pagar con Mercado Pago</a>`;
  }

  return `
    <div class="col-12">
      <article class="tarjeta-pedido">
        <header class="encabezado-pedido">
          <div>
            <h3 class="h6 mb-1">Pedido #${pedido.id.slice(0, 6).toUpperCase()}</h3>
            <p class="texto-suave small mb-0">${formatearFecha(pedido.fecha)}</p>
          </div>
          <span class="estado-pedido">${pedido.estado}</span>
        </header>
        <ul class="lista-pedido">${filas}</ul>
        <p class="linea-pedido texto-suave small mb-1"><span>Envío</span><span>${envio}</span></p>
        <p class="linea-pedido total-pedido mb-0"><span>Total</span><span>${formatearPrecio(pedido.total)}</span></p>
        <p class="linea-pago mt-2 mb-0">${describirPago(pedido)}</p>
        ${botonPagar}
      </article>
    </div>
  `;
}

async function cargarPedidos(uid) {
  listaPedidos.innerHTML = htmlCargando("Cargando tus pedidos…");

  let pedidos;

  try {
    pedidos = await obtenerPedidosDeUsuario(uid);
  } catch (error) {
    console.error("Error al cargar los pedidos:", error);
    listaPedidos.innerHTML = htmlMensaje("No pudimos cargar tus pedidos. Revisá tu conexión y recargá la página.");
    return;
  }

  if (pedidos.length === 0) {
    listaPedidos.innerHTML = htmlMensaje("Todavía no hiciste ninguna compra. Cuando confirmes una desde el carrito, va a aparecer acá.");
    return;
  }

  listaPedidos.innerHTML = "";

  pedidos.forEach((pedido) => {
    listaPedidos.innerHTML += htmlPedido(pedido);
  });
}

onAuthStateChanged(auth, async (usuario) => {
  /* Sin sesión: afuera, antes de mostrar nada.
     Si la sesión se acaba de cerrar con el botón, navbar.js ya está
     llevando al inicio y no hace falta ir a login.html. */
  if (!usuario) {
    if (document.body.dataset.cerrandoSesion !== "si") {
      window.location.href = "login.html";
    }
    return;
  }

  /* Con sesión: se buscan sus datos en Firestore */
  try {
    const datos = await obtenerPerfilUsuario(usuario.uid);

    if (!datos) {
      mostrarAvisoPerfil("No encontramos los datos guardados de tu cuenta. Mostramos la información básica.");
    }

    mostrarPerfil(usuario, datos);
  } catch (error) {
    mostrarAvisoPerfil("No pudimos cargar todos tus datos en este momento. Mostramos la información básica.");
    mostrarPerfil(usuario, null);
  }

  /* Historial: solo los pedidos de ESTE usuario */
  cargarPedidos(usuario.uid);
});
