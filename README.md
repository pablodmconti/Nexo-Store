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

| Tecnología | Uso en el proyecto |
| --- | --- |
| HTML5 | Estructura semántica de todas las páginas |
| CSS3 | Identidad visual, variables, modelo de caja, Flexbox y media queries |
| Bootstrap 5.3 (CDN) | Grilla de 12 columnas, navbar, cards, botones, modal y toast |
| JavaScript | Catálogo, búsqueda y filtros, ficha del producto y carrito |
| Google Fonts | Tipografías Chakra Petch e Inter |
| LocalStorage | Persistencia del carrito entre visitas, sin servidor |
| Git y GitHub | Control de versiones y publicación de los avances |

## Estructura del proyecto

```
Nexo-Store/
├── index.html          Página de inicio personalizada
├── catalogo.html       Catálogo dinámico generado desde JavaScript
├── producto.html       Ficha dinámica, la misma página para todos los productos
├── carrito.html        Carrito de compras persistido en LocalStorage
├── perfil.html         Con la identidad del sitio y su aviso · Sprint 3
├── admin.html          Con la identidad del sitio y su aviso · Sprint 3
├── css/
│   └── styles.css      Hoja de estilos organizada en 17 secciones comentadas
├── js/
│   ├── base.js         Navegación, avisos y funciones compartidas (precio, stock, carrito)
│   ├── productos.js    Arreglo de objetos con los productos de la tienda
│   ├── inicio.js       Productos destacados de la portada
│   ├── catalogo.js     Tarjetas del catálogo, búsqueda y filtro por categoría
│   ├── producto.js     Detalle del producto recibido por la URL
│   ├── carrito.js      Página del carrito: cantidades, subtotales y total
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

- **Los productos dejaron de estar escritos en el HTML.** Ahora viven en el array de
  objetos `productos` de `js/productos.js`, la estructura que la Semana 5 presenta como
  "nuestra base de datos" mientras no se use Firestore. Cada producto es un objeto con
  las propiedades `id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock`,
  `imagen` e `imagenAlt`.
- **Doce productos cargados**, dos por cada una de las seis categorías de la tienda.
- **Las tarjetas se generan desde JavaScript.** La función `mostrarProductos(productos)`
  de `js/catalogo.js` vacía el contenedor `#catalogo`, recorre el array con `forEach()` y
  arma cada tarjeta con `innerHTML` y template literals, tal como se plantea en la
  Semana 6. En `catalogo.html` no hay ninguna tarjeta escrita a mano.
- **Cada tarjeta muestra** imagen, categoría, nombre, descripción, estado de stock,
  precio y un botón hacia el detalle del producto.
- **El stock se traduce a un mensaje** con `if / else if / else`: 0 unidades muestra
  "Sin stock", cinco o menos "Últimas N unidades" y el resto "En stock · N unidades",
  cada uno con su color.
- **Contador de productos** sobre la grilla, tomado de `productos.length`.
- `mostrarProductos()` recibe el array por parámetro en lugar de leer la variable global,
  para poder reutilizarla la próxima semana con los resultados de la búsqueda y los filtros.
- `catalogo.html` pasó de ser la plantilla bloqueada del proyecto base a una página con
  la identidad Nivel 99: mismo navbar, footer, toast, tipografías y paleta que el inicio.

### Semana del 30/8 · Búsqueda, filtros y eventos

- **Buscador por nombre.** El texto escrito en el campo se compara contra el nombre de
  cada producto con `filter()`, `toLowerCase()` e `includes()`, de modo que no distingue
  mayúsculas de minúsculas ni exige escribir el nombre completo.
- **Filtro por categoría.** El selector se completa solo: `cargarCategorias()` recorre el
  array y usa `includes()` para agregar cada categoría una sola vez, así la lista nunca
  queda desactualizada si se agrega un producto nuevo.
- **Búsqueda y filtro combinados.** Las dos condiciones se encadenan sobre los mismos
  datos: cada `filter()` recibe el resultado del anterior. Como `filter()` siempre
  devuelve un array nuevo, el array `productos` original nunca se modifica.
- **Mensaje cuando no hay coincidencias.** Si el resultado tiene largo 0, las tarjetas se
  reemplazan por un aviso que explica qué hacer.
- **Botón Limpiar.** Vacía el buscador, vuelve el selector a "Todas" y muestra de nuevo
  el catálogo completo.
- **Contador dinámico.** Pasa a indicar cuántos productos se están viendo sobre el total
  ("Mostrando 3 de 12 productos").
- **Eventos utilizados:** `input` en el buscador para filtrar mientras se escribe,
  `change` en el selector, `click` en el botón Limpiar y `submit` en el formulario con
  `preventDefault()` para que al apretar Enter la página no se recargue.

### Semana del 6/9 · Detalle dinámico del producto

- **Una sola página para los doce productos.** `producto.html` no cambia: lo que cambia es
  el identificador que recibe en la URL (`producto.html?id=p9`). No existe un archivo HTML
  por producto.
- **El HTML define la estructura, JavaScript la completa.** La ficha está escrita con
  elementos vacíos (`#productoNombre`, `#productoPrecio`, `#productoStock`, etc.) que
  `js/producto.js` rellena con `textContent`.
- **Lectura del parámetro.** `window.location.search` da la parte `?id=p9` de la dirección,
  `URLSearchParams` la convierte en algo legible y `get("id")` devuelve el valor.
- **Búsqueda del producto.** `find()` localiza en el array el objeto cuyo `id` coincide.
  Como los identificadores son texto (`"p9"`), la comparación se hace con `===` sin
  necesidad de convertir tipos.
- **Producto inexistente.** `find()` devuelve `undefined` si ningún producto coincide, así
  que un `if / else` decide entre mostrar la ficha o el aviso de error. El aviso cubre
  tanto un `id` inválido (`?id=p99`) como abrir la página sin ningún parámetro.
- **Estado de stock.** Se reutiliza el mismo criterio de las tarjetas y, si el producto está
  agotado, el botón de compra queda deshabilitado.
- **Los enlaces ya venían del catálogo.** Cada tarjeta genera su propio
  `producto.html?id=${producto.id}` desde la semana del 23/8.

### Semana del 13/9 · Carrito y LocalStorage

- **El carrito es un arreglo de objetos con lo mínimo indispensable:**
  `[{ idProducto: "p1", cantidad: 2 }]`. No guarda nombre, precio ni imagen: esos datos se
  buscan con `find()` en el array `productos` cada vez que hacen falta, así la información
  no queda duplicada ni se desactualiza si un producto cambia de precio.
- **Persistencia con LocalStorage.** `obtenerCarrito()` lee y `guardarCarrito()` escribe,
  las dos funciones en `js/base.js`. Como LocalStorage solo guarda texto, el arreglo pasa
  por `JSON.stringify()` al guardar y por `JSON.parse()` al leer. La primera visita todavía
  no tiene nada guardado, así que `JSON.parse(null)` devuelve `null` y el `|| []` deja un
  arreglo vacío listo para usar.
- **Se agrega desde el catálogo o desde el detalle.** Cada tarjeta tiene su botón
  "Agregar al carrito" y la ficha usa el suyo; ambos llaman a la misma función
  `agregarAlCarrito(id)`. Si el producto ya estaba en el carrito suma una unidad, y si no,
  entra como una entrada nueva.
- **Control de stock.** El stock vive en `productos`, no en el carrito, así que antes de
  sumar una unidad se comparan los dos arreglos. Al llegar al tope, el botón "+" de esa
  fila queda deshabilitado y aparece un aviso; los productos agotados no se pueden agregar.
- **Modificar y eliminar.** Cada fila tiene los botones "−", "+" y "Eliminar".
  Bajar de una unidad quita el producto, porque dejarlo en cero no aporta nada.
  `eliminarDelCarrito()` usa `filter()` para devolver el carrito sin ese producto.
- **Subtotales y total.** `calcularSubtotal(producto, cantidad)` resuelve una fila y
  `calcularTotal()` recorre el carrito con `reduce()` sumando todos los subtotales.
- **Un mismo ciclo para cada acción:** acción del usuario → modificar el arreglo →
  `guardarCarrito()` → `mostrarCarrito()`. De esa forma los datos, LocalStorage y la
  pantalla nunca quedan desincronizados.
- **Eventos en botones creados dinámicamente.** Los botones de cada fila no existen cuando
  carga la página: se crean dentro del `forEach()`. Por eso los eventos se conectan después
  de dibujar las filas y el identificador del producto viaja en el atributo `data-id`.
- **Carrito vacío.** Si no hay nada agregado, la lista y el resumen se esconden y se muestra
  un mensaje con un botón hacia el catálogo.
- **Contador en la barra de navegación.** El número del ícono del carrito se actualiza en
  todas las páginas y ahora ese ícono lleva a `carrito.html`.
- **La compra todavía no es real.** El botón "Confirmar compra" avisa que el pago y los
  pedidos corresponden al Sprint 3.
- **Funciones compartidas.** `formatearPrecio()` y el texto del stock estaban repetidos en
  `catalogo.js` y en `producto.js`. Al necesitarlos también el carrito, se movieron a
  `js/base.js` (`formatearPrecio()` y `describirStock()`), que se carga en todas las
  páginas: ahora el catálogo, la ficha y el carrito muestran siempre lo mismo.

### Ajustes de coherencia hechos junto con esta entrega

- **Los productos destacados de la portada se generan desde JavaScript.** Estaban escritos
  a mano desde el Sprint 1, con el precio y el stock duplicados respecto de
  `js/productos.js`. Ahora `js/inicio.js` los arma a partir del mismo arreglo, filtrando
  por una lista de identificadores, y sus botones abren la ficha correcta
  (`producto.html?id=`), cosa que antes no ocurría.
- **`perfil.html` y `admin.html` adoptaron la identidad de Nivel 99.** Conservaban el
  navbar, el pie y la marca de la plantilla original. Ahora comparten navbar, footer, toast
  y tipografías con el resto del sitio y mantienen su aviso de *Funcionalidad en desarrollo*
  del Sprint 3, como pide la consigna.
- **El ícono del carrito es un enlace.** Antes era un botón que navegaba desde JavaScript;
  ahora es un `<a href="carrito.html">`, que es lo que corresponde a un enlace y evita
  resolver con JavaScript algo que ya resuelve el HTML.

### Contenidos del curso aplicados

| Semana | Contenido | Dónde se usa |
| --- | --- | --- |
| 5 | Arrays de objetos | `js/productos.js` |
| 5 | `const` y `let` | Todo el JavaScript del catálogo |
| 5 | Funciones con parámetros y `return` | `formatearPrecio()`, `mostrarProductos()`, `mostrarContador()` |
| 5 | Funciones flecha | Callback de `forEach()` |
| 5 | Template literals | Armado del HTML de cada tarjeta |
| 5 | `if / else if / else` y `===` | Cálculo del estado de stock |
| 5 | `forEach()` | Recorrido del array de productos |
| 5 | `push()` e `includes()` | Armado de la lista de categorías sin repetir |
| 5 | `filter()` | Búsqueda por nombre y filtro por categoría |
| 6 | `querySelector()` | Contenedor de la grilla, contador y controles |
| 6 | `innerHTML` | Inserción de las tarjetas y del mensaje sin resultados |
| 6 | `textContent` | Texto del contador |
| 6 | `.value` | Lectura del buscador y del selector |
| 6 | `toLowerCase()` + `includes()` | Comparación del texto buscado |
| 6 | `addEventListener()` | Eventos `input`, `change`, `click` y `submit` |
| 6 | `preventDefault()` | Evitar que Enter recargue la página |
| 6 | `classList` | Mostrar u ocultar la ficha y el aviso de error |
| 5 y 7 | `find()` | Localizar el producto por su identificador |
| 7 | `window.location.search` | Obtener los parámetros de la URL actual |
| 7 | `URLSearchParams` y `get()` | Leer el valor del parámetro `id` |
| 7 | Estructura HTML vacía completada por JS | Ficha de `producto.html` y página del carrito |
| 8 | `localStorage.setItem()` y `getItem()` | Guardar y leer el carrito |
| 8 | `JSON.stringify()` y `JSON.parse()` | Convertir el arreglo del carrito en texto y al revés |
| 8 | Valor por defecto con `\|\| []` | Primera visita, cuando todavía no hay nada guardado |
| 8 | `reduce()` | `calcularTotal()` |
| 8 | Eventos en botones creados dinámicamente | Botones "+", "−" y "Eliminar" de cada fila |
| 8 | `data-id` y `dataset` | Saber sobre qué producto actuar al hacer clic |

Del código escrito en este sprint queda fuera del temario una sola línea:
`precio.toLocaleString("es-UY")` dentro de `formatearPrecio()`, que agrega el punto de
miles (`21900` se muestra como `$ 21.900`). Sin esa llamada el precio se vería como
`$ 21900`. En `js/base.js` sobreviven además dos recursos que venían de la entrega del
Sprint 1: `setAttribute("aria-current", "page")` para marcar la página actual y el
encadenamiento opcional `?.` al conectar botones que no existen en todas las páginas.

### Cómo está organizado el código JavaScript

| Archivo | Responsabilidad |
| --- | --- |
| `js/base.js` | Comportamiento común: navegación, avisos, formato de precio, estado de stock y el carrito guardado en LocalStorage |
| `js/productos.js` | Únicamente los datos: el array de productos de la tienda |
| `js/inicio.js` | Las cuatro tarjetas destacadas de la portada |
| `js/catalogo.js` | Lógica del catálogo: mostrar las tarjetas, buscar y filtrar |
| `js/producto.js` | Lógica de la ficha: leer el id de la URL y mostrar ese producto |
| `js/carrito.js` | Lógica del carrito: dibujar las filas, cambiar cantidades y calcular totales |

La idea es que los datos, la lógica de cada página y el comportamiento común queden
separados. `js/productos.js` se carga antes que `catalogo.js` y que `producto.js`, porque
las dos páginas leen el mismo array y así la información no se repite en ningún lado.

### Información guardada en LocalStorage

| Clave | Contenido | Ejemplo |
| --- | --- | --- |
| `carritoNivel99` | Arreglo de objetos con el identificador de cada producto y su cantidad, convertido a texto con `JSON.stringify()` | `[{"idProducto":"p1","cantidad":2},{"idProducto":"p4","cantidad":1}]` |

Es lo único que se guarda en el navegador. No se almacenan datos personales ni información
de pago: los pedidos reales y las cuentas de usuario corresponden al Sprint 3, con Firebase.

### Pendiente dentro del Sprint 2

Las cuatro entregas semanales están completas. Queda la semana de cierre: pulido general,
validaciones y repaso integrador del sprint.

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
- El catálogo se genera desde JavaScript y la búsqueda y el filtro funcionan combinados.
- El detalle abre el producto correcto según el `id` de la URL y avisa si el `id` no existe.
- Se agregan productos al carrito desde el catálogo y desde la ficha.
- Un producto ya agregado suma cantidad en lugar de repetirse.
- Los botones "+", "−" y "Eliminar" modifican el carrito y los subtotales y el total se
  recalculan en el momento.
- No se puede superar el stock: el botón "+" se deshabilita y aparece el aviso correspondiente.
- El carrito y el contador de la barra se conservan al recargar la página.
- Con el carrito vacío se muestra el mensaje y el botón hacia el catálogo.
- Los cuatro destacados de la portada abren la ficha del producto que corresponde.
- Las seis páginas comparten navbar, pie, toast y tipografías, y las del Sprint 3
  conservan su aviso de funcionalidad en desarrollo.
- No hay errores relevantes en la consola del navegador.

## Funcionalidades pendientes

| Sprint | Pendiente |
| --- | --- |
| Sprint 2 | Pulido general, validaciones y repaso integrador |
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
- Los enlaces de redes sociales son simulados (`href="#"`) y están aclarados en el footer.
- El botón de ingreso todavía muestra solo un aviso del sprint en el que será desarrollado.
- El carrito se guarda en el navegador: si se abre el sitio en otro equipo o en otro
  navegador, el carrito aparece vacío. Compartir el carrito entre dispositivos requiere
  la cuenta de usuario del Sprint 3.
- El stock se comprueba contra el array `productos`, que se reinicia con cada recarga: es
  un control de la interfaz, no un descuento real de inventario.
- Aún no hay usuarios de prueba, porque la autenticación corresponde al Sprint 3.

## Posibles mejoras futuras

- Sustituir las fotografías externas por imágenes propias optimizadas dentro de `assets/img`.
- Agregar un carrusel de marcas o de combos destacados en la página de inicio.
- Incorporar un modo oscuro reutilizando las variables ya definidas en `:root`.
