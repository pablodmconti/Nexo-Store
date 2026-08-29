/* =====================================================================
   NIVEL 99 · Gaming Setup Store
   js/productos.js - Origen de datos del catálogo (Sprint 2 · 23/8)
   ---------------------------------------------------------------------
   Los productos dejan de estar escritos a mano en el HTML y pasan a
   vivir en este arreglo de objetos. Cualquier página del sitio que
   necesite productos (catálogo, detalle y carrito) lee de acá, de modo
   que la información queda en un solo lugar.

   Cada producto es un objeto con las siguientes propiedades:
     id          identificador único, se usa en la URL del detalle
     nombre      título visible del producto
     descripcion texto corto para la tarjeta
     categoria   una de las seis categorías de la tienda
     precio      número en pesos uruguayos, sin símbolo ni puntos
     stock       unidades disponibles (0 significa agotado)
     imagen      URL de la fotografía
     imagenAlt   texto alternativo de la fotografía
   ===================================================================== */

const productos = [
  {
    id: "p1",
    nombre: "Teclado mecánico TKL Aurora",
    descripcion: "Switches lineales, doble amortiguación y retroiluminación azul regulable.",
    categoria: "Periféricos",
    precio: 4290,
    stock: 12,
    imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Teclado mecánico compacto con retroiluminación azul"
  },
  {
    id: "p2",
    nombre: "Mouse inalámbrico Vortex 60g",
    descripcion: "Sensor de 26.000 DPI, 70 horas de batería y solo 60 gramos de peso.",
    categoria: "Periféricos",
    precio: 3150,
    stock: 18,
    imagen: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Mouse gamer inalámbrico apoyado sobre un escritorio"
  },
  {
    id: "p3",
    nombre: 'Monitor Nova 27" QHD 165 Hz',
    descripcion: "Panel IPS de 2560 x 1440, 1 ms de respuesta y soporte con altura regulable.",
    categoria: "Monitores",
    precio: 21900,
    stock: 3,
    imagen: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Monitor de escritorio encendido sobre una mesa de trabajo"
  },
  {
    id: "p4",
    nombre: 'Monitor Nova 24" Full HD 144 Hz',
    descripcion: "Panel VA de 1920 x 1080 pensado para quien arma su primer setup competitivo.",
    categoria: "Monitores",
    precio: 13500,
    stock: 7,
    imagen: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Monitor de computadora sobre un escritorio con luz tenue"
  },
  {
    id: "p5",
    nombre: "Auriculares Echo 7.1",
    descripcion: "Sonido envolvente por software, micrófono desmontable y almohadillas de memoria.",
    categoria: "Audio y streaming",
    precio: 5480,
    stock: 15,
    imagen: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Auriculares over ear apoyados sobre un soporte"
  },
  {
    id: "p6",
    nombre: "Micrófono Vox Studio USB",
    descripcion: "Cápsula cardioide, brazo articulado incluido y monitoreo sin retardo.",
    categoria: "Audio y streaming",
    precio: 4980,
    stock: 6,
    imagen: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Micrófono de condensador montado en un brazo articulado"
  },
  {
    id: "p7",
    nombre: "Placa de video Titan X8 8 GB",
    descripcion: "Ideal para jugar en 1440p con trazado de rayos y doble ventilador silencioso.",
    categoria: "Componentes",
    precio: 32900,
    stock: 4,
    imagen: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Placa de video con dos ventiladores sobre una superficie oscura"
  },
  {
    id: "p8",
    nombre: "Memoria RAM Pulse 16 GB DDR4",
    descripcion: "Kit de dos módulos de 8 GB a 3200 MHz con disipador de perfil bajo.",
    categoria: "Componentes",
    precio: 3890,
    stock: 20,
    imagen: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Módulos de memoria RAM instalados en una placa madre"
  },
  {
    id: "p9",
    nombre: "Silla gamer Nivel 99 Pro",
    descripcion: "Respaldo reclinable a 155°, apoyabrazos 4D y soporte lumbar regulable.",
    categoria: "Mobiliario",
    precio: 18900,
    stock: 5,
    imagen: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Silla gamer negra y azul frente a un escritorio"
  },
  {
    id: "p10",
    nombre: "Escritorio Rift 140 cm",
    descripcion: "Superficie de carbono, pasacables integrado y estructura de acero reforzado.",
    categoria: "Mobiliario",
    precio: 12400,
    stock: 2,
    imagen: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Escritorio amplio con monitor, teclado y luces led"
  },
  {
    id: "p11",
    nombre: "Alfombrilla XXL Grid",
    descripcion: "90 x 40 cm, base antideslizante y bordes cosidos que no se deshilachan.",
    categoria: "Accesorios",
    precio: 990,
    stock: 30,
    imagen: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Alfombrilla extra grande cubriendo un escritorio con teclado y mouse"
  },
  {
    id: "p12",
    nombre: "Soporte para auriculares Halo RGB",
    descripcion: "Base de aluminio con iluminación regulable y dos puertos USB.",
    categoria: "Accesorios",
    precio: 1450,
    stock: 0,
    imagen: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
    imagenAlt: "Soporte iluminado con unos auriculares colgados"
  }
];
