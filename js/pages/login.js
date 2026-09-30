/* =====================================================================
Página login.html (ingresar y crear cuenta)
   ---------------------------------------------------------------------

   Esta página se ocupa de la parte visible: leer los formularios,
   validar los campos, deshabilitar el botón mientras Firebase
   responde y mostrar los mensajes. Las operaciones con Firebase
   están en js/modules/auth.js.
   ===================================================================== */

import { auth } from "../firebase/config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { registrarUsuario, iniciarSesion, traducirError } from "../modules/auth.js";

const formIngresar = document.querySelector("#formIngresar");
const formRegistro = document.querySelector("#formRegistro");
const mensajeAuth = document.querySelector("#mensajeAuth");

/* Mientras se crea la cuenta o se inicia sesión, Firebase avisa del
   nuevo usuario al observador de abajo. Esta bandera evita que ese
   aviso redirija antes de tiempo: en el registro todavía falta
   guardar el nombre y el documento en Firestore, y en los dos casos
   la redirección ya la hace el formulario al terminar. */
let procesando = false;

/* ---------------------------------------------------------------
   A DÓNDE IR DESPUÉS DE INGRESAR
   ---------------------------------------------------------------
   Si se llegó desde el carrito o desde una ficha, la dirección trae
   ?volver=carrito.html (o producto.html?id=p1) y se vuelve ahí.
   Solo se aceptan páginas del propio sitio: una dirección con ":" o
   que empieza con "/" podría llevar a otro sitio, y se descarta. */
function destinoDespuesDeIngresar() {
  const parametros = new URLSearchParams(window.location.search);
  const volver = parametros.get("volver");

  if (volver && !volver.includes(":") && !volver.startsWith("/")) {
    return volver;
  }

  return "perfil.html";
}

/* ---------------------------------------------------------------
   1. SI YA HAY UNA SESIÓN, NO TIENE SENTIDO QUEDARSE ACÁ
   --------------------------------------------------------------- */
onAuthStateChanged(auth, (usuario) => {
  if (usuario && !procesando) {
    window.location.href = destinoDespuesDeIngresar();
  }
});

/* ---------------------------------------------------------------
   2. AYUDAS PARA LA INTERFAZ
   --------------------------------------------------------------- */

/* Muestra un mensaje general arriba de los formularios.
   tipo: "danger" (error) o "success" (todo bien) */
function mostrarMensaje(texto, tipo) {
  mensajeAuth.textContent = texto;
  mensajeAuth.className = `alert alert-${tipo}`;
}

function ocultarMensaje() {
  mensajeAuth.className = "alert d-none";
}

/* Marca un campo en rojo con su explicación, o lo limpia si el
   mensaje viene vacío. Usa las clases de validación de Bootstrap. */
function marcarCampo(idCampo, mensaje) {
  const campo = document.querySelector(`#${idCampo}`);
  const error = document.querySelector(`#${idCampo}Error`); // ej.: #registroNombreError

  error.textContent = mensaje;
  campo.classList.toggle("is-invalid", mensaje !== "");
}

/* Mientras Firebase responde, el botón no se puede volver a apretar
   (así no se crean dos cuentas con dos clics) y cambia su texto. */
function botonCargando(boton, cargando, textoCargando, textoNormal) {
  boton.disabled = cargando;

  if (cargando) {
    boton.textContent = textoCargando;
  } else {
    boton.textContent = textoNormal;
  }
}

/* Un correo válido tiene algo antes de la @, y un punto después de
   ella que no esté al final. Tampoco puede tener espacios. */
function correoValido(correo) {
  const arroba = correo.indexOf("@");
  const punto = correo.lastIndexOf(".");

  return arroba > 0 && punto > arroba + 1 && punto < correo.length - 1 && !correo.includes(" ");
}

/* ---------------------------------------------------------------
   3. INICIAR SESIÓN
   --------------------------------------------------------------- */
formIngresar.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarMensaje();

  const correo = document.querySelector("#ingresoCorreo").value.trim();
  const contrasena = document.querySelector("#ingresoContrasena").value;
  let valido = true;

  if (correo === "") {
    marcarCampo("ingresoCorreo", "Escribí tu correo.");
    valido = false;
  } else if (!correoValido(correo)) {
    marcarCampo("ingresoCorreo", "Revisá el correo: debe tener la forma nombre@correo.com.");
    valido = false;
  } else {
    marcarCampo("ingresoCorreo", "");
  }

  if (contrasena === "") {
    marcarCampo("ingresoContrasena", "Escribí tu contraseña.");
    valido = false;
  } else {
    marcarCampo("ingresoContrasena", "");
  }

  if (!valido) return;

  const boton = document.querySelector("#btnFormIngresar");
  botonCargando(boton, true, "Ingresando…", "Ingresar");
  procesando = true;

  try {
    await iniciarSesion(correo, contrasena);
    window.location.href = destinoDespuesDeIngresar();
  } catch (error) {
    procesando = false;
    mostrarMensaje(traducirError(error), "danger");
    botonCargando(boton, false, "Ingresando…", "Ingresar");
  }
});

/* ---------------------------------------------------------------
   4. CREAR UNA CUENTA
   --------------------------------------------------------------- */
formRegistro.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  ocultarMensaje();

  const nombre = document.querySelector("#registroNombre").value.trim();
  const correo = document.querySelector("#registroCorreo").value.trim();
  const contrasena = document.querySelector("#registroContrasena").value;
  const repetir = document.querySelector("#registroRepetir").value;
  let valido = true;

  if (nombre.length < 2) {
    marcarCampo("registroNombre", "Escribí tu nombre (al menos 2 letras).");
    valido = false;
  } else {
    marcarCampo("registroNombre", "");
  }

  if (correo === "") {
    marcarCampo("registroCorreo", "Escribí tu correo.");
    valido = false;
  } else if (!correoValido(correo)) {
    marcarCampo("registroCorreo", "Revisá el correo: debe tener la forma nombre@correo.com.");
    valido = false;
  } else {
    marcarCampo("registroCorreo", "");
  }

  if (contrasena.length < 6) {
    marcarCampo("registroContrasena", "La contraseña debe tener al menos 6 caracteres.");
    valido = false;
  } else {
    marcarCampo("registroContrasena", "");
  }

  if (repetir === "") {
    marcarCampo("registroRepetir", "Repetí la contraseña.");
    valido = false;
  } else if (repetir !== contrasena) {
    marcarCampo("registroRepetir", "Las contraseñas no coinciden.");
    valido = false;
  } else {
    marcarCampo("registroRepetir", "");
  }

  if (!valido) return;

  const boton = document.querySelector("#btnFormRegistro");
  botonCargando(boton, true, "Creando la cuenta…", "Crear mi cuenta");
  procesando = true;

  try {
    await registrarUsuario(nombre, correo, contrasena);
    window.location.href = destinoDespuesDeIngresar();
  } catch (error) {
    procesando = false;

    /* Si la cuenta llegó a crearse pero falló Firestore, igual hay
       una sesión abierta: se lleva al perfil, que avisa que faltan
       los datos guardados. */
    if (auth.currentUser) {
      window.location.href = destinoDespuesDeIngresar();
    } else {
      mostrarMensaje(traducirError(error), "danger");
      botonCargando(boton, false, "Creando la cuenta…", "Crear mi cuenta");
    }
  }
});
