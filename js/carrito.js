/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/carrito.js - Carrito de compras (Sprint 2 · 13/9)
   ---------------------------------------------------------------------
   carrito.html empieza vacía: esta página se dibuja entera desde acá,
   a partir del carrito guardado en LocalStorage y del array
   "productos" de js/productos.js.

   El carrito guarda solamente { idProducto, cantidad }. El nombre, la
   imagen, el precio y el stock se buscan con find() en el array de
   productos cada vez que hay que mostrarlos o calcular un total.

   Cada acción del usuario repite siempre el mismo ciclo:
     acción → modificar el arreglo → guardarCarrito() → mostrarCarrito()

   Contenidos de clase utilizados:
     Semana 5 · const y let, funciones, funciones flecha, template
               literals, if / else, ===, arrays de objetos, forEach(),
               find(), filter(), reduce()
     Semana 6 · querySelector(), querySelectorAll(), innerHTML,
               textContent, classList, addEventListener()
     Semana 8 · localStorage, JSON.stringify() y JSON.parse(),
               eventos en botones creados dinámicamente, data-id

   Depende de que js/base.js y js/productos.js se carguen antes que
   este archivo: de ahí salen obtenerCarrito(), guardarCarrito(),
   contarUnidades(), formatearPrecio(), describirStock() y
   mostrarAviso().
   ===================================================================== */

/* ---------------------------------------------------------------
   1. CÁLCULOS
   --------------------------------------------------------------- */

/* Lo que cuesta un producto por la cantidad elegida */
function calcularSubtotal(producto, cantidad) {
  return producto.precio * cantidad;
}

/* Suma los subtotales de todo el carrito.
   reduce() recorre el arreglo arrastrando un acumulador: empieza en 0
   y en cada vuelta le suma el subtotal de ese ítem. */
function calcularTotal() {
  const carrito = obtenerCarrito();

  return carrito.reduce((total, item) => {
    const producto = productos.find((p) => p.id === item.idProducto);
    return total + calcularSubtotal(producto, item.cantidad);
  }, 0);
}

/* ---------------------------------------------------------------
   2. MOSTRAR EL CARRITO
   --------------------------------------------------------------- */

/* Actualiza el panel lateral con las unidades y el total */
function mostrarResumen() {
  const carrito = obtenerCarrito();

  document.querySelector("#resumenProductos").textContent = carrito.length;
  document.querySelector("#resumenUnidades").textContent = contarUnidades();
  document.querySelector("#resumenTotal").textContent = formatearPrecio(calcularTotal());
}

/* Dibuja una fila por cada producto del carrito.
   Si el carrito está vacío, esconde la lista y muestra el aviso. */
function mostrarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.querySelector("#listaCarrito");
  const seccionCarrito = document.querySelector("#carritoConProductos");
  const seccionVacio = document.querySelector("#carritoVacio");

  if (carrito.length === 0) {
    seccionCarrito.classList.add("d-none");
    seccionVacio.classList.remove("d-none");
    return;
  }

  seccionCarrito.classList.remove("d-none");
  seccionVacio.classList.add("d-none");

  contenedor.innerHTML = "";

  carrito.forEach((item) => {
    /* find() vuelve a aparecer: es la forma de unir los dos arreglos */
    const producto = productos.find((p) => p.id === item.idProducto);
    const disponibilidad = describirStock(producto.stock);
    const subtotal = calcularSubtotal(producto, item.cantidad);

    /* El botón "+" se apaga cuando ya se llegó al tope del stock */
    let sumarDeshabilitado = "";

    if (item.cantidad >= producto.stock) {
      sumarDeshabilitado = "disabled";
    }

    contenedor.innerHTML += `
      <article class="fila-carrito">
        <img class="imagen-carrito" src="${producto.imagen}" alt="${producto.imagenAlt}">
        <div class="datos-carrito">
          <span class="etiqueta-seccion">${producto.categoria}</span>
          <h2 class="h6 nombre-carrito">${producto.nombre}</h2>
          <p class="disponibilidad ${disponibilidad.clase}">${disponibilidad.texto}</p>
          <p class="precio-unitario">${formatearPrecio(producto.precio)} por unidad</p>
        </div>
        <div class="acciones-carrito">
          <div class="control-cantidad">
            <button class="btn-cantidad restar" type="button" data-id="${producto.id}"
                    aria-label="Quitar una unidad de ${producto.nombre}">&minus;</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad sumar" type="button" data-id="${producto.id}" ${sumarDeshabilitado}
                    aria-label="Agregar una unidad de ${producto.nombre}">+</button>
          </div>
          <span class="precio subtotal-carrito">${formatearPrecio(subtotal)}</span>
          <button class="btn-eliminar" type="button" data-id="${producto.id}"
                  aria-label="Eliminar ${producto.nombre} del carrito">Eliminar</button>
        </div>
      </article>
    `;
  });

  conectarBotonesDeLasFilas();
  mostrarResumen();
}

/* ---------------------------------------------------------------
   3. MODIFICAR EL CARRITO
   --------------------------------------------------------------- */

/* Suma una unidad, siempre que quede stock del producto */
function aumentarCantidad(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === idProducto);

  if (item.cantidad < producto.stock) {
    item.cantidad++;
    guardarCarrito(carrito);
    mostrarCarrito();
  } else {
    mostrarAviso(`No hay más stock disponible de ${producto.nombre}.`);
  }
}

/* Resta una unidad. Si quedaba una sola, tiene más sentido sacar el
   producto del carrito que dejarlo en 0. */
function disminuirCantidad(idProducto) {
  const carrito = obtenerCarrito();
  const item = carrito.find((i) => i.idProducto === idProducto);

  if (item.cantidad > 1) {
    item.cantidad--;
    guardarCarrito(carrito);
    mostrarCarrito();
  } else {
    eliminarDelCarrito(idProducto);
  }
}

/* Quita el producto entero. filter() devuelve un arreglo nuevo con
   todos los ítems menos el que se quiere sacar. */
function eliminarDelCarrito(idProducto) {
  const producto = productos.find((p) => p.id === idProducto);
  let carrito = obtenerCarrito();

  carrito = carrito.filter((i) => i.idProducto !== idProducto);

  guardarCarrito(carrito);
  mostrarCarrito();
  mostrarAviso(`${producto.nombre} se quitó del carrito.`);
}

/* Deja el carrito en cero guardando un arreglo vacío */
function vaciarCarrito() {
  guardarCarrito([]);
  mostrarCarrito();
  mostrarAviso("El carrito quedó vacío.");
}

/* ---------------------------------------------------------------
   4. EVENTOS
   --------------------------------------------------------------- */

/* Los botones de cada fila se crean junto con la fila, así que los
   eventos se conectan después de dibujarlas. El id del producto viaja
   en data-id y se lee con dataset.id. */
function conectarBotonesDeLasFilas() {
  document.querySelectorAll(".sumar").forEach((boton) => {
    boton.addEventListener("click", () => {
      aumentarCantidad(boton.dataset.id);
    });
  });

  document.querySelectorAll(".restar").forEach((boton) => {
    boton.addEventListener("click", () => {
      disminuirCantidad(boton.dataset.id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((boton) => {
    boton.addEventListener("click", () => {
      eliminarDelCarrito(boton.dataset.id);
    });
  });
}

/* Estos dos botones sí están en el HTML desde el principio */
document.querySelector("#btnVaciar").addEventListener("click", () => {
  vaciarCarrito();
});

document.querySelector("#btnConfirmar").addEventListener("click", () => {
  mostrarAviso("La compra es simulada: el pago real se desarrolla en el Sprint 3.");
});

/* ---------------------------------------------------------------
   5. ARRANQUE
   ---------------------------------------------------------------
   Al entrar a la página se lee lo que haya quedado guardado en
   LocalStorage, así el carrito sobrevive a recargar o cerrar la
   pestaña. */
mostrarCarrito();
