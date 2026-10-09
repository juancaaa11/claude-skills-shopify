# Técnicas: qué funcionó, qué no, qué no depende del tema y dónde se tropieza

Cada fila dice en qué tienda se midió (A = tienda de suplementos sobre el tema Horizon; B = tienda de cosmética; las dos están en `casos/`) y con qué perfil. Son
**Casos** que ilustran un **Método**: la técnica se puede reutilizar; la cifra, no. Antes de aplicar ninguna en otra
tienda, comprueba con una medición que allí existe el problema que resuelve.

Perfiles: «lento» = 4G lenta aplicada y procesador ×4; «×6» = procesador ×6 sin límite de red; «rápida» = 4G de 9 Mbps
y procesador ×4. Detalle en `medicion.md`.

## A. Funcionó

### Que se pueda comprar cuanto antes

| Técnica | Resultado medido |
| --- | --- |
| Los scripts propios (formulario, packs, galería) arrancan al terminar de leerse el HTML, en vez de hacer cola detrás de los módulos del tema y de los scripts diferidos de Shopify. Se precargan y se ejecutan desde un pequeño cargador en línea | Caso A, lento: formulario listo 7,3 → 2,7 s. Caso B, lento: 5,20 → 3,37 s |
| La barra de compra hace lo básico (bajar a las ofertas) con un script en línea mínimo, sin esperar a nada | Caso A: respondía a los 5,7–7,3 s; pasa a responder al pintarse. Caso B, lento: 5,20 → 3,13 s |
| «Toque temprano»: un script en línea recuerda el toque en «Comprar» si llega antes que el script del formulario y lo abre cuando está listo | Caso B, lento: en el tema publicado un toque a los 2,0 s no abría nunca; con el cambio se abre solo en cuanto el script está listo (~4,75 s), 3 de 3. Caso A, lento, con los scripts aplazados: el formulario abre 170 ms después del toque |

### Que la foto principal llegue y se pinte antes

| Técnica | Resultado medido |
| --- | --- |
| La foto principal viaja sola: la segunda foto de la galería se pide al llegar la principal y las demás al terminar la carga o al primer gesto sobre la galería (la foto a la que se va, primero) | Caso A, lento: LCP −0,7 s y la página termina de cargar 2,9 s antes. Caso B: ~350 KB menos |
| `sizes` que describe la caja real y `srcset` con escalones finos (~60 px) | Caso A, lento: LCP −0,44 s; foto 77 → 64 KB en móvil y 111 → 56 KB en escritorio |
| Precarga de la foto principal desde el `<head>` con `imagesrcset` e `imagesizes` | Caso B: se pide ~0,3 s antes |
| `decoding="sync"` en la foto principal | Caso B, ×6: retraso de pintado 1,14 → 0,42–0,70 s. Caso A: en la primera pasada no cambió nada; se adoptó después para que el LCP no dependiera de qué llegaba un fotograma antes |
| Diálogos cerrados (formulario de pedido) al final del `<body>` y estilos de la plantilla partidos: antes de la foto, solo los de la galería | Caso B, ×6: primer pintado 0,96 → 0,77 s; foto pintada 1,67 → 1,08 s. Con 4G lenta no se nota: ahí manda la red |
| Miniaturas y portadas esperan a la foto; vista previa borrosa de 48 px mientras descarga | Caso B, lento: LCP 5,66 → 4,97 s |
| Parámetro de calidad de la CDN de Shopify en las fotos del carrusel (`&quality=80`; no en la del zoom) | Caso A: foto principal 65 → 47 KB. Es un parámetro que la CDN acepta pero no está documentado |
| Las primeras tarjetas de producto en búsqueda y carrito vacío, con carga inmediata y prioridad alta | Caso A, lento: LCP 5,0 → 2,1 s en las dos páginas |
| Miniaturas a su tamaño real (84/128/168/252 px) | Caso B: −12 KB en 6 miniaturas |
| Tope de ~2x en pantallas muy densas | Caso B: −50 a −60 KB por foto, **calculado, no medido** (la emulación no reproduce pantallas 3x). Es una diferencia visible: se declara |

### Fuentes

| Técnica | Resultado medido |
| --- | --- |
| Servir desde el tema los mismos archivos que daba Google Fonts | Caso A, rápida: primer contenido −0,6 s |
| Quitar precargas de fuentes que nada usa | Caso A: −118 KB por visita |
| Recortar a caracteres latinos y dejar una sola copia de cada familia | Caso B: 39 → 29 KB por peso |
| Fuentes de la primera pantalla con `<link rel="preload" as="font">` | Caso B: parte de la subida de PageSpeed móvil 66 → 85 |
| Fuentes **después** de la foto principal. Caso A: en la primera visita se encienden al pintarse la foto; en las siguientes, antes del primer pintado (marca en `localStorage`), sin parpadeo. Caso B: solo en conexiones lentas | Caso A: ~100 KB dejan de competir con la foto. Caso B, lento: foto −0,95 s, banner de cookies −0,5 a −0,9 s. **Coste:** el texto sale con la letra del sistema y cambia después; en el caso B el CLS pasó de 0,001 a 0,043 y el cambio de letra se retrasó a ~5,6 s. Es visible durante la carga: se avisa al dueño |

### Scripts del tema y de Shopify

| Técnica | Resultado medido |
| --- | --- |
| «Puerta después de pintar»: los módulos del tema base no se descargan ni ejecutan hasta que el mayor elemento está pintado, o al primer toque, tecla o scroll, o a los 3 s como tope | Caso A: LCP simulado 3,0 → 2,4 s solo por esto; la pasada completa llevó PageSpeed móvil de 90 a 96 en pasadas sin tropiezo. A cambio, en un móvil lento el menú y el zoom están listos ~1 s más tarde que antes |
| Precarga del checkout de Shopify inerte **mientras el pago con tarjeta esté desactivado** | ~930 KB y ~150 archivos menos por visita (caso B, con el resto de la ronda: 2.025 → 1.299 KB) |
| Sincronización del carrito de Shop, precarga y preconexión a shop.app inertes con la misma condición | Caso A: −20 peticiones por página; LCP −0,66 s en la ficha y −1,5 s en inicio (junto con la fila siguiente) |
| La cabecera no se pide una segunda vez si el menú no tiene submenús | Caso A: −17 KB y una petición al servidor por página |
| No renderizar el botón de cuenta que estaba oculto con CSS | Caso A: −39 peticiones, −58 KB, −570 ms de procesador (×6) |
| Comprobación de Shop Pay inerte con la misma condición | Caso A: −0,15 s simulados y desaparece una cookie de terceros |
| Hoja pequeña de un componente, en línea dentro del componente | Caso A: una hoja bloqueante menos |
| Precarga de alta prioridad del script del banner de cookies | Caso B, lento: banner 6,1 → 4,6 s. Coste: LCP +30–60 ms, TBT +~100 ms |

### Procesador

| Técnica | Resultado medido |
| --- | --- |
| Rehacer una animación en bucle para que solo use `transform` y `opacity`, con el mismo aspecto (un disco que escala y se desvanece en lugar de animar `box-shadow`) | Caso B: procesador en reposo 5.190 → 379 ms por cada 7 s. Paridad visual comprobada: 0 píxeles distintos |
| `content-visibility: auto` en las secciones bajo la primera, y un script que las «asienta» una vez en reposo | Caso A, ×6: −430 ms de procesador en carga. Caso B: reposo 3,74 → 0,25 s (junto con dejar sin animación un contador) |
| Medir deslizadores y paginaciones al acercarse a la pantalla, no al arrancar | Caso A: una tarea de ~130 ms menos |
| Publicar alturas con `ResizeObserver` en vez de leer `offsetHeight` | Desaparece el aviso de «redistribución forzada» |

### Vídeo

| Técnica | Resultado medido |
| --- | --- |
| Ni portada ni archivo en el HTML (`preload="none"`, la portada en un atributo propio que un script coloca al acercarse) | Caso A, lento: LCP −0,84 s; nada de vídeo descargado si no se reproduce |
| Solo la carátula hasta que la fila está en pantalla; versión ligera (480p) que ya genera Shopify; un vídeo cada vez; se corta la descarga al salir de pantalla; con ahorro de datos, 2G o «reducir movimiento» no arrancan solos | Caso B: 8,8 / 10,4 / 6,4 MB por vídeo → 1,6 / 1,5 / 1,2 MB; al pasar de largo, de +2,1 MB a 0,8 MB y para |

## B. Probado y descartado

| Idea | Qué pasó |
| --- | --- |
| Poner la hoja base en línea para que no bloquee | **Empeoró**: LCP simulado 3,0 → 8,5 s y nota 92 → 72 (caso B). Shopify ya adelanta esas hojas |
| Quitar los módulos del tema base que la página no usa (17) | Sin mejora medible (3,39 s frente a 3,20 s de control). Riesgo sin beneficio |
| Dejar una sola copia de una ilustración SVG repetida (HTML de 554 → 314 KB) | Ninguna cifra cambia: el servidor ya comprime las repeticiones |
| Sacar un ajuste de texto del análisis del HTML | Mismo trabajo, solo cambia de sitio |
| Saltarse el cálculo de los bloques bajo el botón de compra para adelantar el primer pintado | El primer cálculo tarda lo mismo (82–86 ms) |
| Cambiar a la versión variable de la fuente | Anchos de texto 1–4 % distintos y saltos de línea cambiados: rechazado por alterar el diseño |
| Quitar animaciones decorativas una vez arreglado el reposo | Ya no aportaba nada medible (~0,25 s de cada 7) |
| Prioridad alta a la foto de cabecera de colección | Sin cambio medible en la reproducción (que no respeta prioridades); se dejó por correcta |
| Sustituir texto de `content_for_header` para quitar hojas o scripts que Shopify añade **después** de renderizar | Sin efecto: no pasan por ahí |
| Esperar que `preload_tag` meta la foto en la cabecera `Link` | No lo hace con imágenes |
| Abrir la puerta con el pintado, precargar la foto y pausar animaciones **para quitar el tropiezo de PageSpeed** | No lo quitan (ocurre antes de que la página pinte). Se quedaron porque son correctos por sí mismos |
| Partir la hoja de estilos por tipo de página para bajar el «CSS sin usar» | No hecho: cambia el orden de las reglas (ya rompió una animación) y no mueve la nota |
| Bloquear, como experimento, un script de Shopify (`webmcp`) o el banner de privacidad | La nota no cambió |

Lo que no mejoró aunque el cambio fuera correcto: el LCP con 4G lenta en la primera ronda del caso B (5,68 → 5,71 s: la
foto seguía compartiendo línea con ~700 KB); el TBT en varias rondas (el mismo trabajo se hace antes); con procesador
×6 y red sin límite, casi nada de lo que ahorra descargas.

## C. Lo que no depende del tema

Aparecerá en PageSpeed haga lo que haga el tema. Se lista en el informe y no se persigue.

- `compiled_assets/styles.css`: la hoja que Shopify compila con todos los bloques `{% stylesheet %}` del tema. Bloquea
  el pintado y sale como «CSS sin usar». Se carga después de las hojas del tema: para pisarla hace falta más
  especificidad. Reducirla exige reescribir los estilos del tema base.
- `accelerated-checkout-backwards-compat.css`: bloquea y solo se guarda 5 minutos en caché.
- `storefront/standard-actions.js` y `standard-events.js`, al final del `<body>`.
- Gestor de píxeles (~80 KB), analítica (~35 KB), `perf-kit` (~26 KB), banner de privacidad (~27 KB), `webmcp`
  (~24 KB): unos 170–210 KB y, en el caso B con procesador ×4, ~580 ms que se ejecutan a la vez que la foto. Aplazarlos
  subiría la nota en las pasadas con tropiezo, pero es retrasar píxel y analítica: lo decide el dueño.
- El banner de cookies necesita una consulta a Shopify después de su script (~0,65 s con 4G lenta).
- La CDN solo sirve AVIF en anchos pequeños.
- Qué hojas adelanta Shopify («Early Hints») y cuándo.
- Safari no informa del tipo de conexión: lo que dependa de «conexión lenta» allí no se activa.
- Shopify cambia lo que inyecta sin avisar.

## D. Trampas al implementar

**Precarga de la foto.** Debe usar exactamente las mismas URLs, `srcset` y `sizes` que el `<img>` (compártelos desde un
solo snippet); si no coinciden a la letra, la foto se descarga dos veces. Va **después** de la etiqueta `viewport` (antes,
en móvil se bajaban dos archivos). No filtres anchos mayores que la imagen en un lado y no en el otro. Comprueba «foto
principal descargada 1 vez».

**Aplazar scripts hasta después de pintar.**
- La señal de «ya se ha pintado» no existe en todos los navegadores: Safari no lanza error ante un tipo de
  `PerformanceObserver` que no conoce; mira antes `supportedEntryTypes` y ten un camino alternativo y un tope de tiempo.
- Una segunda imagen con `fetchpriority="high"` y `loading="lazy"` (la copia del zoom) no se completa nunca: si la
  puerta la esperaba, no se abría. Ignora las diferidas.
- Los módulos que llegan con la página ya cargada no reciben el evento `load`: el código debe mirar `readyState`.
- Cualquier toque o tecla debe abrir la puerta al instante.
- En el editor del tema, la puerta desactivada.
- Un script que tenga que ejecutarse antes del primer pintado no puede quedar detrás de la puerta.

**Animaciones en pausa hasta pintar.** Una animación de entrada que parte de `opacity: 0` en la primera pantalla queda
invisible mientras tanto. No usarlas ahí.

**Vídeo.** Si el `<video>` lleva `loading="lazy"`, Chrome no pide una portada puesta después: el vídeo queda en gris.
Se detectó por captura en el tema de pruebas, antes de publicar.

**Liquid.**
- La salida de `image_tag` es HTML seguro hasta que un filtro de texto la toca. `image_tag | replace: … | escape`
  imprime la etiqueta como texto en la página. Pasó al añadir el parámetro de calidad a las miniaturas y llegó a la
  tienda publicada.
- `image_tag` no escribe `alt` si recibe `nil`.
- `images['archivo.ext']` devuelve una imagen vacía si el archivo no existe y su `.width` es una cadena vacía (que
  Liquid da por cierta): se comprueba con `!= blank`.
- Las sustituciones de texto exacto sobre `content_for_header` dejan de aplicarse en silencio si Shopify cambia ese
  texto. Diseñarlas para que, si fallan, todo cargue como siempre.

**CSS.**
- Con la misma especificidad gana la regla que va más abajo. Mover un bloque de estilos cambia qué se ve.
- Cambiar una etiqueta (`h3` → `h2`) cambia interlineado y espaciado heredados: fija esos valores en la clase.
- `content-visibility: auto` con tamaño estimado hace que una sección **vacía** reserve cientos de píxeles: ocúltala
  con `:not(:has(*))`.
- Chrome agranda una caja con `aspect-ratio` hasta la proporción de la imagen y Safari la recorta: imagen en posición
  absoluta dentro de la caja.
- Fuentes aplazadas: reserva de espacio o habrá salto.

**Contenedor de scroll.** En Horizon, en escritorio, la página se desplaza dentro de `.page-wrapper`, no en el
documento: `IntersectionObserver` necesita ese `root` y las pruebas, `scrollIntoView`.

**Condiciones.** Todo lo que apaga algo de Shopify «porque no se usa» va ligado al ajuste que lo justifica. Si el dueño
activa el pago con tarjeta, tiene que volver solo.

**Orden de subida.** El snippet nuevo se sube antes que el layout que lo usa.

**Pruebas.** Al añadir una vista previa borrosa o miniaturas nuevas hubo que actualizar la prueba que contaba
descargas de la foto: si no, daba un fallo falso.

## E. Limpieza de archivos del tema

Lo pidió el dueño en el caso A con estas reglas (**Criterio de partida**): borrar solo lo que esté comprobado que no se
referencia desde Liquid, JSON, CSS, JavaScript, configuración, ajustes del tema o funciones de Shopify; si no se puede
confirmar, conservarlo y explicar la duda; no hacer cambios cosméticos gratuitos ni reconstruir el diseño.

Lo que se hizo (**Caso A**): 165 archivos fuera (53 idiomas sin publicar y 112 secciones, bloques,
snippets, scripts e iconos del tema base) y las hojas de estilo ordenadas por bloques con índice.

Lo que salió mal, y la regla que deja cada cosa:

| Qué pasó | Regla |
| --- | --- |
| Se borraron las plantillas del blog; el blog existía (vacío), Shopify lo listaba en el sitemap y `/blogs/news` pasó a dar 404 | Antes y después, pedir **todas las URLs del sitemap** y comparar códigos de respuesta. «Sin uso en el tema» no es «sin uso en la tienda» |
| Al ordenar las hojas, una regla quedó por encima de otra de la misma especificidad y las tarjetas de inicio perdieron su aparición | Antes de reordenar estilos, guardar los estilos calculados de todas las páginas y compararlos después |
| El tema de pruebas se subió sin `--nodelete` | Siempre `--nodelete`; los borrados, a propósito y archivo por archivo |
| Ediciones de plantillas hechas en paralelo se perdieron (un `theme pull` sobre el mismo árbol) y el dueño vio «cosas que se habían perdido» | Ver `shopify-cambios-en-vivo`: no tocar el mismo árbol a la vez y traer el tema publicado a una carpeta aparte |
| El sistema de permisos impidió borrar archivos del tema **publicado** | No se reintenta por otra vía; se deja apuntado y se pregunta |

Antes de una limpieza grande: duplicar el tema publicado como copia de referencia y no borrarla mientras sirva. Los
idiomas: se conservan el predeterminado (obligatorio) y los publicados. `shopify theme check` antes y después: mismos
avisos.

La limpieza es orden y mantenimiento. No se midió ninguna mejora de velocidad atribuible a ella.
