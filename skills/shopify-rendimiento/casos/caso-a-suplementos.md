# Caso A: tienda de suplementos sobre el tema Horizon

**Es un ejemplo, no una referencia.** Las cifras son de laboratorio y de una tienda concreta (octubre de 2026). En
otra tienda sirven para saber qué buscar y qué orden de magnitud esperar; lo demás se vuelve a medir.

## Ficha

- Tienda de suplementos, un solo idioma, abierta y vendiendo. Dos productos, cada uno con su plantilla.
- Tema propio construido sobre **Horizon** (el tema base de Shopify). Un tema publicado y una copia sin publicar para
  probar.
- **Compra:** formulario de pedido propio contra reembolso, sin carrito ni checkout de Shopify; pago con tarjeta
  desactivado. Por eso sobraban la precarga del checkout y los scripts de Shop, y por eso están atados a una condición
  que los devuelve solos si se activa la tarjeta.
- Tráfico: anuncios de redes sociales hacia la ficha de producto, en móvil.

## Lo que pidió el dueño

- «Mínimo un 90» en PageSpeed en la ficha de producto, siguiendo las recomendaciones una a una.
- Optimizar sin sacrificar nada de diseño. En esta tienda pidió además animaciones nuevas (un efecto ligado al
  scroll, contadores): aquí las animaciones eran parte del diseño.
- Limpieza a fondo de lo heredado del tema base.

## Resultado

PageSpeed oficial, ficha de producto, móvil:

| Momento | Rendimiento | Accesibilidad | Prácticas | SEO |
| --- | --- | --- | --- | --- |
| Antes (1 pasada) | 90 (FCP 1,9 s · LCP 3,5 s) | 71 | 96 | 92 |
| Después, pasada sin tropiezo | 96 (FCP 1,8 s · LCP 2,6 s · TBT 20 ms) | 100 | 96 | 100 |
| Después, pasada con tropiezo (7 de 9 esa tarde) | 83–87 (una de 74) | 100 | 96 | 100 |
| Misma tarde, con la carga antigua | 93 sin tropiezo · 77 con tropiezo | | | |
| Comprobación al día siguiente | 96 (FCP 2,0 s · LCP 2,4 s · TBT 20 ms · CLS 0,001) | 100 | 96 | 100 |

Ordenador: 99–100 antes y después. No se puede garantizar ≥ 90 en todas las pasadas (ver «tropiezo» en
`../medicion.md`).

Reproducción local, móvil lento, medianas:

| Página | Foto principal | Formulario listo | Peso / peticiones |
| --- | --- | --- | --- |
| Ficha, primera pasada | 3,06 → 2,41 s | 7,28 → 2,67 s | 1.666 → 1.516 KB / 210 → 168 |
| Ficha, segunda pasada (el «antes» ya incluía secciones nuevas) | 3,21 → 2,33 s | 2,72 → 2,49 s | 1.662 → 1.454 KB / 157 → 136 |
| Inicio, segunda pasada | 4,77 → 3,26 s | — | 882 → 838 KB / 130 → 109 |
| Búsqueda y carrito vacío, segunda pasada | 5,0 → 2,1 s | — | — |

Entre la primera y la segunda pasada el dueño añadió secciones y la ficha volvió a 3,21 s. No pesaban las secciones,
sino dos efectos laterales: la portada de un vídeo al final de la página pedida al cargar, y una galería más grande
pidiendo una foto mayor. Lección: tras cada tanda de contenido nuevo, volver a medir.

## Cómo quedó montado

| Qué | Dónde vive en el tema |
| --- | --- |
| Puerta «después de pintar» y su interruptor de diagnóstico en la URL | Un snippet que es el primer script del `<head>`; el layout cambia `type="module"` por un tipo inerte y la puerta recrea los módulos en orden |
| Scripts propios ejecutados al abrirse la puerta, y toque temprano | Un snippet cargador y otro que recuerda el toque |
| Fuentes tras el pintado | Todas las `@font-face` dentro de `@media (max-width: 0px)`; un snippet las enciende (primera visita: al abrirse la puerta; siguientes: antes del primer pintado, con una marca en `localStorage`) |
| Precarga de la foto principal | Un snippet en el `<head>`; `sizes` y escalones del `srcset` en un snippet compartido con la galería |
| Calidad de las fotos y `decoding="sync"`; resto de la galería después | El snippet de cada foto de producto y el script propio de la galería |
| Vídeos sin portada ni precarga en el HTML | Las secciones con vídeo y un script que coloca la portada al acercarse |
| Checkout, Shop y Shop Pay inertes mientras no haya pago con tarjeta | El layout, con sustituciones de texto exacto sobre `content_for_header` |
| Cabecera sin segunda petición | La sección de cabecera |
| Secciones bajo la primera con `content-visibility` | La hoja de estilos y un snippet que las asienta en reposo |

Particularidades que condicionaban cualquier cambio posterior:

- Un `<script type="module">` nuevo en una sección queda aplazado solo. Un script que deba ejecutarse antes del primer
  pintado no puede ser módulo.
- Una `@font-face` fuera del bloque aplazado se descarga antes que la foto.
- En escritorio la página se desplaza dentro de `.page-wrapper` (así lo hace Horizon).
- Dos reglas de la misma especificidad compartían elemento: su orden en la hoja de estilos importaba.

## Lo que pasó y no debe repetirse

- Limpieza: plantillas del blog borradas → la URL del blog en 404; hojas reordenadas → unas tarjetas de inicio sin su
  animación de entrada. Ambas se detectaron en una auditoría posterior y se corrigieron.
- Un `theme pull` hecho mientras otro proceso editaba el mismo repositorio pisó ediciones de plantillas; el dueño lo
  vivió como «cosas que se han perdido».
- Tras aligerar las miniaturas de la galería, un `| escape` de más imprimía el HTML de la imagen como texto. Llegó a la
  tienda publicada y lo encontró el dueño.
- Horas persiguiendo el tropiezo de PageSpeed desde el tema, hasta verlo en la traza y en el código de Chromium.
- Se gastó el cupo de visitas que la tienda aguanta seguidas y aparecieron respuestas 429: de ahí la reproducción
  local.

## Decisiones que quedaron para el dueño

1. Una fuente cursiva seminegrita (42 KB con prioridad máxima) usada solo en los nombres de las opiniones.
2. Tope de nitidez a 2x.
3. Reexportar más ligero el banner de inicio en móvil.
4. Tarjetas de vídeo vacías que muestran la ilustración de ejemplo: subir vídeo o quitarlas.
5. Aplazar los scripts de Shopify de píxeles, analítica y banner para subir las pasadas con tropiezo: recomendado no
   hacerlo.
