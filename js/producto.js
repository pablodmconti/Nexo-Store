/* =====================================================================
Ficha del producto
   ---------------------------------------------------------------------
   producto.html es una sola página para todos los productos. El id
   viaja en la URL (producto.html?id=p1) y, desde el Sprint 3, con ese
   id se pide a Firestore un único documento con getDoc().
   ===================================================================== */

import { obtenerProducto } from "./modules/productos-firestore.js";
import { agregarConValidacion } from "./modules/agregar-carrito.js";

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

  /* Sin id no hay nada que buscar */
  if (!idProducto) {
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

  /* 5. Agregar al carrito: se vuelve a consultar el stock en el momento */
  const boton = document.querySelector("#btnAgregarCarrito");
  boton.addEventListener("click", () => {
    agregarConValidacion(producto.id, boton);
  });
}

iniciarFicha();
