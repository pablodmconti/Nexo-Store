# Nivel 99 · Gaming Setup Store

Proyecto integrador de **Desarrollo Web** (CFE | ANEP) desarrollado sobre la base *Nexo Store*.
Entrega final, correspondiente al **Sprint 4 · Seguridad, calidad, pruebas y publicación**
(los sprints 1 a 3, de interfaz, catálogo y carrito, y Firebase, ya están integrados).

- **Estudiante:** Pablo Montaña Conti
- **Curso:** Desarrollo Web · 2.º semestre · Año lectivo 2026
- **Repositorio:** https://github.com/pablodmconti/Nexo-Store
- **Sitio publicado:** https://pablodmconti.github.io/Nexo-Store/
- **Estado:** versión final publicada en GitHub Pages y probada desde la dirección pública
  el 26/10/2026, con cuentas de cliente y de administrador.

## Entregas del proyecto

| Sprint | Contenido | Entrega |
| --- | --- | --- |
| Sprint 1 | Interfaz web, página de inicio e identidad visual | 16/8/2026 |
| Sprint 2 | Catálogo, detalle de producto y carrito con LocalStorage | 13/9/2026 |
| Sprint 3 | Firebase: autenticación, productos, pedidos, opiniones y panel administrativo | 11/10/2026 |
| Sprint 4 | Roles, reglas de seguridad, revisión, pago en línea simulado y publicación final | 30/10/2026 |

## Cómo evaluar el proyecto

1. Abrir el sitio publicado: https://pablodmconti.github.io/Nexo-Store/
2. Ingresar con una de estas cuentas, creadas exclusivamente para la evaluación. Los
   correos no existen: Firebase Authentication no los verifica, así que alcanza con que
   tengan formato válido.

   | Nombre | Rol | Correo | Contraseña |
   | --- | --- | --- | --- |
   | Administrador de Prueba | Administrador (`admin`) | `admin.prueba@nivel99.uy` | `Prueba2026` |
   | Cliente de Prueba | Cliente | `cliente.prueba@nivel99.uy` | `Prueba2026` |
   | John Doe | Cliente | `johndoe@nivel99.uy` | `Prueba2026` |

3. Para comprar, usar una cuenta de cliente (la de administración no puede comprar) y
   elegir la forma de pago en el carrito. **Coordinar con el equipo**, la opción marcada
   por defecto, registra el pedido en el momento. **Pago en línea** lleva a
   una pasarela simulada donde se elige si el pago se aprueba o se rechaza.

### Pago en línea (simulado)

- No se piden datos de tarjeta ni se cobra dinero. La pasarela simula el paso por un medio
  de pago con dos botones: **Aprobar el pago** y **Rechazar el pago**.
- El resultado vuelve a la tienda por la URL, se guarda en el pedido y se ve en **Mi
  perfil** y en el panel administrativo. Un pago rechazado se puede reintentar desde el
  perfil.

## Descripción del e-commerce

Nivel 99 es una tienda uruguaya especializada en equipamiento para escritorios gamer.
Vende periféricos, monitores, audio, componentes y mobiliario, y su diferencial es el
asesoramiento personal: cada compra la sigue una persona del equipo, con garantía escrita
de doce meses y entrega en 24 horas en Artigas.

El estilo de comunicación es cercano, directo y en segunda persona del singular rioplatense.

## Funcionalidades principales

- **Catálogo desde Cloud Firestore:** búsqueda por nombre o descripción, filtro por
  categoría, orden por nombre o precio y productos destacados en la portada.
- **Ficha del producto:** precio, stock, disponibilidad, características y opiniones con
  su promedio.
- **Carrito persistente** en LocalStorage: agregar, cambiar cantidades y eliminar, con
  subtotales, envío y total, y control del stock disponible.
- **Cuentas con Firebase Authentication:** registro, inicio y cierre de sesión, y la sesión
  se mantiene al recargar.
- **Compras:** confirmación con stock y precios actuales, pedidos guardados en Firestore e
  historial en el perfil. El pago se coordina con el equipo o se hace en línea con una
  pasarela simulada.
- **Opiniones** de 1 a 5 estrellas, solo con la sesión iniciada.
- **Roles cliente y administrador.** El panel administrativo permite crear, editar,
  desactivar y eliminar productos, cambiar el stock, la disponibilidad y los destacados,
  y consultar los pedidos y cambiar su estado.
- **Seguridad:** páginas privadas protegidas y reglas de Firestore por colección.
- **Diseño responsive y accesible**, publicado en GitHub Pages.

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
| Firebase Authentication | Registro, inicio y cierre de sesión con correo y contraseña (Sprint 3) |
| Cloud Firestore | Usuarios y roles, productos, pedidos y valoraciones (Sprint 3) |
| Reglas de seguridad de Firestore | Quién puede leer y escribir cada colección, en `firestore.rules` (Sprint 4) |
| Git, GitHub y GitHub Pages | Control de versiones y publicación del sitio |

## Estructura del proyecto

```
Nexo-Store/
├── index.html          Página de inicio personalizada
├── catalogo.html       Catálogo dinámico generado desde JavaScript
├── producto.html       Ficha dinámica con características y opiniones de los usuarios
├── carrito.html        Carrito en LocalStorage, forma de pago y confirmación de compra
├── pago.html           Pasarela de pago simulada para el pago en línea · Sprint 4
├── login.html          Ingresar y crear cuenta con Firebase Authentication · Sprint 3
├── perfil.html         Página privada: datos del usuario e historial de sus pedidos · Sprint 3
├── admin.html          Panel administrativo, solo para el rol admin · Sprint 3
├── firestore.rules     Reglas de seguridad publicadas en la consola de Firebase · Sprint 4
├── css/
│   └── styles.css      Hoja de estilos organizada en 22 secciones comentadas
├── js/
│   ├── base.js         Navegación, avisos y funciones compartidas (precio, stock, carrito)
│   ├── productos.js    Respaldo de los datos iniciales (ninguna página lo carga)
│   ├── inicio.js       Productos destacados de la portada (campo destacado en Firestore)
│   ├── catalogo.js     Catálogo desde Firestore: tarjetas, búsqueda, filtro y orden
│   ├── producto.js     Ficha del producto (getDoc() con el id de la URL) y sus opiniones
│   ├── carrito.js      Carrito con datos de Firestore y confirmación de la compra
│   ├── firebase/
│   │   └── config.js   Única inicialización de Firebase (exporta auth y db)
│   ├── modules/
│   │   ├── auth.js     Registro, inicio y cierre de sesión, mensajes de error
│   │   ├── usuarios.js Documento usuarios/{uid} en Firestore
│   │   ├── productos-firestore.js  Carga con writeBatch() y CRUD de la colección productos
│   │   ├── pedidos.js  Confirmar compra, pedidos, estados y registro del pago
│   │   ├── valoraciones.js  Validar, guardar y leer las opiniones de un producto
│   │   ├── agregar-carrito.js  Vuelve a consultar stock y disponibilidad antes de agregar
│   │   └── navbar.js   Navbar según la sesión y el rol (se carga en todas las páginas)
│   └── pages/
│       ├── admin.js    Protección por rol y panel: productos y pedidos
│       ├── login.js    Formularios de login.html: validación y estados de carga
│       ├── pago.js     Pasarela simulada: aprobar o rechazar y guardar el resultado
│       └── perfil.js   Protección de perfil.html, datos del usuario e historial de pedidos
├── assets/
│   ├── img/            Placeholder y carpeta productos/ con las fotos de cada producto
│   ├── icons/          Íconos SVG de la sección de beneficios y del carrito
│   └── logo/           Logotipo e isotipo de Nivel 99
├── README.md
└── .gitignore
```

## Instrucciones de ejecución

El sitio está publicado en https://pablodmconti.github.io/Nexo-Store/. Para ejecutarlo en
una computadora:

1. Clonar el repositorio: `git clone https://github.com/pablodmconti/Nexo-Store.git`
2. Abrir la carpeta en Visual Studio Code.
3. Iniciar la extensión **Live Server** sobre `index.html`. Desde el Sprint 3 es obligatorio:
   los archivos de Firebase son módulos (`type="module"`) y el navegador no los ejecuta
   si la página se abre directamente como archivo (`file://`).
4. Se requiere conexión a internet, ya que Bootstrap, las tipografías y Firebase se cargan
   desde servicios externos. Las fotografías de los productos están en `assets/img/productos`.
5. Para probar compras y opiniones hay que iniciar sesión (ver *Cómo evaluar el proyecto*).
6. La pasarela de pago simulada funciona igual en local que en el sitio publicado.

## Manual breve de usuario

### Para clientes

1. **Explorar la tienda.** En **Catálogo** se puede buscar por nombre o descripción,
   filtrar por categoría y ordenar por nombre o precio. **Ver producto** abre la ficha con
   precio, stock, características y opiniones.
2. **Armar el carrito.** **Agregar al carrito** está en las tarjetas y en la ficha. El
   número junto al ícono del carrito muestra cuántas unidades hay. En **Carrito** se
   cambian las cantidades con **+** y **−**, se quita un producto con **Eliminar** o se
   vacía todo. El envío es gratis desde $ 2.000. El carrito queda guardado en el navegador.
3. **Crear una cuenta o ingresar.** Con el botón **Ingresar** de la barra superior. En la
   pestaña **Crear cuenta** se completan nombre y apellido, correo y contraseña (6
   caracteres como mínimo, repetida para confirmarla).
4. **Confirmar la compra.** En el carrito, elegir la forma de pago y tocar **Confirmar
   compra**. Con **Coordinar con el equipo**, el pedido queda registrado y la tienda escribe
   para coordinar el pago y la entrega. Con **Pago en línea** se pasa a la pasarela
   simulada: **Aprobar el pago** o **Rechazar el pago**. Si un producto se agotó mientras
   tanto, la tienda avisa y el carrito no se pierde.
5. **Seguir los pedidos.** **Mi perfil** muestra los datos de la cuenta y el historial de
   pedidos, con su estado y su forma de pago. Un pedido con pago en línea pendiente o
   rechazado ofrece **Pagar ahora**.
6. **Opinar.** En la ficha de un producto, con la sesión iniciada: de 1 a 5 estrellas y un
   comentario de 10 a 500 caracteres. Si se vuelve a opinar, se actualiza la opinión anterior.
7. **Salir.** En el menú con el nombre del usuario, **Cerrar sesión**.

### Para el administrador

1. Al ingresar con una cuenta de rol `admin`, aparece **Administración** en el menú. Las
   cuentas de administración no pueden comprar: para probar una compra se usa una cuenta
   de cliente.
2. **Pestaña Productos:**
   - **+ Nuevo producto** abre el formulario. La imagen se indica con su ruta, por ejemplo
     `assets/img/productos/teclado.jpg`, o con una URL.
   - **Editar** carga los datos actuales del producto.
   - **Desactivar** lo saca de la tienda sin borrarlo.
   - **Eliminar** lo borra definitivamente, después de una confirmación.
3. **Pestaña Pedidos:** se elige el nuevo estado en la lista y se toca **Actualizar**. Al
   cancelar un pedido, el stock vuelve a los productos y el estado ya no se puede cambiar.

## Funcionalidades desarrolladas en el Sprint 4

El último sprint no suma módulos grandes: cierra el proyecto con roles, panel
administrativo, reglas de seguridad, una revisión completa y la publicación. Como extra,
incorpora el pago en línea con una pasarela simulada.

### Semana del 18/10 · Roles y acceso administrativo

Cada documento `usuarios/{uid}` tiene el campo `rol`, con dos valores: `cliente` y
`admin`. La consigna lo nombra *administrador*; en el código y en Firestore se mantiene
el valor `"admin"`, el que ya usaba el Sprint 3.

**Cómo se diferencian los roles**

| Acción | Cliente | Administrador |
| --- | --- | --- |
| Ver el catálogo, la ficha y las opiniones | Sí | Sí |
| Comprar, pagar y ver sus pedidos en el perfil | Sí | No: el carrito lo explica y las reglas lo impiden |
| Opinar sobre un producto | Sí | Sí |
| Ver el enlace "Administración" en el menú | No | Sí |
| Abrir `admin.html` | No: vuelve al inicio con un aviso | Sí |
| Crear, editar, activar o desactivar y eliminar productos | No | Sí |
| Ver todos los pedidos y cambiar su estado | No | Sí |

- **Registro siempre como cliente.** `crearPerfilUsuario()` guarda `rol: "cliente"` y el
  formulario no permite elegir otro. Las reglas de Firestore rechazan crear una cuenta con
  otro rol o cambiarse el rol después.
- **Administrador asignado a mano**, desde la consola de Firebase, en la cuenta de prueba
  `admin.prueba@nivel99.uy`.
- **El rol se consulta después de iniciar sesión.** `navbar.js` lo lee para mostrar el
  enlace, y `admin.js` lo vuelve a leer al abrir el panel.
- **El administrador no compra.** Una cuenta de administración gestiona la tienda pero no
  hace pedidos: en el carrito, "Confirmar compra" queda deshabilitado con una explicación, y
  las reglas de Firestore rechazan un pedido creado por un administrador.
- **Usuario sin permisos.** Si un cliente escribe `admin.html` en la barra de direcciones,
  `admin.js` lo redirige a `index.html?aviso=sin-permisos` y `base.js` muestra el aviso
  *"La sección Administración es solo para el equipo de Nivel 99"* (parámetros de URL,
  Semana 7). Solo se muestran avisos de una lista fija: un texto escrito a mano en la URL
  nunca llega a la pantalla.

### Semana del 25/10 · Panel administrativo básico

El panel ya estaba completo desde el Sprint 3 (ver *Panel administrativo* más abajo).
**Operaciones que puede realizar el administrador:**

- Consultar todos los productos con nombre, categoría, precio, stock y disponibilidad.
- Crear un producto y editar uno existente. El formulario valida nombre, categoría,
  descripción, precio, stock e imagen, deshabilita el botón mientras guarda y muestra un
  mensaje de éxito o de error. Los cambios se ven enseguida en el catálogo.
- Activar o desactivar y eliminar productos (opcional de la consigna).
- Consultar todos los pedidos, con su forma y estado de pago, y cambiar el estado de cada
  uno. Al cancelar un pedido, el stock vuelve a los productos (opcionales de la consigna).

### Semana del 30/10 · Revisión, seguridad básica y publicación

#### Reglas de seguridad de Firestore

`firestore.rules` reemplaza el modo de prueba. Se copia en la consola de Firebase
(*Firestore Database → Reglas → Publicar*) y el archivo queda en el repositorio como
registro. Ocultar un botón no protege nada; estas reglas las aplica Firebase en el
servidor, aunque alguien escriba en la base por fuera del sitio.

| Colección | Quién lee | Quién escribe |
| --- | --- | --- |
| `usuarios` | Cada persona su documento; el administrador, todos | Se crea solo como `cliente`; nadie puede cambiarse el rol |
| `productos` | Cualquiera, sin iniciar sesión | Solo el administrador. Única excepción: al comprar, un cliente con sesión puede **bajar** el `stock` de un producto disponible, sin tocar otro campo y sin dejarlo en negativo |
| `pedidos` | Cada cliente los suyos; el administrador, todos | Los crea solo un cliente (una cuenta de administración no compra), con su `uid`, estado `pendiente` y pago pendiente. El estado lo cambia solo el administrador; el cliente solo registra el resultado del pago de su propio pedido |
| `valoraciones` | Cualquiera | Cada usuario solo su opinión, de 1 a 5 estrellas y de 10 a 500 caracteres. El administrador puede borrarlas |

Todo lo que no está permitido en el archivo queda prohibido.

#### Otros cuidados de seguridad

- **Texto de los usuarios dentro del HTML.** Los datos de un pedido (nombre, correo,
  productos e importes) los guarda el navegador del cliente, y el panel administrativo los
  muestra con `innerHTML`. Un nombre como `<img onerror="...">` se ejecutaría en la sesión
  del administrador. `escaparHtml()`, en `base.js`, convierte esos caracteres en texto
  común antes de insertarlos en el panel, el perfil y la página de pago. Las opiniones ya
  usaban `textContent`, que es seguro.
- **La `apiKey` de `js/firebase/config.js` no es un secreto.** GitHub la marca como "clave
  de Google expuesta" porque reconoce el formato, pero en Firebase esa clave solo
  identifica el proyecto y es pública por diseño. Cualquier sitio con Firebase la muestra
  en su JavaScript. Lo que protege los datos son las reglas de Firestore. La clave está
  restringida a las APIs de Firebase y no se revoca, porque el sitio dejaría de funcionar.

#### Revisión antes de publicar

- Se retiró `cargar-productos.html`, la página de carga inicial, junto con su JavaScript
  y sus estilos. `js/productos.js` queda como respaldo de los datos iniciales.
- La imagen de la ficha empezaba con `src=""` y el navegador intentaba cargar la propia
  página como imagen, lo que generaba un error en la consola. Ahora empieza con el placeholder.
- En teléfonos, el inicio y la ficha se desbordaban 12 px hacia la derecha por los gutters
  `g-5` de Bootstrap. Se cambiaron por `g-4 g-lg-5`: el espacio grande queda solo en
  pantallas grandes.
- Se revisaron todas las rutas de los HTML y los JS distinguiendo mayúsculas, porque
  GitHub Pages trata `Foto.jpg` y `foto.jpg` como archivos distintos.

#### Publicación

El sitio se publica con **GitHub Pages** desde la rama `main`
(*Settings → Pages → Deploy from a branch*): https://pablodmconti.github.io/Nexo-Store/.
El dominio `pablodmconti.github.io` está agregado en *Authentication → Settings →
Dominios autorizados* de Firebase para que funcione el inicio de sesión.

### Pago en línea simulado (extra)

La consigna no pide pagos reales, así que esto es una funcionalidad adicional. En el
carrito se elige la forma de pago: **Coordinar con el equipo** (transferencia o efectivo
al recibir, como en el Sprint 3, marcada por defecto) o **Pago en línea**, que usa una
pasarela simulada. Cada pedido guarda su forma de pago en `pago.metodo`: `simulado` o
`coordinar`.

1. Al confirmar la compra, el pedido se registra igual que en el Sprint 3, con
   `pago: { metodo: "simulado", estado: "pendiente" }`, y el carrito lleva a
   `pago.html?pedido=ID`.
2. `pago.html` muestra el resumen del pedido y dos botones: **Aprobar el pago** y
   **Rechazar el pago**. No pide datos de tarjeta.
3. Cada botón vuelve a la misma página con el resultado en la URL, como vuelve una
   pasarela real a la tienda: `pago.html?pedido=ID&estado=aprobado&operacion=SIM-…`
   (parámetros de URL, Semana 7).
4. `js/pages/pago.js` guarda el resultado en el campo `pago` del pedido con `updateDoc()`
   y quita esos datos de la dirección, para que una recarga no los procese de nuevo.
5. El perfil muestra la forma y el estado del pago y ofrece **Pagar ahora** si quedó
   pendiente o rechazado. El panel administrativo muestra el pago y su número de operación.

Las reglas de Firestore dejan que el dueño de un pedido pendiente cambie **solo** el campo
`pago`, a "aprobado" o "rechazado" y con un número de operación `SIM-…`. Un pago aprobado
ya no se puede cambiar.

**Sobre una integración real.** Se probó conectar Mercado Pago (Checkout Pro) a través de un
servidor en Cloudflare Workers, porque la clave secreta de un medio de pago no puede ir en
el navegador. Para probarlo sin dinero real hacen falta credenciales de una cuenta
vendedora de prueba, y Mercado Pago no permitió ingresar con esas cuentas. Por eso la
entrega usa la pasarela simulada, que se resuelve con contenidos del curso. Ese trabajo
queda en el historial de git, en los commits del 26/10.

### Completitud del Sprint 4

| Lo que pide la consigna | Dónde |
| --- | --- |
| Diferenciar clientes y administradores | Campo `rol` en `usuarios/{uid}` (`usuarios.js`) |
| Mostrar el acceso administrativo solo cuando corresponde | `navbar.js` |
| Proteger la página de administración y redirigir sin permisos | `admin.js`, `base.js` y reglas de Firestore |
| Consultar, crear y editar productos | `admin.html`, `admin.js` y `productos-firestore.js` |
| Proteger las operaciones principales de Firestore | `firestore.rules` |
| Conservar las funcionalidades de los sprints anteriores | Catálogo, ficha, carrito, pedidos, perfil y opiniones |
| Publicar la aplicación con un enlace | GitHub Pages: https://pablodmconti.github.io/Nexo-Store/ |
| README actualizado con cuentas para la evaluación | *Cómo evaluar el proyecto* y esta sección |
| Manual breve de usuario (resultado final del proyecto) | *Manual breve de usuario* |

## Pruebas de la versión final

Comprobaciones hechas sobre el sitio publicado el 26/10/2026, después de cerrar el Sprint 4.

**Navegación, diseño y errores**
- Las 9 páginas (incluida la ficha con y sin producto) cargan sin errores en la consola ni
  imágenes rotas, en teléfono (375 px), tablet (768 px) y escritorio (1366 px), sin
  desplazamiento horizontal.
- Todos los enlaces, imágenes, hojas de estilo y scripts locales apuntan a archivos que
  existen, con rutas relativas y respetando mayúsculas y minúsculas.
- Todos los campos de formulario tienen su etiqueta y todas las imágenes, texto alternativo.
- El enlace "Administración" solo se ve con la cuenta de administración, tanto en el menú
  como en el pie de página.

**Catálogo, ficha y carrito**
- El catálogo muestra los 12 productos de Firestore. Buscar, filtrar por categoría y ordenar
  funcionan combinados, y sin coincidencias aparece el aviso.
- La ficha abre el producto del `id` de la URL, avisa si el producto no existe e invita a
  elegir uno si se abre sin `id`.
- El carrito agrega, cambia cantidades y elimina, recalcula subtotales, envío y total,
  respeta el stock y se conserva al recargar.

**Cuentas y compras**
- Registro, inicio y cierre de sesión. La sesión se mantiene al recargar, y `perfil.html`,
  `admin.html` y `pago.html` llevan al login si no hay sesión.
- Sin sesión, el carrito pide ingresar para comprar. La cuenta de administración no puede
  confirmar compras.
- Compra con "Coordinar con el equipo": el pedido aparece en el perfil y el stock baja.
- Pago en línea simulado: aprobar deja el pedido con "pago aprobado" en el perfil y en el
  panel. Rechazar lo deja "pago rechazado" y **Pagar ahora** permite reintentar. Recargar la
  página del resultado no vuelve a registrar el pago.

**Administración**
- Un cliente que escribe `admin.html` vuelve al inicio con el aviso; el administrador entra
  al panel.
- Crear y editar un producto se refleja en el catálogo. Cambiar el estado de un pedido se ve
  en el perfil del cliente, y al cancelarlo el stock vuelve.

**Reglas de seguridad**
- Sin sesión, Firestore rechaza leer pedidos o usuarios, crear pedidos y escribir productos
  (respuesta 403), y permite leer el catálogo.

## Registro de los sprints anteriores

Las secciones siguientes documentan cómo quedó el proyecto al cerrar cada sprint y se
conservan como registro del proceso. Algunas cosas cambiaron después: por ejemplo, las
páginas ya no tienen avisos de "Funcionalidad en desarrollo", `cargar-productos.html` se
retiró antes de publicar y un cliente que abre `admin.html` ahora vuelve al inicio. La
versión final está descrita en las secciones anteriores.

### Funcionalidades desarrolladas en el Sprint 3

#### Semana del 20/9 · Firebase y autenticación de usuarios

- **Proyecto en Firebase.** Se creó el proyecto `login-nexostore`, se registró la
  aplicación web y se habilitó el proveedor *Correo electrónico/Contraseña* en
  Authentication. También se creó la base de datos de Cloud Firestore.
- **Una sola configuración.** `js/firebase/config.js` es el único archivo que llama a
  `initializeApp()`. Exporta `auth` (Authentication) y `db` (Firestore) y el resto del
  proyecto los importa: ninguna página vuelve a inicializar Firebase.
- **Nueva página `login.html`.** Tiene dos pestañas de Bootstrap, *Ingresar* y *Crear
  cuenta*, con la misma identidad que el resto del sitio.
- **Registro con validaciones.** Antes de llamar a Firebase se comprueba que el nombre
  tenga al menos 2 letras, que el correo tenga la forma `nombre@correo.com`, que la
  contraseña tenga al menos 6 caracteres y que las dos contraseñas coincidan. Cada error
  aparece debajo de su campo con las clases `is-invalid` e `invalid-feedback` de Bootstrap.
- **Documento del usuario en Firestore.** Al registrarse se crea `usuarios/{uid}` con
  `nombre`, `correo`, `rol: "cliente"` y `fechaRegistro`. El nombre también se guarda en
  la cuenta con `updateProfile()` para mostrarlo en el navbar.
- **Mensajes comprensibles.** Los códigos de Firebase (`auth/invalid-credential`,
  `auth/email-already-in-use`, `auth/network-request-failed`, etc.) se traducen a frases
  en español con un objeto que funciona como diccionario.
- **Estados de carga.** Mientras Firebase responde, el botón se deshabilita y cambia su
  texto ("Ingresando…", "Creando la cuenta…"), así no se envía dos veces el formulario.
- **Sesión persistente.** No se guarda nada "a mano": Firebase recuerda la sesión y
  `onAuthStateChanged()` la vuelve a informar al recargar o al cambiar de página.
- **Navbar según la sesión.** Sin sesión se ve el botón *Ingresar*; con sesión aparecen
  el enlace *Mi perfil* y un menú con el nombre del usuario y *Cerrar sesión*.
- **`perfil.html` protegida.** La página arranca mostrando solo "Comprobando tu sesión…".
  Si no hay usuario redirige a `login.html` sin mostrar datos privados; si lo hay, muestra
  nombre, correo, rol, fecha de registro e identificador de la cuenta. Si Firestore no
  responde, muestra los datos básicos de Authentication y un aviso.
- **Cierre de sesión** con `signOut()` desde el menú o desde el perfil; luego se vuelve al inicio.

#### Semana del 4/10 · Productos almacenados en Cloud Firestore

##### Colección `productos` y carga inicial

- **Colección `productos`.** Cada producto es un documento cuyo id es el mismo que ya
  usaba el sitio (`p1` a `p12`), por eso el id no se repite como campo adentro.
- **Campos de cada producto:** `nombre`, `descripcion`, `categoria`, `precio`, `stock`,
  `disponible`, `imagenes`, `imagenAlt` y `caracteristicas`, con la estructura de la
  Semana 5 (arreglos `imagenes` y `caracteristicas`) y de la Semana 10 (`disponible`).
- **`disponible` y `stock` son cosas distintas.** `stock` dice cuántas unidades hay;
  `disponible` indica si el producto se puede vender. Un producto con `disponible: false`
  no aparece en el catálogo ni en el inicio y no se puede agregar al carrito.
- **`imagenes` reemplaza a `imagen`.** Es un arreglo de rutas y la primera es la imagen
  principal: las tarjetas, la ficha y el carrito usan `producto.imagenes[0]`.
- **Carga inicial.** `cargar-productos.html` (no está enlazada en el menú) sube el arreglo
  de `js/productos.js` a Firestore. En la semana 11 se ajustó a la forma del curso (ver
  más abajo).

##### Los productos se obtienen desde Firestore

- **`js/productos.js` ya no es la fuente del catálogo.** Solo lo carga
  `cargar-productos.html`; el inicio, el catálogo, la ficha y el carrito leen Firestore.
- **Consultas en un solo archivo.** `js/modules/productos-firestore.js` tiene
  `obtenerProductos()` (con `collection()` y `getDocs()`) y `obtenerProducto(id)` (con
  `doc()` y `getDoc()`). Transforman el snapshot en el mismo array de objetos del
  Sprint 2 con `{ id: documento.id, ...documento.data() }`.
- **Las páginas pasaron a ser módulos** (`type="module"`) para poder importar esas
  funciones. Las funciones comunes de `base.js` siguen disponibles igual que antes.
- **Estados de carga.** Mientras Firestore responde, cada página muestra una rueda de
  carga de Bootstrap con un texto ("Cargando productos…"), armada por `htmlCargando()`
  de `base.js`. En el catálogo, los filtros quedan deshabilitados hasta que llegan los datos.
- **Mensajes cuando no hay productos o falla la consulta.** Las funciones de consulta no
  atrapan el error: lo dejan subir a la página, que lo atrapa con `try / catch`. Así se
  distingue "no hay productos" (array vacío) de "falló la consulta" (error) y se muestra
  el mensaje que corresponde con `htmlMensaje()`.

##### Buscar, filtrar y ordenar

- La búsqueda, el filtro por categoría y el orden del Sprint 2 funcionan sin cambios
  sobre el array que llega de Firestore: `filter()`, `includes()` y `sort()` no saben de
  dónde vinieron los datos.
- La búsqueda ahora compara el texto con el **nombre o la descripción** del producto,
  como pide el resultado final del proyecto (por ejemplo, "dpi" encuentra el mouse).
- Las categorías del selector se arman con los productos recibidos, así una categoría
  nueva cargada en Firestore aparece sola.
- **Orden de la tienda.** Firestore entrega los documentos ordenados por id como texto
  (`p1`, `p10`, `p11`, `p2`…). Para respetar el orden original se ordena por el número
  que sigue a la "p".

##### Ficha del producto

- `producto.html` lee el `id` de la URL con `URLSearchParams` y pide ese único documento
  con `getDoc()`. Si no hay `id` o el documento no existe, muestra el aviso de producto
  inexistente; si falla la consulta, un mensaje de conexión.
- Se agregó la lista de **características**, armada con `forEach()` sobre el arreglo
  `caracteristicas`, y el nombre del producto en el título de la pestaña.
- Un producto con `disponible: false` muestra "No disponible por el momento" y el botón
  queda deshabilitado.

##### Validar disponibilidad y stock antes de agregar al carrito

- El stock puede cambiar desde que se cargó la página. Por eso, al tocar "Agregar al
  carrito" en el catálogo o en la ficha, `js/modules/agregar-carrito.js` vuelve a pedir
  el producto a Firestore con `obtenerProducto()` y recién entonces llama a
  `agregarAlCarrito(producto)`.
- `agregarAlCarrito()` (en `base.js`) ahora recibe el producto completo y revisa, en este
  orden, que esté disponible y que la cantidad en el carrito no supere el stock actual.
- Mientras se consulta, el botón muestra "Comprobando stock…" y queda deshabilitado.
- En el carrito, el botón "+" también se deshabilita si el producto dejó de estar
  disponible o si se llegó al stock. Si un producto guardado ya no existe en Firestore,
  se quita del carrito con un aviso.

##### Pruebas de la semana del 4/10

- Con la colección vacía, el catálogo y el inicio muestran el mensaje de "no hay productos".
- Sin conexión con Firestore, el catálogo, el inicio, la ficha y el carrito muestran un
  mensaje de error comprensible, sin errores de JavaScript sin atrapar.
- El catálogo muestra solo los productos disponibles y el contador los cuenta bien.
- Buscar "dpi" encuentra el mouse por su descripción; el filtro por categoría y el orden
  por nombre y por precio funcionan combinados.
- La ficha abre el producto correcto, muestra sus características y avisa si el `id` no
  existe o falta.
- Si el stock baja en Firestore después de cargar la página, al agregar se usa el stock
  nuevo y no se puede superar.
- Un producto con `disponible: false` no aparece en el catálogo y en la ficha no se puede
  agregar.
- Los totales del carrito se calculan con los precios de Firestore.

#### Semana 11 · Migración de productos e imágenes (ajustes)

Con los recursos de la Semana 11 se ajustó la carga inicial a la forma del curso:

- **El array como semilla.** `js/productos.js` pasó a ser un módulo que exporta el array
  (`export const productos`) y `js/pages/cargar-productos.js` lo importa.
- **Un solo lote con `writeBatch()`.** `cargarProductos()` (en `productos-firestore.js`)
  prepara un `lote.set()` por producto y los confirma juntos con `commit()`: se guardan
  todos o ninguno. `const { id, ...datosProducto } = producto` separa el id, que se usa
  como nombre del documento, del resto de los campos.
- **Ids explícitos y no `addDoc()`.** Si la carga se ejecuta dos veces, actualiza los mismos
  documentos `p1` a `p12` en lugar de duplicarlos.
- **Página de un solo uso.** `cargar-productos.html` muestra un único mensaje con el
  resultado (y el motivo si falla) y se usa `try / catch / finally` para volver a
  habilitar el botón. Se eliminará antes de publicar el sitio (Sprint 4).
- **Imágenes dentro del proyecto.** Las fotos pasaron a `assets/img/productos/`, con
  nombres simples sin espacios ni tildes (`teclado-tkl-aurora.jpg`). Firestore guarda solo
  la ruta relativa como texto, nunca el archivo ni una versión en base64.

#### Semana del 11/10 · Compras, pedidos y valoraciones

##### Confirmar una compra

- **Solo con sesión.** Sin usuario autenticado, el botón dice "Ingresá para comprar" y, al
  tocarlo, aparece un aviso con un enlace a `login.html?volver=carrito.html`. Después de
  ingresar o registrarse, `login.js` vuelve al carrito (solo acepta páginas del propio
  sitio en `volver`, para no redirigir a otra dirección).
- **Se vuelve a comprobar todo al confirmar.** `confirmarPedido()` (en
  `js/modules/pedidos.js`) lee de nuevo cada producto con `getDoc()` y revisa que exista,
  que esté disponible y que la cantidad no supere el stock actual. Si algo no alcanza,
  no se guarda nada: se muestra la lista de problemas y el carrito se actualiza con los
  datos nuevos, sin vaciarse.
- **El total se calcula con la información actual.** Precios, subtotales y envío salen de
  lo que se acaba de leer en Firestore, no de lo que se mostró en la página.
- **Pedido y stock en un mismo lote.** Con el `writeBatch()` de la Semana 11 se prepara
  el documento del pedido y un `lote.update()` con el stock nuevo de cada producto, y se
  confirman juntos con `commit()`. Si falla la conexión no queda un pedido sin descontar
  stock ni stock descontado sin pedido.
- **Sin valores negativos.** El stock nuevo es `stock - cantidad`, y la cantidad ya se
  comparó con el stock en el paso anterior; antes de escribir se controla otra vez que
  el resultado sea mayor o igual a 0.
- **El carrito se vacía solo al final.** `guardarCarrito([])` se ejecuta recién después de
  que `commit()` terminó bien. Si hay un error, el carrito queda como estaba y se avisa.
- **Pantalla de confirmación** con el número de pedido y el total, y enlaces a "Ver mis
  pedidos" y "Seguir comprando". Mientras se procesa, el botón dice "Confirmando compra…"
  y queda deshabilitado para no registrar el pedido dos veces.

Cada pedido es un documento de la colección `pedidos`:

| Campo | Contenido |
| --- | --- |
| `uid`, `nombreUsuario`, `correo` | Quién compró (el usuario autenticado) |
| `productos` | Arreglo con `idProducto`, `nombre`, `precioUnitario`, `cantidad` y `subtotal` |
| `subtotal`, `envio`, `total` | Importes calculados con los precios actuales |
| `fecha` | Momento de la confirmación |
| `estado` | `"pendiente"` al crearse (lo cambiará el panel administrativo) |

##### Historial de pedidos en el perfil

- `perfil.html` muestra "Mis pedidos" con la fecha, el estado, los productos, el envío y
  el total de cada compra, de la más reciente a la más antigua.
- `obtenerPedidosDeUsuario(uid)` usa `query()` y `where("uid", "==", uid)`: Firestore
  devuelve **solo** los pedidos de la persona que inició sesión; los de otros usuarios no
  llegan al navegador.
- Tiene estado de carga, mensaje si todavía no hay compras y mensaje si falla la consulta.

##### Opiniones y valoraciones en Firestore

- En el Sprint 2 no se habían implementado comentarios locales, así que las opiniones se
  crearon directamente en la colección `valoraciones` de Firestore.
- **Una opinión por persona y producto.** El id del documento es `idProducto_uid` (por
  ejemplo `p1_Xy12...`), con `setDoc()`: si alguien vuelve a opinar, se actualiza su
  opinión en lugar de duplicarse. El formulario se abre con la opinión anterior cargada.
- **Asociada al usuario autenticado.** Se guardan `uid` y `nombreUsuario` del usuario
  actual. Sin sesión, en lugar del formulario aparece una invitación a ingresar que vuelve
  a la misma ficha.
- **Validación** con `validarValoracion()`: la puntuación debe ser un entero de 1 a 5 y el
  comentario debe tener entre 10 y 500 caracteres (sin contar espacios al inicio y al
  final). Si no cumple, se avisa y no se llama a Firestore.
- **Seguridad al mostrar.** El nombre y el comentario los escribe un usuario, por eso se
  insertan con `textContent` (creando los elementos con `createElement()`) y no con
  `innerHTML`: si alguien escribe etiquetas HTML, se ven como texto y no se ejecutan.
- La ficha muestra el promedio con estrellas y la cantidad de opiniones, y la lista de
  opiniones de la más nueva a la más vieja, con estado de carga y mensaje de error.

##### Pruebas de la semana del 11/10

- Sin sesión, "Confirmar compra" no registra nada y ofrece ingresar; al registrarse se
  vuelve al carrito.
- Si el stock de un producto baja en Firestore antes de confirmar, la compra no se
  registra, se explica qué producto falta y el carrito no se vacía.
- Si falla la conexión al confirmar, el carrito queda intacto y el stock no cambia.
- Si el precio cambió en Firestore, el pedido se registra con el precio nuevo.
- Una compra correcta crea el pedido con todos sus campos, descuenta el stock (12 → 10 al
  comprar 2 unidades) y vacía el carrito.
- El perfil muestra solo los pedidos del usuario autenticado, aunque existan pedidos de
  otras cuentas.
- Las opiniones rechazan la falta de puntuación y los comentarios cortos; una opinión
  válida se publica con el nombre del usuario y actualiza el promedio.
- Volver a opinar actualiza la opinión existente sin duplicarla.
- Un comentario con etiquetas HTML se muestra como texto.
- Un parámetro `volver` con una dirección externa se descarta y se va al perfil.

#### Cómo se confirma una compra y se actualiza el stock

1. En `carrito.html`, `js/carrito.js` comprueba que haya un usuario autenticado.
2. Llama a `confirmarPedido(usuario, carrito)` de `js/modules/pedidos.js`.
3. Esa función vuelve a leer cada producto, valida disponibilidad y stock, y calcula
   subtotales, envío y total con los datos actuales.
4. Arma un `writeBatch()` con `lote.set()` del pedido nuevo y `lote.update()` del stock de
   cada producto, y lo confirma con `commit()`.
5. Si todo salió bien, `carrito.js` vacía el carrito y muestra la confirmación; si no,
   muestra el problema y el carrito queda como estaba.

#### Completitud del Sprint 3

| Para considerar completo el Sprint 3 | Dónde |
| --- | --- |
| Firebase se inicializa correctamente | `js/firebase/config.js`, única inicialización |
| Registro, inicio, persistencia y cierre de sesión | `login.html`, `auth.js`, `navbar.js` |
| Perfil protegido con los datos del usuario | `perfil.html` y `js/pages/perfil.js` |
| Productos obtenidos desde Firestore | `productos-firestore.js`, inicio, catálogo, ficha y carrito |
| Catálogo y detalle con los datos actuales | `getDocs()` y `getDoc()` en cada carga |
| Compras que registran pedidos y actualizan el stock | `confirmarPedido()` en `pedidos.js` |
| Cada usuario ve únicamente sus pedidos | `where("uid", "==", uid)` en el perfil |
| Comentarios que identifican al usuario correcto | `valoraciones.js`, id `idProducto_uid` |
| Errores y estados de carga en la interfaz | `htmlCargando()` y `htmlMensaje()` en todas las páginas |
| Panel administrativo inicial con CRUD (resultado esperado del sprint) | `admin.html` y `js/pages/admin.js`, protegido por rol |

#### Panel administrativo (`admin.html`)

##### Roles de cliente y administrador

- Todas las cuentas se registran con `rol: "cliente"` en `usuarios/{uid}`. El rol
  `"admin"` se asigna a mano desde la consola de Firebase, como anticipa la Semana 9:
  *Firestore Database → usuarios → documento de la cuenta → campo `rol` → `admin`*.
- **El enlace "Administración" del menú** solo aparece si el rol es `"admin"`
  (`navbar.js` lee el documento del usuario).
- **Ocultar el enlace no alcanza**, como advierte la consigna: al cargar `admin.html`,
  `js/pages/admin.js` vuelve a leer el rol en Firestore. Sin sesión redirige a
  `login.html?volver=admin.html`; con rol cliente el panel nunca se dibuja, aunque se
  escriba la dirección a mano (desde el Sprint 4, además, vuelve al inicio con un aviso).

##### Gestión de productos (CRUD)

| Operación | Cómo se hace | Función de Firebase |
| --- | --- | --- |
| Crear | Botón **Nuevo producto** y formulario. El id es el siguiente libre (`p13`, `p14`…) | `setDoc()` |
| Leer | Tabla con todos los productos, incluso los inactivos | `getDocs()` |
| Actualizar | **Editar** abre el formulario con los datos actuales; se cambian solo esos campos | `updateDoc()` |
| Desactivar | **Desactivar / Activar** cambia `disponible` sin borrar nada | `updateDoc()` |
| Eliminar | **Eliminar**, con confirmación previa | `deleteDoc()` |

- El formulario gestiona nombre, categoría (con las existentes como sugerencia),
  descripción, **precio**, **stock**, **disponibilidad**, **destacado**, imagen,
  texto alternativo y características (una por línea).
- **Imagen como ruta o URL de texto**, como propone la Semana 11: la foto va en
  `assets/img/productos` y en el formulario se escribe su ruta. Se rechazan las rutas de
  una computadora (`C:\Users\...`).
- **Validación:** nombre de al menos 3 caracteres, descripción de al menos 10, precio mayor
  que 0 y stock entero igual o mayor que 0. Los problemas se muestran todos juntos y no
  se guarda nada hasta corregirlos.
- **Productos destacados:** el inicio ya no usa una lista fija de ids; muestra hasta cuatro
  productos con `destacado: true` y `disponible: true`, que se marcan desde el panel.
- **Desactivar o eliminar:** desactivar es lo recomendado, porque el producto deja de
  venderse pero conserva sus opiniones. Los pedidos guardan nombre y precio, así que
  eliminar un producto no rompe el historial.

##### Consulta de pedidos

- La pestaña **Pedidos** muestra todos los pedidos de la tienda, del más reciente al más
  antiguo, con cliente, correo, fecha, productos y total.
- **Cambio de estado:** pendiente → en preparación → enviado → entregado, o cancelado. El
  cliente ve el estado nuevo en su perfil.
- **Cancelar devuelve el stock:** en un mismo `writeBatch()` se cambia el estado y se suman
  las unidades a cada producto. Un pedido cancelado ya no se puede cambiar, para no
  devolver el stock dos veces.

##### Pruebas del panel

- Sin sesión, `admin.html` redirige al login y, después de ingresar, vuelve al panel.
- Con una cuenta cliente el enlace del menú no se ve y el panel no se muestra.
- Con rol `admin` se ven el enlace y el panel con los productos.
- Crear un producto con datos vacíos o con una ruta `C:\...` muestra los problemas; con
  datos válidos se crea `p13` y aparece en el catálogo.
- Editar el precio de un producto se refleja en el catálogo sin tocar el resto de los campos.
- Un producto desactivado desaparece del catálogo; uno eliminado desaparece del panel.
- Una compra aparece en la pestaña Pedidos; pasarla a "enviado" se ve en el perfil del
  cliente y cancelarla devuelve el stock (10 → 12).

#### Cómo se registran y autentican los usuarios

1. En `login.html`, `js/pages/login.js` valida el formulario.
2. Llama a `registrarUsuario()` de `js/modules/auth.js`, que ejecuta en orden:
   `createUserWithEmailAndPassword()` → `updateProfile()` → `crearPerfilUsuario()`
   (`js/modules/usuarios.js`, que hace el `setDoc()` en Firestore).
3. Para ingresar se usa `iniciarSesion()`, que llama a `signInWithEmailAndPassword()`.
4. En todas las páginas, `js/modules/navbar.js` escucha `onAuthStateChanged()` y
   actualiza el navbar. En `perfil.html`, `js/pages/perfil.js` usa el mismo observador
   para proteger la página y leer el documento con `getDoc()`.

La contraseña nunca pasa por la base de datos del proyecto: la guarda y la valida
Firebase Authentication.

#### Cómo está organizado el código JavaScript del Sprint 3

Se separó la conexión, las operaciones con Firebase y la presentación, como pide la
consigna (no mezclar autenticación, base de datos e interfaz en un único archivo):

| Carpeta | Archivos | Responsabilidad |
| --- | --- | --- |
| `js/firebase/` | `config.js` | Conectar el proyecto con Firebase |
| `js/modules/` | `auth.js`, `usuarios.js`, `productos-firestore.js`, `pedidos.js`, `valoraciones.js` | Hablar con Authentication y con Firestore, sin tocar el HTML |
| `js/modules/` | `navbar.js`, `agregar-carrito.js` | Comportamiento común a varias páginas |
| `js/pages/` | `login.js`, `perfil.js`, `admin.js`, `cargar-productos.js` | Lógica de las páginas nuevas del Sprint 3 |

Los archivos de las páginas del Sprint 2 (`inicio.js`, `catalogo.js`, `producto.js` y
`carrito.js`) conservan su lugar en `js/` para no cambiar la estructura del proyecto, pero
desde la semana del 4/10 son módulos que leen los productos de Firestore.

#### Usuarios de prueba

Las cuentas están en *Cómo evaluar el proyecto*, al principio de este archivo. Con dos
cuentas se puede comprobar que cada usuario ve únicamente sus propios pedidos en el perfil
y que cada opinión aparece con el nombre de quien la escribió. Con la cuenta de
administrador se accede a `admin.html`; con las de cliente se vuelve al inicio con un aviso.

#### Pruebas de la semana del 20/9

- Firebase se inicializa sin errores en la consola.
- Registro vacío o con datos inválidos: cada campo muestra su error y no se llama a Firebase.
- Correo ya registrado y contraseña incorrecta: aparece el mensaje en español y el botón
  vuelve a habilitarse.
- Registro correcto: se crea el documento `usuarios/{uid}` y se llega al perfil con los datos.
- Al recargar `perfil.html` la sesión sigue activa.
- Abrir `perfil.html` sin sesión redirige a `login.html`.
- Abrir `login.html` con sesión iniciada lleva directamente al perfil.
- El navbar cambia en todas las páginas según la sesión.
- Cerrar sesión vuelve al inicio y el navbar muestra otra vez *Ingresar*.
- El catálogo, la ficha y el carrito siguen funcionando igual que en el Sprint 2.

### Funcionalidades desarrolladas en el Sprint 2

#### Semana del 23/8 · Productos y catálogo dinámico

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

#### Semana del 30/8 · Búsqueda, filtros y eventos

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
- **Orden del catálogo** (opcional de la consigna). Un tercer selector permite ordenar por
  nombre de la A a la Z, por precio de menor a mayor y de mayor a menor, con `sort()`.
  Como `sort()` modifica el array que recibe, siempre se aplica sobre el resultado de
  `filter()`, que es un array nuevo: el array `productos` conserva su orden original.
- **Eventos utilizados:** `input` en el buscador para filtrar mientras se escribe,
  `change` en el selector, `click` en el botón Limpiar y `submit` en el formulario con
  `preventDefault()` para que al apretar Enter la página no se recargue.

#### Semana del 6/9 · Detalle dinámico del producto

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

#### Semana del 13/9 · Carrito y LocalStorage

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
- **Costo de envío simulado** (opcional de la consigna). El resumen separa subtotal, envío
  y total. El envío es gratis a partir de $ 2.000 y cuesta $ 290 por debajo de ese monto,
  las mismas condiciones que anuncia la portada. Cuando es gratis se muestra la palabra
  "Gratis" en lugar de "$ 0".
- **La compra todavía no es real.** El botón "Confirmar compra" avisa que el pago y los
  pedidos corresponden al Sprint 3.
- **Funciones compartidas.** `formatearPrecio()` y el texto del stock estaban repetidos en
  `catalogo.js` y en `producto.js`. Al necesitarlos también el carrito, se movieron a
  `js/base.js` (`formatearPrecio()` y `describirStock()`), que se carga en todas las
  páginas: ahora el catálogo, la ficha y el carrito muestran siempre lo mismo.

#### Ajustes de coherencia hechos junto con esta entrega

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

#### Contenidos del curso aplicados

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
| 5 | `sort()` con función de comparación | Orden por nombre y por precio |
| 5 | Operadores de comparación | Orden alfabético y condición del envío gratis |
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

#### Cómo está organizado el código JavaScript

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

#### Información guardada en LocalStorage

| Clave | Contenido | Ejemplo |
| --- | --- | --- |
| `carritoNivel99` | Arreglo de objetos con el identificador de cada producto y su cantidad, convertido a texto con `JSON.stringify()` | `[{"idProducto":"p1","cantidad":2},{"idProducto":"p4","cantidad":1}]` |

Es lo único que se guarda en el navegador. No se almacenan datos personales ni información
de pago: los pedidos reales y las cuentas de usuario corresponden al Sprint 3, con Firebase.

#### Opcionales de la consigna incorporados

| Opcional | Dónde |
| --- | --- |
| Mostrar la cantidad de resultados encontrados | Contador del catálogo |
| Ordenar productos por nombre o precio | Selector "Ordenar por" del catálogo |
| Mensajes mediante toast en lugar de `alert()` | Todos los avisos del sitio |
| Costo de envío simulado en el resumen del carrito | Panel de resumen |

#### Pendiente dentro del Sprint 2

Las cuatro entregas semanales están completas. Queda la semana de cierre: pulido general,
validaciones y repaso integrador del sprint.

### Funcionalidades desarrolladas en el Sprint 1

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

### Pruebas realizadas en los sprints 1 y 2

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
- El orden por nombre y por precio funciona junto con la búsqueda y el filtro, y el botón
  Limpiar lo devuelve al orden original.
- El resumen del carrito separa subtotal, envío y total, y el envío pasa a "Gratis" al
  superar los $ 2.000.
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

Con el Sprint 4 se completaron todos los sprints del proyecto. Lo que podría sumarse más
adelante está en *Posibles mejoras futuras*.

## Decisiones de diseño adoptadas

- **Paleta azul y blanca.** El azul `#0b6fd4` sobre fondo blanco transmite confianza y
  legibilidad; el azul noche `#061b33` se reserva para navbar, beneficios y footer, y el
  cian `#22d3ee` funciona como único color de acento. Se comprobó que el texto sobre fondo
  oscuro y sobre fondo claro mantenga contraste suficiente.
- **Dos tipografías.** Chakra Petch en títulos y botones aporta el carácter gamer;
  Inter en los textos largos prioriza la lectura.
- **Variables CSS.** Toda la identidad está centralizada en `:root`, de modo que un cambio
  de color o de radio se propaga a todas las páginas.
- **Bootstrap + CSS propio.** Bootstrap resuelve grilla y componentes; el archivo
  `styles.css` solo redefine lo necesario para que el sitio no parezca una plantilla.
- **Coherencia entre páginas.** Navbar, footer, toast y tipografías son idénticos en las
  todas las páginas para que el sistema se perciba como un único producto.
- **Íconos y logotipo en SVG.** Se almacenan en `assets/` porque escalan sin perder
  calidad y no dependen de librerías externas de íconos.
- **Alcance técnico acotado al curso.** En el Sprint 1, el sitio se resolvió con los
  recursos trabajados en las semanas 1 a 4: HTML semántico, selectores, herencia, especificidad, modelo de caja,
  `box-sizing`, `position`, pseudo-clases, `::before` y los componentes de Bootstrap
  (contenedores, grilla de 12 columnas, utilidades, botones, cards, navbar y formularios).
- **Pago en línea simulado.** La pasarela simulada muestra el recorrido de un pago en línea
  (ir a pagar, volver a la tienda con el resultado y registrarlo) con contenidos del curso:
  parámetros de URL y Firestore. No agrega servicios externos y el pago siempre se puede
  evitar eligiendo "Coordinar con el equipo".

## Limitaciones conocidas

- Las fotografías de `assets/img/productos` son de Unsplash (licencia de uso libre) y
  todavía no están optimizadas. En `assets/img/producto-placeholder.svg` hay una imagen
  local de reemplazo.
- Los enlaces de redes sociales son simulados (`href="#"`) y están aclarados en el footer.
- Las reglas de Firestore no comparan el precio guardado en un pedido con el de la
  tienda, así que un pedido "Coordinar con el equipo" creado por fuera del sitio podría
  tener un total falso; el equipo lo revisa antes de enviarlo.
- Las reglas dejan que un cliente con sesión baje el stock (sin dejarlo negativo), porque
  la compra lo descuenta desde el navegador. Un descuento sin compra solo se evitaría
  confirmando el pedido desde un servidor.
- El rol de administrador se asigna a mano desde la consola de Firebase.
- El carrito se guarda en el navegador: si se abre el sitio en otro equipo o en otro
  navegador, el carrito aparece vacío. Compartir el carrito entre dispositivos requiere
  la cuenta de usuario del Sprint 3.
- La confirmación lee el stock y después escribe el lote: si dos personas compran el último
  producto en el mismo instante, las dos lecturas podrían ver stock disponible. Para
  evitarlo del todo haría falta una transacción (`runTransaction()`); las reglas del
  Sprint 4 ya impiden que el stock quede negativo.
- El envío es simulado. El pago "Coordinar con el equipo" deja el pedido en estado
  "pendiente" hasta que el equipo lo actualiza.
- El pago en línea de la entrega es simulado: el resultado lo elige la persona en la
  pasarela. En un comercio real lo confirmaría el medio de pago.
- Cada producto tiene por ahora una sola imagen en el arreglo `imagenes`, por eso la ficha
  muestra una foto y todavía no incluye el carrusel de imágenes que propone el proyecto.

## Posibles mejoras futuras

- Reemplazar la pasarela simulada por un medio de pago real en modo de prueba, por ejemplo
  Mercado Pago, con un servidor que guarde la clave secreta y confirme cada pago.
- Confirmar las compras con `runTransaction()` para evitar dos ventas del último producto.
- Optimizar las fotografías de `assets/img/productos` y sumar más de una por producto
  para el carrusel.
- Subir imágenes desde el panel administrativo con Cloudinary, como propone la Semana 11.
- Agregar un carrusel de marcas o de combos destacados en la página de inicio.
- Incorporar un modo oscuro reutilizando las variables ya definidas en `:root`.
