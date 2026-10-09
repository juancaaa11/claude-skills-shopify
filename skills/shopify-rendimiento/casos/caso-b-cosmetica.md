# Caso B: tienda de cosmética con tráfico de anuncios

**Es un ejemplo, no una referencia.** Las cifras son de laboratorio y de usuarios reales de una tienda concreta
(octubre de 2026). En otra tienda se vuelve a medir.

## Ficha

- Tienda de cosmética, abierta y vendiendo, con un tema propio. Un tema publicado y una copia de trabajo sin publicar.
- Los anuncios llevan a la ficha de producto y, en una campaña aparte, a una página de artículo ligera.
- **Compra:** formulario de pedido propio contra reembolso, pago con tarjeta desactivado. Un selector de packs
  sincroniza el carrito de Shopify: el dueño pidió no quitarlo.

## Lo que dijo el dueño sobre su público

Al encargar la optimización indicó que más de la mitad de sus visitantes podía usar dispositivos lentos o de gama baja
y que su público comprador principal tenía entre 40 y 65 años. **No hubo ninguna medición de dispositivos que lo
confirmara.** Sirvió como motivo para priorizar móviles modestos; no es una regla para otras tiendas.

Lo que sí estaba medido o registrado:

- Visitantes reales (informe de rendimiento web de Shopify, p75, 7 días): ficha en móvil LCP 1,40 s e INP 344 ms;
  página en móvil 1,20 s y 70 ms; ficha en escritorio 0,53 s y 80 ms. Tienda en 30 días: LCP 1,5 s, INP 264 ms
  («moderado»), CLS 0,01.
- Todos los pedidos reales de tres días seguidos llegaron desde el navegador integrado de una red social, la mitad
  desde iPhone y la mitad desde Android (registros del servidor de pedidos).

## Objetivos que fijó

- Primero: PageSpeed móvil de la ficha ≥ 80 sin ningún cambio de diseño. Resultado: 66 → 85 (3 de 3 pasadas);
  ordenador 99.
- Después: que la ficha cargue mucho más rápido en móviles modestos, sin cambiar la identidad visual, sin quitar ni
  retrasar la medición, sin tocar formulario ni elementos comerciales sin consultarlo, y trabajando en copia. De viva
  voz añadió que aceptaba sacrificar alguna animación. Solo se dejó sin animación un contador; las decorativas se
  quedaron porque, arreglado el reposo, quitarlas ya no aportaba nada medible.
- Su preocupación de fondo: la diferencia entre clics del anuncio y visitas.

## Rondas y cifras (laboratorio)

| Ronda | Qué se hizo | Resultado |
| --- | --- | --- |
| 1 | Fuentes precargadas, fuente propia en lugar de Google Fonts, módulo de Shop tras una puerta | PageSpeed móvil 66 → 85 |
| 2 | Pulso de un botón flotante sin `box-shadow`; precarga del checkout inerte; precarga de la foto y del script del formulario; toque temprano; resto de la galería al primer gesto; banner de cookies precargado | Hilo principal 8.626 → 3.454 ms (−60 %, ×4); 157 peticiones / 2.025 KB → 135 / 1.299 KB; reposo 5.190 → 379 ms; banner 6,1 → 4,6 s. **LCP sin cambio** (5,68 → 5,71 s) |
| 3 | Barra de compra que responde al verse; scripts propios antes; vídeos ligeros y de uno en uno; secciones de abajo asentadas en reposo; foto principal primero; fuentes recortadas | Barra 5,20 → 3,13 s; formulario 5,20 → 3,37 s; LCP 5,66 → 4,97 s; reposo 3,74 → 0,25 s. TBT sin mejora |
| 4 | Fuentes después de la foto en conexiones lentas; tope 2x | LCP 5,29 → 4,34 s; banner 5,07 → 4,16 s; TBT 560 → 388 ms. CLS 0,001 → 0,043 |
| 5 | Formulario cerrado al final del `<body>`; estilos partidos; `decoding="sync"`; miniaturas a su tamaño | Con procesador ×6: primer pintado 0,96 → 0,77 s; foto pintada 1,67 → 1,08 s. Con 4G lenta, igual |
| 6 | Avisos de PageSpeed: encabezados en orden, un control accesible, fotos de reseñas con tamaño | PageSpeed móvil 92 (FCP 2,2 s · LCP 3,0 s · TBT 0 · CLS 0,002); accesibilidad 97 |
| 7 | Contraste: 27 textos por debajo de 4,5:1 (no los cinco que se habían contado). Cada uno conserva su tono y se oscurece o aclara lo justo | Accesibilidad 100 en PageSpeed oficial. Rendimiento 90 y 89 en dos pasadas: son cambios de color, no de carga |

Con 4G rápida la foto estaba en ~1,2 s, coherente con los 1,4 s de los visitantes reales: los 5 s del perfil lento
son el peor caso de laboratorio, no lo habitual.

## Clics frente a llegadas (una semana)

| Destino del anuncio | Visitas a la página de destino sobre clics | Sesiones sobre clics |
| --- | --- | --- |
| Ficha de producto | 43 % | 52 % |
| Página ligera | 88 % | 23 % |

Las dos columnas ordenan las páginas al revés: ambas miden sobre todo quién aceptó las cookies. La ficha no pesaba más
ni empezaba a pintar más tarde que la página ligera, y antes de deslizar no pedía ningún vídeo. La señal que no
dependía de las cookies (aperturas del formulario registradas por el servidor de pedidos) era casi cuatro veces mayor
que los «pagos iniciados» del píxel. No se atribuyó ningún porcentaje del hueco a la velocidad.

Los anuncios apuntaban a `http://` (una redirección por clic).

## Reglas que salieron de aquí

- Nunca subir el `settings_data.json` local entero sobre el tema publicado. El dueño edita a menudo la plantilla de
  producto: traer la versión publicada antes de tocarla.
- La pantalla contra bots de Shopify saltó tras ~6 recargas por minuto: no se intenta superar.
- El token de la CLI de temas no ve pedidos ni analítica: los datos reales se leyeron en el administrador con el
  navegador del dueño.
- Presupuestos fijados tras la segunda ronda: en `../medicion.md`, apartado 11.

## Decisiones que quedaron para el dueño

- Animaciones visibles de la primera pantalla y posición del nombre del producto en móvil.
- Deshacer «fuentes después de la foto» si molesta el cambio de letra tardío en conexiones lentas.
- Cada tono de contraste se puede deshacer por separado si no gusta.
