/* =====================================================================
Panel administrativo
   ---------------------------------------------------------------------

   1. PROTECCIÓN: al cargar la página se comprueba la sesión y se lee el
      rol en usuarios/{uid}. Sin sesión se va a login.html; con un rol
      que no sea "admin" se redirige al inicio con un aviso, y el panel
      nunca aparece aunque se escriba la dirección a mano.
   2. PRODUCTOS: alta, edición, activar o desactivar y eliminación,
      con precio, stock, disponibilidad, destacado e imagen (ruta o
      URL como texto, Semana 11).
   3. PEDIDOS: consulta de todos los pedidos y cambio de estado. Al
      cancelar uno, el stock vuelve a los productos.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerPerfilUsuario } from "../modules/usuarios.js";
import {
  obtenerProductos,
  guardarProducto,
  actualizarProducto,
  eliminarProducto,
  siguienteIdProducto
} from "../modules/productos-firestore.js";
import {
  ESTADOS_PEDIDO,
  obtenerTodosLosPedidos,
  cambiarEstadoPedido,
  describirPago
} from "../modules/pedidos.js";

let productos = [];
let pedidos = [];

/* Id del producto que se está editando; null si es uno nuevo */
let idEnEdicion = null;

/* ---------------------------------------------------------------
   1. PROTECCIÓN DE LA PÁGINA
   --------------------------------------------------------------- */
function mostrarDenegado(texto) {
  document.querySelector("#adminCargando").classList.add("d-none");
  document.querySelector("#textoDenegado").textContent = texto;
  document.querySelector("#adminDenegado").classList.remove("d-none");
}

onAuthStateChanged(auth, async (usuario) => {
  /* Sin sesión: a ingresar, volviendo después a esta página */
  if (!usuario) {
    if (document.body.dataset.cerrandoSesion !== "si") {
      window.location.href = "login.html?volver=admin.html";
    }
    return;
  }

  /* Con sesión: el rol se lee de Firestore, no del navbar */
  let perfil;

  try {
    perfil = await obtenerPerfilUsuario(usuario.uid);
  } catch (error) {
    console.error("Error al comprobar el rol:", error);
    mostrarDenegado("No pudimos comprobar tus permisos. Revisá tu conexión y recargá la página.");
    return;
  }

  /* Con sesión pero sin rol admin (un cliente que escribió admin.html
     en la barra de direcciones): se lo lleva al inicio. El motivo
     viaja como parámetro de URL y base.js lo muestra en un aviso. */
  if (!perfil || perfil.rol !== "admin") {
    window.location.href = "index.html?aviso=sin-permisos";
    return;
  }

  document.querySelector("#adminCargando").classList.add("d-none");
  document.querySelector("#adminSaludo").textContent = `Hola, ${perfil.nombre}. Gestioná los productos y los pedidos de la tienda.`;
  document.querySelector("#adminContenido").classList.remove("d-none");

  cargarProductosAdmin();
  cargarPedidosAdmin();
});

/* ---------------------------------------------------------------
   2. PRODUCTOS: LISTADO
   --------------------------------------------------------------- */
const tablaProductos = document.querySelector("#tablaProductos");
const estadoProductosAdmin = document.querySelector("#estadoProductosAdmin");

function htmlFilaProducto(producto) {
  let estado = '<span class="badge text-bg-success">Activo</span>';
  let textoActivar = "Desactivar";

  if (!producto.disponible) {
    estado = '<span class="badge text-bg-secondary">Inactivo</span>';
    textoActivar = "Activar";
  }

  if (producto.destacado) {
    estado += ' <span class="badge text-bg-info">Destacado</span>';
  }

  let claseStock = "";

  if (producto.stock === 0) {
    claseStock = "text-danger fw-bold";
  }

  return `
    <tr>
      <td>
        <strong>${producto.nombre}</strong>
        <span class="d-block small texto-suave">${producto.id}</span>
      </td>
      <td>${producto.categoria}</td>
      <td class="text-end text-nowrap">${formatearPrecio(producto.precio)}</td>
      <td class="text-end ${claseStock}">${producto.stock}</td>
      <td>${estado}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-outline-primary btn-sm" type="button" data-editar="${producto.id}">Editar</button>
        <button class="btn btn-outline-secondary btn-sm" type="button" data-activar="${producto.id}">${textoActivar}</button>
        <button class="btn btn-outline-danger btn-sm" type="button" data-eliminar="${producto.id}">Eliminar</button>
      </td>
    </tr>
  `;
}

function mostrarProductosAdmin() {
  tablaProductos.innerHTML = "";
  estadoProductosAdmin.innerHTML = "";

  if (productos.length === 0) {
    estadoProductosAdmin.innerHTML = htmlMensaje("Todavía no hay productos. Creá el primero con el botón Nuevo producto.");
  }

  /* Ordenados como en la tienda: p1, p2, p3... */
  productos.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));

  productos.forEach((producto) => {
    tablaProductos.innerHTML += htmlFilaProducto(producto);
  });

  const inactivos = productos.filter((p) => !p.disponible).length;
  const sinStock = productos.filter((p) => p.stock === 0).length;
  document.querySelector("#resumenProductosAdmin").textContent =
    `${productos.length} productos · ${inactivos} inactivos · ${sinStock} sin stock`;

  /* Categorías existentes como sugerencias del campo Categoría */
  const categorias = [];

  productos.forEach((producto) => {
    if (!categorias.includes(producto.categoria)) {
      categorias.push(producto.categoria);
    }
  });

  document.querySelector("#listaCategorias").innerHTML = "";

  categorias.forEach((categoria) => {
    document.querySelector("#listaCategorias").innerHTML += `<option value="${categoria}"></option>`;
  });

  conectarBotonesProductos();
}

async function cargarProductosAdmin() {
  tablaProductos.innerHTML = "";
  estadoProductosAdmin.innerHTML = htmlCargando("Cargando productos…");

  try {
    productos = await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    estadoProductosAdmin.innerHTML = htmlMensaje("No pudimos cargar los productos. Revisá tu conexión y recargá la página.");
    return;
  }

  mostrarProductosAdmin();
}

/* ---------------------------------------------------------------
   3. PRODUCTOS: ACTIVAR, DESACTIVAR Y ELIMINAR
   --------------------------------------------------------------- */
function conectarBotonesProductos() {
  document.querySelectorAll("[data-editar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      abrirFormulario(boton.dataset.editar);
    });
  });

  document.querySelectorAll("[data-activar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      cambiarDisponibilidad(boton.dataset.activar, boton);
    });
  });

  document.querySelectorAll("[data-eliminar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      borrarProducto(boton.dataset.eliminar, boton);
    });
  });
}

/* Desactivar no borra nada: el producto deja de verse en la tienda
   pero conserva sus datos, sus opiniones y su lugar en los pedidos */
async function cambiarDisponibilidad(idProducto, boton) {
  const producto = productos.find((p) => p.id === idProducto);
  boton.disabled = true;

  try {
    await actualizarProducto(idProducto, { disponible: !producto.disponible });

    if (producto.disponible) {
      mostrarAviso(`${producto.nombre} ya no se muestra en la tienda.`);
    } else {
      mostrarAviso(`${producto.nombre} vuelve a estar a la venta.`);
    }

    await cargarProductosAdmin();
  } catch (error) {
    console.error("Error al cambiar la disponibilidad:", error);
    mostrarAviso("No pudimos actualizar el producto. Probá de nuevo.");
    boton.disabled = false;
  }
}

async function borrarProducto(idProducto, boton) {
  const producto = productos.find((p) => p.id === idProducto);

  const confirmado = confirm(
    `¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.\n\n` +
    "Si solo querés que no se venda por un tiempo, usá Desactivar."
  );

  if (!confirmado) return;

  boton.disabled = true;

  try {
    await eliminarProducto(idProducto);
    mostrarAviso(`${producto.nombre} se eliminó.`);
    await cargarProductosAdmin();
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    mostrarAviso("No pudimos eliminar el producto. Probá de nuevo.");
    boton.disabled = false;
  }
}

/* ---------------------------------------------------------------
   4. PRODUCTOS: FORMULARIO DE ALTA Y EDICIÓN
   --------------------------------------------------------------- */
const formProducto = document.querySelector("#formProducto");
const mensajeFormProducto = document.querySelector("#mensajeFormProducto");

function campo(id) {
  return document.querySelector(`#${id}`);
}

/* Sin id: formulario vacío para un producto nuevo.
   Con id: formulario con los datos actuales del producto. */
function abrirFormulario(idProducto) {
  idEnEdicion = idProducto || null;
  mensajeFormProducto.className = "alert d-none mt-3 mb-0";

  if (idEnEdicion) {
    const producto = productos.find((p) => p.id === idEnEdicion);

    campo("tituloFormProducto").textContent = `Editar · ${producto.nombre}`;
    campo("prodNombre").value = producto.nombre;
    campo("prodCategoria").value = producto.categoria;
    campo("prodDescripcion").value = producto.descripcion;
    campo("prodPrecio").value = producto.precio;
    campo("prodStock").value = producto.stock;
    campo("prodDisponible").checked = producto.disponible;
    campo("prodDestacado").checked = producto.destacado === true;
    campo("prodImagen").value = producto.imagenes[0];
    campo("prodImagenAlt").value = producto.imagenAlt;
    campo("prodCaracteristicas").value = producto.caracteristicas.join("\n");
  } else {
    campo("tituloFormProducto").textContent = "Nuevo producto";
    formProducto.reset();
    campo("prodDisponible").checked = true;
  }

  formProducto.classList.remove("d-none");
  formProducto.scrollIntoView({ behavior: "smooth", block: "start" });
  campo("prodNombre").focus();
}

function cerrarFormulario() {
  formProducto.classList.add("d-none");
  formProducto.reset();
  idEnEdicion = null;
}

/* Lee el formulario y devuelve { datos, problemas } */
function leerFormulario() {
  const problemas = [];

  const nombre = campo("prodNombre").value.trim();
  const categoria = campo("prodCategoria").value.trim();
  const descripcion = campo("prodDescripcion").value.trim();
  const precio = Number(campo("prodPrecio").value);
  const stock = Number(campo("prodStock").value);
  const imagen = campo("prodImagen").value.trim();
  let imagenAlt = campo("prodImagenAlt").value.trim();

  /* Una característica por línea: se separa con split() y se
     descartan las líneas vacías */
  const caracteristicas = campo("prodCaracteristicas").value
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea !== "");

  if (nombre.length < 3) problemas.push("El nombre debe tener al menos 3 caracteres.");
  if (categoria === "") problemas.push("Indicá la categoría.");
  if (descripcion.length < 10) problemas.push("La descripción debe tener al menos 10 caracteres.");
  if (campo("prodPrecio").value === "" || !(precio > 0)) problemas.push("El precio debe ser mayor que 0.");
  if (campo("prodStock").value === "" || !Number.isInteger(stock) || stock < 0) {
    problemas.push("El stock debe ser un número entero igual o mayor que 0.");
  }

  /* Semana 11: rutas relativas o URL, nunca rutas de una computadora */
  if (imagen === "") {
    problemas.push("Indicá la ruta o la URL de la imagen.");
  } else if (imagen.includes("\\") || imagen.startsWith("file:")) {
    problemas.push("Usá una ruta relativa (assets/img/productos/teclado.jpg) o una URL, no una ruta de tu computadora.");
  }

  if (imagenAlt === "") {
    imagenAlt = nombre;
  }

  /* Si se edita, se cambia solo la imagen principal y se conservan
     las demás del arreglo */
  let imagenes = [imagen];

  if (idEnEdicion) {
    const producto = productos.find((p) => p.id === idEnEdicion);
    imagenes = [imagen, ...producto.imagenes.slice(1)];
  }

  const datos = {
    nombre: nombre,
    descripcion: descripcion,
    categoria: categoria,
    precio: precio,
    stock: stock,
    disponible: campo("prodDisponible").checked,
    destacado: campo("prodDestacado").checked,
    imagenes: imagenes,
    imagenAlt: imagenAlt,
    caracteristicas: caracteristicas
  };

  return { datos: datos, problemas: problemas };
}

formProducto.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const { datos, problemas } = leerFormulario();

  if (problemas.length > 0) {
    let lista = "";

    problemas.forEach((problema) => {
      lista += `<li>${problema}</li>`;
    });

    mensajeFormProducto.innerHTML = `Revisá estos datos:<ul class="mb-0 mt-1">${lista}</ul>`;
    mensajeFormProducto.className = "alert alert-warning mt-3 mb-0";
    return;
  }

  const boton = campo("btnGuardarProducto");
  boton.disabled = true;
  boton.textContent = "Guardando…";

  try {
    if (idEnEdicion) {
      /* updateDoc(): cambia los campos del formulario y nada más */
      await actualizarProducto(idEnEdicion, datos);
      mostrarAviso(`${datos.nombre} se actualizó.`);
    } else {
      /* setDoc() con el próximo id libre (p13, p14...) */
      await guardarProducto(siguienteIdProducto(productos), datos);
      mostrarAviso(`${datos.nombre} se agregó a la tienda.`);
    }

    cerrarFormulario();
    await cargarProductosAdmin();
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    mensajeFormProducto.textContent = "No pudimos guardar el producto. Revisá tu conexión y volvé a intentar.";
    mensajeFormProducto.className = "alert alert-danger mt-3 mb-0";
  }

  boton.disabled = false;
  boton.textContent = "Guardar producto";
});

campo("btnNuevoProducto").addEventListener("click", () => {
  abrirFormulario(null);
});

campo("btnCancelarProducto").addEventListener("click", () => {
  cerrarFormulario();
});

/* ---------------------------------------------------------------
   5. PEDIDOS: CONSULTA Y CAMBIO DE ESTADO
   --------------------------------------------------------------- */
const listaPedidosAdmin = document.querySelector("#listaPedidosAdmin");

function htmlPedidoAdmin(pedido) {
  /* Los datos del pedido los guardó el navegador del cliente: se
     escapan antes de insertarlos (ver escaparHtml() en base.js) */
  const id = escaparHtml(pedido.id);
  let filas = "";

  pedido.productos.forEach((item) => {
    filas += `<li>${escaparHtml(item.nombre)} × ${escaparHtml(item.cantidad)} · ${escaparHtml(formatearPrecio(item.subtotal))}</li>`;
  });

  /* Un pedido cancelado ya devolvió su stock: no se puede cambiar */
  let deshabilitado = "";

  if (pedido.estado === "cancelado") {
    deshabilitado = "disabled";
  }

  let opciones = "";

  ESTADOS_PEDIDO.forEach((estado) => {
    let seleccionado = "";

    if (estado === pedido.estado) {
      seleccionado = "selected";
    }

    opciones += `<option value="${estado}" ${seleccionado}>${estado}</option>`;
  });

  /* Pago (Sprint 4): forma, estado y número de pago de Mercado Pago */
  let pago = describirPago(pedido);

  if (pedido.pago && pedido.pago.idOperacion) {
    pago += ` · ${escaparHtml(pedido.pago.idOperacion)}`;
  }

  const fecha = pedido.fecha.toDate().toLocaleString("es-UY", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return `
    <div class="col-lg-6">
      <article class="tarjeta-pedido h-100">
        <header class="encabezado-pedido">
          <div>
            <h3 class="h6 mb-1">Pedido #${escaparHtml(pedido.id.slice(0, 6).toUpperCase())}</h3>
            <p class="small mb-0">${escaparHtml(pedido.nombreUsuario)} · <span class="texto-suave">${escaparHtml(pedido.correo)}</span></p>
            <p class="small texto-suave mb-0">${fecha}</p>
          </div>
          <span class="estado-pedido">${escaparHtml(pedido.estado)}</span>
        </header>
        <ul class="small mb-2">${filas}</ul>
        <p class="linea-pedido total-pedido"><span>Total</span><span>${escaparHtml(formatearPrecio(pedido.total))}</span></p>
        <p class="linea-pago mb-2">${pago}</p>
        <div class="d-flex gap-2 mt-2">
          <label class="visually-hidden" for="estado-${id}">Estado del pedido</label>
          <select class="form-select form-select-sm" id="estado-${id}" ${deshabilitado}>${opciones}</select>
          <button class="btn btn-primary btn-sm text-nowrap" type="button" data-pedido="${id}" ${deshabilitado}>
            Actualizar
          </button>
        </div>
      </article>
    </div>
  `;
}

function mostrarPedidosAdmin() {
  listaPedidosAdmin.innerHTML = "";

  if (pedidos.length === 0) {
    listaPedidosAdmin.innerHTML = htmlMensaje("Todavía no hay pedidos registrados.");
    document.querySelector("#resumenPedidosAdmin").textContent = "";
    return;
  }

  const pendientes = pedidos.filter((p) => p.estado === "pendiente").length;
  document.querySelector("#resumenPedidosAdmin").textContent = `${pedidos.length} pedidos · ${pendientes} pendientes`;

  pedidos.forEach((pedido) => {
    listaPedidosAdmin.innerHTML += htmlPedidoAdmin(pedido);
  });

  document.querySelectorAll("[data-pedido]").forEach((boton) => {
    boton.addEventListener("click", () => {
      actualizarEstado(boton.dataset.pedido, boton);
    });
  });
}

async function cargarPedidosAdmin() {
  listaPedidosAdmin.innerHTML = htmlCargando("Cargando pedidos…");

  try {
    pedidos = await obtenerTodosLosPedidos();
  } catch (error) {
    console.error("Error al cargar los pedidos:", error);
    listaPedidosAdmin.innerHTML = htmlMensaje("No pudimos cargar los pedidos. Revisá tu conexión y recargá la página.");
    return;
  }

  mostrarPedidosAdmin();
}

async function actualizarEstado(idPedido, boton) {
  const pedido = pedidos.find((p) => p.id === idPedido);
  const nuevoEstado = document.querySelector(`#estado-${idPedido}`).value;

  if (nuevoEstado === pedido.estado) {
    mostrarAviso("El pedido ya tiene ese estado.");
    return;
  }

  if (nuevoEstado === "cancelado") {
    const confirmado = confirm("¿Cancelar este pedido? Las unidades vuelven al stock y el estado ya no se podrá cambiar.");

    if (!confirmado) return;
  }

  boton.disabled = true;

  try {
    await cambiarEstadoPedido(pedido, nuevoEstado);
    mostrarAviso(`El pedido #${idPedido.slice(0, 6).toUpperCase()} pasó a "${nuevoEstado}".`);
    await cargarPedidosAdmin();

    /* Cancelar cambia el stock: se actualiza también la tabla */
    if (nuevoEstado === "cancelado") {
      await cargarProductosAdmin();
    }
  } catch (error) {
    console.error("Error al cambiar el estado:", error);
    mostrarAviso("No pudimos actualizar el pedido. Probá de nuevo.");
    boton.disabled = false;
  }
}
