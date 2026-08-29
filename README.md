# Nivel 99 · Gaming Setup Store

Proyecto integrador de **Desarrollo Web** (CFE | ANEP) desarrollado sobre la base *Nexo Store*.
Entrega correspondiente al **Sprint 2 · Catálogo, detalle de producto y carrito**
(el Sprint 1, interfaz web e identidad visual, ya está integrado).

- **Estudiante:** Pablo Montaña Conti
- **Curso:** Desarrollo Web · 2.º semestre · Año lectivo 2026
- **Repositorio:** https://github.com/pablodmconti/Nexo-Store
- **Sitio publicado:** pendiente, se publicará mediante GitHub Pages en el Sprint 4

## Descripción del e-commerce

Nivel 99 es una tienda uruguaya especializada en equipamiento para escritorios gamer.
Vende periféricos, monitores, audio, componentes y mobiliario, y su diferencial es el
asesoramiento personal: cada compra la sigue una persona del equipo, con garantía escrita
de doce meses y entrega en 24 horas en Artigas.

El estilo de comunicación es cercano, directo y en segunda persona del singular rioplatense.

## Público objetivo

Personas de 16 a 35 años que juegan, estudian o crean contenido desde su casa en Uruguay,
con conocimientos medios de hardware, que buscan mejorar su setup por partes y valoran el
asesoramiento antes que el precio más bajo del mercado.

## Categorías iniciales de productos

- Periféricos (teclados, mouses, alfombrillas)
- Monitores
- Audio y streaming (auriculares, micrófonos)
- Componentes
- Mobiliario gamer (sillas, escritorios)
- Accesorios

## Tecnologías utilizadas

| Tecnología | Uso en el Sprint 1 |
| --- | --- |
| HTML5 | Estructura semántica de todas las páginas |
| CSS3 | Identidad visual, variables, modelo de caja, Flexbox y media queries |
| Bootstrap 5.3 (CDN) | Grilla de 12 columnas, navbar, cards, botones, modal y toast |
| JavaScript | Solo comportamiento básico de la interfaz (`js/base.js`) |
| Google Fonts | Tipografías Chakra Petch e Inter |
| Git y GitHub | Control de versiones y publicación de los avances |

## Estructura del proyecto

```
Nexo-Store/
├── index.html          Página de inicio personalizada
├── catalogo.html       Catálogo dinámico generado desde JavaScript
├── producto.html       En desarrollo · Sprint 2 (semana del 6/9)
├── carrito.html        En desarrollo · Sprint 2 (semana del 13/9)
├── perfil.html         Bloqueada · Sprint 3
├── admin.html          Bloqueada · Sprint 3
├── css/
│   └── styles.css      Hoja de estilos organizada en 16 secciones comentadas
├── js/
│   ├── base.js         Navegación activa y avisos de funcionalidades futuras
│   ├── productos.js    Arreglo de objetos con los productos de la tienda
│   ├── catalogo.js     Recorre el arreglo y genera las tarjetas del catálogo
│   ├── modules/        Reservada para los próximos sprints
│   └── pages/          Reservada para los próximos sprints
├── assets/
│   ├── img/            Imágenes propias y placeholder de producto
│   ├── icons/          Íconos SVG de la sección de beneficios y del carrito
│   └── logo/           Logotipo e isotipo de Nivel 99
├── README.md
└── .gitignore
```

## Instrucciones de ejecución

1. Clonar el repositorio: `git clone https://github.com/pablodmconti/Nexo-Store.git`
2. Abrir la carpeta en Visual Studio Code.
3. Iniciar la extensión **Live Server** sobre `index.html` (o abrir el archivo directamente en el navegador).
4. Se requiere conexión a internet, ya que Bootstrap, las tipografías y las fotografías de
   los productos se cargan desde servicios externos (CDN, Google Fonts y Unsplash).

## Funcionalidades desarrolladas en el Sprint 2

### Semana del 23/8 · Productos y catálogo dinámico

- **Los productos dejaron de estar escritos en el HTML.** Ahora viven en el arreglo
  `productos` de `js/productos.js`. Cada producto es un objeto con las propiedades
  `id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock`, `imagen` e `imagenAlt`.
- **Doce productos cargados**, dos por cada una de las seis categorías de la tienda.
- **Las tarjetas se generan desde JavaScript.** `js/catalogo.js` recorre el arreglo con
  `forEach`, arma cada tarjeta con `document.createElement` y la inserta dentro del
  contenedor `#grillaCatalogo` de `catalogo.html`, que en el HTML queda vacío.
- **Cada tarjeta muestra** imagen, categoría, nombre, descripción, estado de stock,
  precio formateado con `Intl.NumberFormat` y un botón hacia el detalle del producto.
- **El stock se traduce a un mensaje.** 0 unidades muestra "Sin stock", cinco o menos
  muestra "Últimas N unidades" y el resto "En stock · N unidades", cada uno con su color.
- **Contador de productos** sobre la grilla, actualizado desde el largo del arreglo.
- **Respaldo de imágenes.** Si una fotografía de Unsplash no carga, la tarjeta cambia
  automáticamente a `assets/img/producto-placeholder.svg` y nunca se ve rota.
- `catalogo.html` pasó de ser la plantilla bloqueada del proyecto base a una página con
  la identidad Nivel 99: mismo navbar, footer, toast, tipografías y paleta que el inicio.

### Cómo está organizado el código JavaScript

| Archivo | Responsabilidad |
| --- | --- |
| `js/base.js` | Comportamiento común a todas las páginas: navegación activa, toast y modal |
| `js/productos.js` | Únicamente los datos: el arreglo de productos de la tienda |
| `js/catalogo.js` | Lógica del catálogo: recorrer el arreglo y generar las tarjetas |

La idea es que los datos, la lógica de cada página y el comportamiento común queden
separados, para que el detalle de producto y el carrito de las próximas semanas puedan
reutilizar `js/productos.js` sin repetir la información.

### Información guardada en LocalStorage

Todavía ninguna. El carrito y su persistencia en LocalStorage corresponden a la semana
del 13/9, y se documentarán en esta misma sección cuando estén desarrollados.

### Pendiente dentro del Sprint 2

| Semana | Pendiente |
| --- | --- |
| 30/8 | Búsqueda por nombre, filtro por categoría, mensaje cuando no hay coincidencias |
| 6/9 | Detalle dinámico del producto con `URLSearchParams` sobre `producto.html?id=` |
| 13/9 | Carrito: agregar, modificar y eliminar productos, totales y LocalStorage |

## Funcionalidades desarrolladas en el Sprint 1

- Identidad visual propia: nombre, logotipo e isotipo en SVG, paleta azul y blanca con
  acento cian, tipografías, botones, tarjetas, bordes y sombras.
- Barra de navegación con logotipo, seis accesos, indicador de carrito, botón de ingreso,
  menú responsive y marcado visual de la página actual.
- Sección principal (hero) con `h1`, propuesta de valor, descripción, imagen, botón
  principal hacia el catálogo, botón secundario y datos destacados.
- Cuatro productos destacados escritos directamente en HTML (cantidad indicada en la
  actividad del proyecto base), con imagen, categoría, nombre, descripción, precio,
  disponibilidad y botón hacia la ficha del producto.
- Sección de beneficios con cuatro ítems, cada uno con ícono SVG propio, título y texto.
- Pie de página con logotipo, navegación, contacto, redes simuladas, año y aclaración de
  proyecto académico.
- Ventana modal "Cómo comprar" y avisos mediante el componente Toast de Bootstrap.
- HTML semántico (`header`, `nav`, `main`, `section`, `article`, `figure`, `footer`) y
  jerarquía de encabezados `h1` → `h2` → `h3`.
- Diseño responsive verificado en 375, 768 y 1366 píxeles.
- Accesibilidad básica: `alt` en todas las imágenes, enlace para saltar al contenido,
  foco visible, etiquetas accesibles en botones y menú, y disponibilidad indicada con
  texto además de color.
- Páginas de los próximos sprints enlazadas y con su cartel de funcionalidad en desarrollo.

## Pruebas realizadas antes de la entrega

- `index.html` carga sin errores en la consola del navegador.
- Los seis enlaces del navbar, el logotipo y los botones del hero dirigen a páginas existentes.
- No hay archivos ni imágenes faltantes: los recursos locales están en `assets/`.
- El menú hamburguesa se abre y se cierra correctamente en pantallas chicas.
- Todas las imágenes tienen atributo `alt` y las decorativas usan `alt=""` con `aria-hidden`.
- Las tarjetas se reorganizan en 1, 2 y 4 columnas según el ancho de pantalla.
- No existe desplazamiento horizontal en 375, 768 ni 1366 píxeles.
- Las páginas de los próximos sprints conservan su cartel de funcionalidad en desarrollo.
- La navegación puede recorrerse con el teclado y el foco siempre queda visible.
- El contraste de todas las combinaciones de color del sitio supera la relación 4.5:1 (WCAG AA).
- El historial del repositorio contiene commits con mensajes descriptivos, uno por cada
  bloque de trabajo del sprint.

## Funcionalidades pendientes

| Sprint | Pendiente |
| --- | --- |
| Sprint 2 | Búsqueda, filtros, ficha dinámica de producto, carrito y LocalStorage |
| Sprint 3 | Firebase Authentication, Cloud Firestore, perfil privado, pedidos y panel administrativo |
| Sprint 4 | Reglas de seguridad, pruebas finales, documentación y publicación en GitHub Pages |

## Decisiones de diseño adoptadas

- **Paleta azul y blanca.** El azul `#0b6fd4` sobre fondo blanco transmite confianza y
  legibilidad; el azul noche `#061b33` se reserva para navbar, beneficios y footer, y el
  cian `#22d3ee` funciona como único color de acento. Se comprobó que el texto sobre fondo
  oscuro y sobre fondo claro mantenga contraste suficiente.
- **Dos tipografías.** Chakra Petch en títulos y botones aporta el carácter gamer;
  Inter en los textos largos prioriza la lectura.
- **Variables CSS.** Toda la identidad está centralizada en `:root`, de modo que un cambio
  de color o de radio se propaga a las seis páginas.
- **Bootstrap + CSS propio.** Bootstrap resuelve grilla y componentes; el archivo
  `styles.css` solo redefine lo necesario para que el sitio no parezca una plantilla.
- **Coherencia entre páginas.** Navbar, footer, toast y tipografías son idénticos en las
  seis páginas para que el sistema se perciba como un único producto.
- **Íconos y logotipo en SVG.** Se almacenan en `assets/` porque escalan sin perder
  calidad y no dependen de librerías externas de íconos.
- **Alcance técnico acotado al curso.** El sitio se resolvió con los recursos trabajados en
  las semanas 1 a 4: HTML semántico, selectores, herencia, especificidad, modelo de caja,
  `box-sizing`, `position`, pseudo-clases, `::before` y los componentes de Bootstrap
  (contenedores, grilla de 12 columnas, utilidades, botones, cards, navbar y formularios).

## Limitaciones conocidas

- Las fotografías de los productos se cargan desde Unsplash, por lo que requieren conexión
  a internet. En `assets/img/producto-placeholder.svg` hay una imagen local de reemplazo.
- Los cuatro productos destacados del inicio siguen escritos en HTML; el catálogo, en
  cambio, ya se genera por completo desde JavaScript.
- Los enlaces de redes sociales son simulados (`href="#"`) y están aclarados en el footer.
- El botón de ingreso y el indicador del carrito solo muestran un aviso del sprint en el
  que serán desarrollados.
- Aún no hay usuarios de prueba, porque la autenticación corresponde al Sprint 3.

## Posibles mejoras futuras

- Sustituir las fotografías externas por imágenes propias optimizadas dentro de `assets/img`.
- Agregar un carrusel de marcas o de combos destacados en la página de inicio.
- Incorporar un modo oscuro reutilizando las variables ya definidas en `:root`.
