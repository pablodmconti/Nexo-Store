/* =====================================================================
Ficha del producto
   ---------------------------------------------------------------------
   producto.html es una sola página para todos los productos. El id
   viaja en la URL (producto.html?id=p1) y, desde el Sprint 3, con ese
   id se pide a Firestore un único documento con getDoc().
   ===================================================================== */

import { auth } from "./firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { obtenerProducto } from "./modules/productos-firestore.js";
import { agregarConValidacion } from "./modules/agregar-carrito.js";
import {
  obtenerValoraciones,
  guardarValoracion,
  validarValoracion
} from "./modules/valoraciones.js";

const estadoProducto = document.querySelector("#estadoProducto");

/* Completa la ficha con los datos del producto encontrado */
function mostrarProducto(producto) {
  /* Imagen principal y texto alternativo */
  const imagen = document.querySelector("#productoImagen");
  imagen.src = producto.imagenes[0];
  imagen.alt = producto.imagenAlt;

  /* Textos de la ficha */
  document.querySelector("#productoCategoria").textContent = producto.categoria;
  document.querySelector("#productoNombre").textContent = producto.nombre;
  document.querySelector("#productoDescripcion").textContent = producto.descripcion;
  document.querySelector("#productoPrecio").textContent = formatearPrecio(producto.precio);

  /* Características: una línea de la lista por cada texto del array */
  const lista = document.querySelector("#productoCaracteristicas");
  lista.innerHTML = "";

  producto.caracteristicas.forEach((caracteristica) => {
    lista.innerHTML += `<li>${caracteristica}</li>`;
  });

  /* Estado del producto. Primero se mira si está activo en la tienda;
     si lo está, el mensaje y el color del stock salen de
     describirStock(), en base.js, igual que en las tarjetas. */
  const stock = document.querySelector("#productoStock");
  const boton = document.querySelector("#btnAgregarCarrito");

  if (!producto.disponible) {
    stock.textContent = "No disponible por el momento";
    stock.classList.add("agotado");
    boton.textContent = "No disponible";
    boton.disabled = true;
  } else {
    const disponibilidad = describirStock(producto.stock);
    stock.textContent = disponibilidad.texto;
    stock.classList.add(disponibilidad.clase);

    if (producto.stock <= 0) {
      boton.textContent = "Sin stock por ahora";
      boton.disabled = true;
    }
  }

  /* El nombre del producto también en la pestaña del navegador */
  document.title = `Nivel 99 | ${producto.nombre}`;

  /* Recién ahora se muestra la ficha, ya completa */
  estadoProducto.innerHTML = "";
  document.querySelector("#detalleProducto").classList.remove("d-none");
}

/* Muestra el aviso de producto inexistente en lugar de la ficha */
function mostrarMensajeError() {
  estadoProducto.innerHTML = "";
  document.querySelector("#mensajeError").classList.remove("d-none");
}

/* ---------------------------------------------------------------
   RECORRIDO COMPLETO: de la URL al producto mostrado
   --------------------------------------------------------------- */
async function iniciarFicha() {
  /* 1. Se lee el parámetro "id" de la URL actual ("?id=p1") */
  const parametros = new URLSearchParams(window.location.search);
  const idProducto = parametros.get("id");

  /* Sin id no hay nada que buscar: es el caso del enlace "Producto"
     del menú, así que se invita a elegir uno en lugar de mostrar un error */
  if (!idProducto) {
    document.querySelector("#textoMensajeError").textContent =
      "Elegí un producto del catálogo para ver su ficha completa: precio, stock, características y opiniones.";
    mostrarMensajeError();
    return;
  }

  /* 2. Estado de carga mientras Firestore responde */
  estadoProducto.innerHTML = htmlCargando("Cargando el producto…");

  /* 3. Se pide el documento productos/{id} */
  let producto;

  try {
    producto = await obtenerProducto(idProducto);
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    estadoProducto.innerHTML = htmlMensaje("No pudimos cargar el producto. Revisá tu conexión a internet y recargá la página.");
    return;
  }

  /* 4. obtenerProducto() devuelve null si el id no existe */
  if (!producto) {
    mostrarMensajeError();
    return;
  }

  mostrarProducto(producto);
  iniciarOpiniones(producto.id);

  /* 5. Agregar al carrito: se vuelve a consultar el stock en el momento */
  const boton = document.querySelector("#btnAgregarCarrito");
  boton.addEventListener("click", () => {
    agregarConValidacion(producto.id, boton);
  });
}

/* ---------------------------------------------------------------
   OPINIONES Y VALORACIONES 
   --------------------------------------------------------------- */
let idProductoActual = null;
let usuarioActual = null;
let valoraciones = [];

const formOpinion = document.querySelector("#formOpinion");
const mensajeOpinion = document.querySelector("#mensajeOpinion");

/* "★★★★☆" para una puntuación de 4 */
function estrellas(puntuacion) {
  return "★".repeat(puntuacion) + "☆".repeat(5 - puntuacion);
}

/* Promedio y cantidad de opiniones, arriba del formulario */
function mostrarResumenOpiniones() {
  const resumen = document.querySelector("#resumenOpiniones");

  if (valoraciones.length === 0) {
    resumen.textContent = "Todavía no hay opiniones. ¡Sé la primera persona en opinar!";
    return;
  }

  const suma = valoraciones.reduce((total, v) => total + v.puntuacion, 0);
  const promedio = suma / valoraciones.length;

  let palabra = "opiniones";

  if (valoraciones.length === 1) {
    palabra = "opinión";
  }

  resumen.textContent = `${estrellas(Math.round(promedio))} ${promedio.toFixed(1)} de 5 · ${valoraciones.length} ${palabra}`;
}

/* Dibuja cada opinión. El nombre y el comentario los escribió una
   persona, así que se insertan con textContent y NO con innerHTML:
   si alguien escribiera etiquetas HTML, se verían como texto y no
   se ejecutarían. */
function mostrarListaOpiniones() {
  const lista = document.querySelector("#listaOpiniones");
  lista.innerHTML = "";

  valoraciones.forEach((valoracion) => {
    const columna = document.createElement("div");
    columna.className = "col-12";

    const tarjeta = document.createElement("article");
    tarjeta.className = "opinion";

    const cabecera = document.createElement("p");
    cabecera.className = "cabecera-opinion";

    const nombre = document.createElement("strong");
    nombre.textContent = valoracion.nombreUsuario;

    const puntos = document.createElement("span");
    puntos.className = "estrellas";
    puntos.textContent = estrellas(valoracion.puntuacion);
    puntos.setAttribute("aria-label", `${valoracion.puntuacion} de 5 estrellas`);

    const fecha = document.createElement("span");
    fecha.className = "texto-suave small";
    fecha.textContent = valoracion.fecha.toDate().toLocaleDateString("es-UY");

    const comentario = document.createElement("p");
    comentario.className = "mb-0";
    comentario.textContent = valoracion.comentario;

    cabecera.append(nombre, puntos, fecha);
    tarjeta.append(cabecera, comentario);
    columna.append(tarjeta);
    lista.append(columna);
  });
}

/* Muestra el formulario o la invitación a ingresar según la sesión.
   Si el usuario ya había opinado, el formulario trae su opinión
   para que pueda editarla (hay una sola por persona y producto). */
function actualizarFormularioOpinion() {
  const sinSesion = document.querySelector("#opinionSinSesion");

  if (!usuarioActual) {
    formOpinion.classList.add("d-none");
    sinSesion.classList.remove("d-none");
    return;
  }

  sinSesion.classList.add("d-none");
  formOpinion.classList.remove("d-none");

  const miOpinion = valoraciones.find((v) => v.uid === usuarioActual.uid);

  if (miOpinion) {
    document.querySelector("#tituloFormOpinion").textContent = "Tu opinión";
    document.querySelector("#opinionPuntuacion").value = miOpinion.puntuacion;
    document.querySelector("#opinionComentario").value = miOpinion.comentario;
    document.querySelector("#btnPublicarOpinion").textContent = "Actualizar mi opinión";
  }
}

async function cargarOpiniones() {
  const lista = document.querySelector("#listaOpiniones");
  lista.innerHTML = htmlCargando("Cargando opiniones…");

  try {
    valoraciones = await obtenerValoraciones(idProductoActual);
  } catch (error) {
    console.error("Error al cargar las opiniones:", error);
    lista.innerHTML = htmlMensaje("No pudimos cargar las opiniones en este momento.");
    return;
  }

  mostrarResumenOpiniones();
  mostrarListaOpiniones();
  actualizarFormularioOpinion();
}

function iniciarOpiniones(idProducto) {
  idProductoActual = idProducto;

  /* El enlace de ingreso vuelve a esta misma ficha */
  document.querySelector("#enlaceIngresarOpinion").href = `login.html?volver=producto.html?id=${idProducto}`;
  document.querySelector("#seccionOpiniones").classList.remove("d-none");

  cargarOpiniones();
}

function mostrarMensajeOpinion(texto, tipo) {
  mensajeOpinion.textContent = texto;
  mensajeOpinion.className = `alert alert-${tipo}`;
}

/* La sesión puede confirmarse antes o después de cargar las opiniones:
   en los dos casos se actualiza el formulario */
onAuthStateChanged(auth, (usuario) => {
  usuarioActual = usuario;

  if (idProductoActual) {
    actualizarFormularioOpinion();
  }
});

formOpinion.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!usuarioActual) {
    mostrarMensajeOpinion("Tenés que iniciar sesión para opinar.", "warning");
    return;
  }

  const puntuacion = Number(document.querySelector("#opinionPuntuacion").value);
  const comentario = document.querySelector("#opinionComentario").value.trim();

  /* Validación antes de ir a Firestore */
  const problema = validarValoracion(puntuacion, comentario);

  if (problema !== "") {
    mostrarMensajeOpinion(problema, "warning");
    return;
  }

  const boton = document.querySelector("#btnPublicarOpinion");
  boton.disabled = true;
  boton.textContent = "Publicando…";

  try {
    await guardarValoracion(usuarioActual, idProductoActual, puntuacion, comentario);
    mostrarMensajeOpinion("¡Gracias! Tu opinión quedó publicada.", "success");
    await cargarOpiniones();
  } catch (error) {
    console.error("Error al guardar la opinión:", error);
    mostrarMensajeOpinion("No pudimos publicar tu opinión. Revisá tu conexión y volvé a intentar.", "danger");
  }

  boton.disabled = false;
  const miOpinion = valoraciones.find((v) => v.uid === usuarioActual.uid);

  if (miOpinion) {
    boton.textContent = "Actualizar mi opinión";
  } else {
    boton.textContent = "Publicar opinión";
  }
});

iniciarFicha();
