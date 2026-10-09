# Diagnóstico: dónde mirar y de quién es cada cosa

**Método**, con ejemplos del caso A (tienda de suplementos, tema base Horizon) y el caso B (tienda de cosmética). Los ejemplos enseñan qué buscar; en
otra tienda la causa puede ser otra.

## 1. Empieza por el mayor elemento de la primera pantalla

En las dos tiendas era siempre la imagen grande de arriba (primera foto del producto, banner de inicio, cabecera de
colección o primera tarjeta); en páginas de solo texto, el texto. Para ese elemento responde a cuatro preguntas:

1. **¿Cuándo llega el HTML?** Poco margen en Shopify; revisa solo redirecciones previas (`http://`, `www.`, enlaces de
   campaña).
2. **¿Cuándo se entera el navegador de que existe la foto?** Depende de a qué altura del HTML está su `<img>` y de
   qué hay delante. (caso B: a ~180 KB del inicio, detrás de 8 precargas de fuentes; se pedía a ~0,95 s. Caso A: al 37 % del
   HTML.)
3. **¿Con qué comparte la línea mientras se descarga?** Mira la cascada de la traza: todo lo que se pide antes de
   que la foto termine compite con ella en una conexión lenta. (caso B: una foto de ~98 KB compartía línea con ~600–700 KB
   de fuentes y scripts.)
4. **¿Cuánto tarda en pintarse una vez llegada?** Si la foto llega pronto y se pinta tarde, el problema no es de red:
   es lo que el navegador tiene que leer, calcular y ejecutar antes de ese fotograma. (caso B: llegaba en 50 ms y se
   pintaba 1,1 s después, con procesador ×6.)

## 2. Sospechosos, por familias

### Orden y tamaño del HTML
- Bloques grandes **antes** de la foto: un diálogo cerrado (caso B: el formulario de pedido, 29 KB, al principio de la
  página), los estilos de toda la plantilla en línea (caso B: 49 KB), iconos SVG repetidos.
- Ilustraciones de ejemplo de Shopify en secciones vacías (caso A: 80 KB de HTML por un banner de vídeo sin vídeo; 320 KB
  por cuatro tarjetas de vídeo vacías). Aquí el servidor ya comprime las copias repetidas: quitarlas no cambió ninguna
  cifra, pero son un fallo visible que hay que avisar al dueño.

### Estilos que bloquean el primer pintado
- Hoja externa de Google Fonts (bloquea y abre dos conexiones más).
- Hojas pequeñas de un componente cargadas como archivo aparte.
- Lo que **no** era un problema: las hojas principales del tema. Shopify las adelanta («Early Hints») y son los
  estilos de la primera pantalla.

### Fuentes
- Precargas de fuentes que ninguna regla usa (caso A: 118 KB en cada visita).
- Una fuente cargada desde los ajustes del tema por un elemento secundario (caso B: la cinta superior traía su propia
  Montserrat, 38 KB, a la vez que la foto).
- Un estilo que el archivo propio no trae (caso A: nombres en cursiva seminegrita → el navegador descarga otra fuente de
  42 KB con prioridad máxima).
- Familias que solo usa el pie de página, cargadas arriba.
- En la simulación de PageSpeed, una fuente descubierta por CSS bloquea más que una precargada con
  `<link rel="preload" as="font">`.

### Imágenes
- El resto de fotos de la galería descargándose a la vez que la principal (caso A: 354 KB; caso B: 5 fotos ocultas, ~444 KB).
- `sizes` que no describe la caja real, heredado del tema base (caso A: testimonios pedían siempre 800 px; ingredientes
  900 px para una caja de 270; galería 832 px donde bastaban 640).
- Miniaturas a un ancho fijo mayor que su caja (caso B: 150 px para 84).
- Pantallas muy densas pidiendo la foto a 3x (caso B: 1.080–1.200 px, 150–160 KB).
- El mayor elemento marcado como diferido: en búsqueda y carrito vacío las primeras tarjetas eran el LCP y se pedían
  las últimas (caso A: 5,0 s).
- Fotos subidas por el dueño que pesan de más (caso A: 100–400 KB cada foto de ingrediente; banner de inicio de 129 KB
  para 390 px). Eso se arregla reexportando: es decisión y trabajo del dueño.

### Vídeo
- La portada (`poster`) de un vídeo que está al final de la página, pedida al cargar (caso A: 44 KB compitiendo con la
  foto principal).
- El archivo de vídeo descargándose al acercarse, sin que nadie pulse reproducir.
- Varios vídeos arrancando a la vez (caso B: tres originales de 1080 × 1920, 25,7 MB en total, al bajar 640 px; con 4G
  lenta no llegaban a reproducirse y seguían descargando al pasar de largo).

### JavaScript propio
- Scripts propios en cola detrás de los módulos del tema y de los scripts diferidos de Shopify: la barra de compra se
  ve y no responde (caso A: visible a 1,2–2,8 s, respondía a 5,8–7,4 s; caso B: 1,4 s y 4,1 s).
- Código que espera a `DOMContentLoaded` o a `load` cuando ya han pasado (caso B: la X de la etiqueta de WhatsApp no
  funcionaba).
- Peticiones repetidas (caso A: el formulario pedía precio dos veces al abrirse; la cabecera se pedía entera una segunda
  vez para rellenar submenús que el menú no tenía).

### Módulos del tema base
- Decenas de módulos encadenados que se descargan antes del pintado (caso A: ~50 de Horizon). Es lo que PageSpeed lista
  como «árbol de dependencia de red».

### Cosas que Shopify carga según cómo esté configurada la tienda
Parecen «de Shopify», pero el tema decide si llegan:
- **Precarga del checkout** tras cada página (~150 archivos, ~930 KB; caso B: el 42 % de lo que descargaba un visitante
  nuevo). Solo sirve si se paga por el checkout de Shopify.
- **Shop Pay / «Iniciar sesión con Shop»**: sincronización del carrito, precarga y preconexión a shop.app (caso A: 20
  peticiones de prioridad alta por página), `shopify_pay/storefront.js` (pregunta a shop.app en cada página y deja una
  cookie de terceros).
- **Un botón de cuenta oculto con CSS pero renderizado** seguía cargando su componente (caso A: 39 peticiones, 58 KB).
- Shopify cambia lo que inyecta sin avisar (caso B: apareció un módulo nuevo de 17 peticiones en parte de las visitas).
  Vuelve a mirar la cascada en cada pasada.

### Lo que Shopify pone y el tema no alcanza
Lista y explicación en `tecnicas.md`, apartado C. En las dos tiendas era la mayor parte del bloqueo (TBT) que quedaba
al terminar.

### Apps y píxeles
- Antes de opinar, averigua **qué integración carga cada píxel** y cuándo. En estas tiendas el píxel de Meta lo carga
  la app oficial de Shopify y solo tras aceptar las cookies; antes de aceptar no hay ni una petición a Meta.
- En estas dos tiendas casi no había apps de terceros en el escaparate, así que no hay experiencia medida de «quitar
  una app». El procedimiento sería el mismo que con cualquier recurso: medir con y sin ella sobre la grabación y
  confirmar con el dueño que no afecta a ventas, consentimiento, soporte o medición antes de proponer nada.

### Procesador ocupado con la página quieta
- Animaciones en bucle que obligan a repintar en el hilo principal (caso B: el pulso de un botón flotante animando
  `box-shadow`: 4,7 s ocupados de cada 7; pausar el resto de animaciones no cambiaba nada).
- La página entera recalculándose varias veces durante la carga porque todas las secciones se maquetan de golpe.
- Contadores y cuentas atrás animados.
- Mídelo pausando animaciones de una en una: normalmente hay una culpable, no «las animaciones».

### Maquetación forzada («redistribución forzada»)
- Scripts que leen medidas (`offsetHeight`, `offsetTop`, `clientWidth`) mientras se lee el HTML o nada más arrancar:
  obligan a maquetar la página entera en ese momento. Casos: ajuste de texto de una píldora, altura de la cabecera,
  altura de la barra fija, deslizadores medidos todos al inicio (~130 ms), paginación de reseñas.
- PageSpeed da línea y columna del documento (por ejemplo `/products/x:4176:52`): búscalas en el HTML **renderizado**,
  no en el archivo Liquid.

## 3. De un aviso de PageSpeed a su causa

| Aviso | Qué resultó ser | Qué se hizo |
| --- | --- | --- |
| Solicitudes que bloquean el renderizado | Hojas del tema (necesarias), una hoja de componente suelta, y dos hojas que añade Shopify | La de componente, en línea dentro de su componente. Las del tema se quedan. Las de Shopify no se alcanzan |
| Árbol de dependencia de red | Cadena de módulos del tema base y de scripts de Shopify | Módulos del tema aplazados hasta después de pintar. Los de Shopify se quedan |
| Redistribución forzada | Scripts propios en línea midiendo durante la lectura del HTML; uno de Shopify (`perf-kit`) | Los propios pasan a medir con `ResizeObserver` o al acercarse a la pantalla. El de Shopify se queda |
| Mejorar la entrega de imágenes | `sizes`/`srcset` poco finos, miniaturas sobradas, logo sin comprimir | `sizes` reales, escalones de ~60 px, calidad de la CDN. El logo exige reexportarlo (dueño) |
| Usa tiempos de vida de caché eficientes | Una hoja de Shopify con caché de 5 minutos | Nada: no depende del tema |
| Reduce el CSS sin usar | Una sola hoja para todas las páginas (se guarda en caché para toda la visita) y la hoja compilada de Shopify | Nada: partirla cambia el orden de las reglas y no mueve la nota |
| Minimiza el trabajo del hilo principal | Scripts de Shopify (píxeles, analítica, banner) más los módulos del tema | Lo propio se aplaza; lo de Shopify es decisión del dueño |
| LCP: retraso de renderizado del elemento | O el orden del HTML y la decodificación de la foto, o el tropiezo del navegador de pruebas (~1.060–1.100 ms exactos) | Lo primero se arregla; lo segundo no es de la tienda (`medicion.md`) |
| Imágenes sin `width` y `height` | Fotos insertadas por un script (reseñas) | Añadir los atributos |
| ARIA no permitido / prohibido | `aria-selected` fuera de pestañas; `aria-label` en un `div` o `span` sin rol | `role="tab"` dentro de `role="tablist"`; `role="img"` en estrellas; `role="button"` + `tabindex` + teclado en controles |
| Faltan hijos o padres ARIA obligatorios | Tabla hecha con `div`: cabeceras fuera de una fila | Envolver en `role="row"` |
| Imágenes sin `alt` | `image_tag` no escribe el atributo si recibe `nil` | Texto de reserva (título de la sección) o `alt=""` si es decorativa |
| Encabezados fuera de orden | Un `h3` sin `h2` antes | Cambiar la etiqueta **y fijar los estilos** que cambian con ella |
| Zonas táctiles pequeñas | Puntos del carrusel | Botón de 24 × 24 px con el punto del mismo tamaño dentro |
| Contraste insuficiente | Precios tachados y textos pequeños claros | Subir a 4,5:1 midiendo el color real (con opacidad y fondo). Cambia colores: decisión de diseño |
| Prácticas recomendadas: cookies de terceros / errores de consola | Shop Pay; scripts de Shopify | Lo primero, inerte si no hay pago con tarjeta. Lo segundo no depende del tema |

**Contraste: cuenta con el auditor, no a ojo.** La nota de accesibilidad no sube a 100 mientras quede un solo texto
por debajo de 4,5:1, y la lista que enseña PageSpeed (o la que pega el dueño) puede ser solo una parte. En el caso B
se le dijo al dueño «son cinco textos» y Lighthouse en local listaba 27, en seis sitios distintos (ajustes de color
de la plantilla, estilos de la ficha, reseñas y pie). Antes de dar un alcance: `herramientas/pagespeed/a11y_contrast.sh`
sobre la página publicada. Y ojo con los fondos translúcidos (una tarjeta «elegida» con fondo al 49 %): el contraste
real se calcula sobre el color compuesto, y ahí un texto también translúcido puede no llegar nunca a 4,5:1; hizo falta
un tono sólido. Los colores que son ajustes del tema se cambian en la plantilla publicada, no en el código.

## 4. De quién es cada cosa

Clasifica cada hallazgo antes de proponer nada:

1. **Del tema** (Liquid, CSS, JS propios o del tema base): se puede cambiar. Es donde hay que mirar primero.
2. **De Shopify, pero condicionado por la tienda** (precarga del checkout, Shop Pay, cuenta): se puede dejar inerte
   con una condición ligada a un ajuste.
3. **De Shopify, fijo**: se lista en el informe como «no depende del tema» y no se le dedican horas.
4. **Del contenido** (fotos, vídeos, secciones vacías): se explica al dueño qué subir distinto, o se hace que el tema
   lo aguante (versión ligera del vídeo, uno cada vez). La optimización debe seguir valiendo cuando cambie el
   contenido.
5. **De la medición** (tropiezo del navegador de pruebas, vista previa, reparto de línea): no es un problema de la
   tienda; se explica y se aparta.
6. **Del negocio** (consentimiento, anuncios, bots): no es rendimiento. Se dice claro para que no se persiga con
   cambios de tema.

## 5. Estimar antes de programar

Para cada candidato, antes de tocar el tema:

- Edita el HTML de la grabación y mide la diferencia (`herramientas/reproduccion/exp.js`).
- O simula con los artefactos de Lighthouse qué pasa al quitar un recurso (`herramientas/pagespeed/whatif.mjs`).
- O, en una traza, pausa o bloquea una sola cosa y compara.

Si la ganancia no supera la variación entre pasadas, el candidato pasa a «probado y descartado» con su cifra, y se
cuenta en el informe: saber qué **no** era la causa también es resultado.
