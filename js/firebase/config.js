/* Conecta el proyecto con Firebase y organiza la configuración: js/firebase/config.js */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* Objeto que entrega la consola de Firebase al registrar la app web */
const firebaseConfig = {
  apiKey: "AIzaSyBHIJuumx0Q1kBGuOin7bAE05R6QXBymds",
  authDomain: "login-nexostore.firebaseapp.com",
  projectId: "login-nexostore",
  storageBucket: "login-nexostore.firebasestorage.app",
  messagingSenderId: "662435649449",
  appId: "1:662435649449:web:24a6e6727e9690d99456b8"
};

/* Se inicializa una sola vez y se exportan los dos servicios */
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);   // Authentication: quién es el usuario
export const db = getFirestore(app); // Cloud Firestore: sus datos (nombre, rol, fecha)
