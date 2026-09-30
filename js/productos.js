/* =====================================================================
Datos de los productos de la tienda (semilla)
   ---------------------------------------------------------------------
   Desde el Sprint 3 este arreglo ya NO es la fuente del catálogo: es la
   semilla que cargar-productos.html sube a la colección "productos" de
   Cloud Firestore con writeBatch().

   export permite importarlo desde otro archivo:
     import { productos } from "../productos.js";

   Las imágenes viven en la carpeta del proyecto (assets/img/productos)
   y en Firestore se guarda solo su ruta relativa, como texto.
   ===================================================================== */

export const productos = [
  {
    id: "p1",
    nombre: "Teclado mecánico TKL Aurora",
    descripcion: "Switches lineales, doble amortiguación y retroiluminación azul regulable.",
    categoria: "Periféricos",
    precio: 4290,
    stock: 12,
    disponible: true,
    imagenes: ["assets/img/productos/teclado-tkl-aurora.jpg"],
    imagenAlt: "Teclado mecánico compacto con retroiluminación azul",
    caracteristicas: [
      "Formato TKL de 87 teclas",
      "Switches mecánicos lineales",
      "Retroiluminación azul regulable",
      "Cable USB-C desmontable",
      "Doble amortiguación interna"
    ]
  },
  {
    id: "p2",
    nombre: "Mouse inalámbrico Vortex 60g",
    descripcion: "Sensor de 26.000 DPI, 70 horas de batería y solo 60 gramos de peso.",
    categoria: "Periféricos",
    precio: 3150,
    stock: 18,
    disponible: true,
    imagenes: ["assets/img/productos/mouse-vortex.jpg"],
    imagenAlt: "Mouse gamer inalámbrico apoyado sobre un escritorio",
    caracteristicas: [
      "Sensor óptico de 26.000 DPI",
      "Peso de 60 gramos",
      "Hasta 70 horas de batería",
      "Conexión inalámbrica 2,4 GHz",
      "Seis botones programables"
    ]
  },
  {
    id: "p3",
    nombre: 'Monitor Nova 27" QHD 165 Hz',
    descripcion: "Panel IPS de 2560 x 1440, 1 ms de respuesta y soporte con altura regulable.",
    categoria: "Monitores",
    precio: 21900,
    stock: 3,
    disponible: true,
    imagenes: ["assets/img/productos/monitor-nova-27.jpg"],
    imagenAlt: "Monitor de escritorio encendido sobre una mesa de trabajo",
    caracteristicas: [
      "Panel IPS de 27 pulgadas",
      "Resolución QHD 2560 x 1440",
      "Frecuencia de 165 Hz",
      "Tiempo de respuesta de 1 ms",
      "Soporte con altura regulable"
    ]
  },
  {
    id: "p4",
    nombre: 'Monitor Nova 24" Full HD 144 Hz',
    descripcion: "Panel VA de 1920 x 1080 pensado para quien arma su primer setup competitivo.",
    categoria: "Monitores",
    precio: 13500,
    stock: 7,
    disponible: true,
    imagenes: ["assets/img/productos/monitor-nova-24.jpg"],
    imagenAlt: "Monitor de computadora sobre un escritorio con luz tenue",
    caracteristicas: [
      "Panel VA de 24 pulgadas",
      "Resolución Full HD 1920 x 1080",
      "Frecuencia de 144 Hz",
      "Entradas HDMI y DisplayPort"
    ]
  },
  {
    id: "p5",
    nombre: "Auriculares Echo 7.1",
    descripcion: "Sonido envolvente por software, micrófono desmontable y almohadillas de memoria.",
    categoria: "Audio y streaming",
    precio: 5480,
    stock: 15,
    disponible: true,
    imagenes: ["assets/img/productos/auriculares-echo.jpg"],
    imagenAlt: "Auriculares over ear apoyados sobre un soporte",
    caracteristicas: [
      "Sonido envolvente 7.1 por software",
      "Micrófono desmontable",
      "Almohadillas de espuma con memoria",
      "Conexión USB y 3,5 mm"
    ]
  },
  {
    id: "p6",
    nombre: "Micrófono Vox Studio USB",
    descripcion: "Cápsula cardioide, brazo articulado incluido y monitoreo sin retardo.",
    categoria: "Audio y streaming",
    precio: 4980,
    stock: 6,
    disponible: true,
    imagenes: ["assets/img/productos/microfono-vox.jpg"],
    imagenAlt: "Micrófono de condensador montado en un brazo articulado",
    caracteristicas: [
      "Cápsula cardioide",
      "Conexión USB, sin instalar drivers",
      "Brazo articulado incluido",
      "Monitoreo sin retardo por auriculares"
    ]
  },
  {
    id: "p7",
    nombre: "Placa de video Titan X8 8 GB",
    descripcion: "Ideal para jugar en 1440p con trazado de rayos y doble ventilador silencioso.",
    categoria: "Componentes",
    precio: 32900,
    stock: 4,
    disponible: true,
    imagenes: ["assets/img/productos/placa-video-titan.jpg"],
    imagenAlt: "Placa de video con dos ventiladores sobre una superficie oscura",
    caracteristicas: [
      "8 GB de memoria de video",
      "Pensada para jugar en 1440p",
      "Trazado de rayos por hardware",
      "Doble ventilador silencioso"
    ]
  },
  {
    id: "p8",
    nombre: "Memoria RAM Pulse 16 GB DDR4",
    descripcion: "Kit de dos módulos de 8 GB a 3200 MHz con disipador de perfil bajo.",
    categoria: "Componentes",
    precio: 3890,
    stock: 20,
    disponible: true,
    imagenes: ["assets/img/productos/memoria-ram-pulse.jpg"],
    imagenAlt: "Módulos de memoria RAM instalados en una placa madre",
    caracteristicas: [
      "Kit de 2 módulos de 8 GB",
      "Tecnología DDR4",
      "Velocidad de 3200 MHz",
      "Disipador de perfil bajo"
    ]
  },
  {
    id: "p9",
    nombre: "Silla gamer Nivel 99 Pro",
    descripcion: "Respaldo reclinable a 155°, apoyabrazos 4D y soporte lumbar regulable.",
    categoria: "Mobiliario",
    precio: 18900,
    stock: 5,
    disponible: true,
    imagenes: ["assets/img/productos/silla-nivel99-pro.jpg"],
    imagenAlt: "Silla gamer negra y azul frente a un escritorio",
    caracteristicas: [
      "Respaldo reclinable hasta 155°",
      "Apoyabrazos 4D",
      "Soporte lumbar regulable",
      "Base de cinco ruedas"
    ]
  },
  {
    id: "p10",
    nombre: "Escritorio Rift 140 cm",
    descripcion: "Superficie de carbono, pasacables integrado y estructura de acero reforzado.",
    categoria: "Mobiliario",
    precio: 12400,
    stock: 2,
    disponible: true,
    imagenes: ["assets/img/productos/escritorio-rift.jpg"],
    imagenAlt: "Escritorio amplio con monitor, teclado y luces led",
    caracteristicas: [
      "Superficie de 140 cm de ancho",
      "Acabado de fibra de carbono",
      "Pasacables integrado",
      "Estructura de acero reforzado"
    ]
  },
  {
    id: "p11",
    nombre: "Alfombrilla XXL Grid",
    descripcion: "90 x 40 cm, base antideslizante y bordes cosidos que no se deshilachan.",
    categoria: "Accesorios",
    precio: 990,
    stock: 30,
    disponible: true,
    imagenes: ["assets/img/productos/alfombrilla-grid.jpg"],
    imagenAlt: "Alfombrilla extra grande cubriendo un escritorio con teclado y mouse",
    caracteristicas: [
      "Medidas de 90 x 40 cm",
      "Base de goma antideslizante",
      "Bordes cosidos",
      "Superficie de tela para control y velocidad"
    ]
  },
  {
    id: "p12",
    nombre: "Soporte para auriculares Halo RGB",
    descripcion: "Base de aluminio con iluminación regulable y dos puertos USB.",
    categoria: "Accesorios",
    precio: 1450,
    stock: 0,
    disponible: true,
    imagenes: ["assets/img/productos/soporte-halo.jpg"],
    imagenAlt: "Soporte iluminado con unos auriculares colgados",
    caracteristicas: [
      "Base de aluminio",
      "Iluminación RGB regulable",
      "Dos puertos USB",
      "Compatible con auriculares de vincha"
    ]
  }
];
