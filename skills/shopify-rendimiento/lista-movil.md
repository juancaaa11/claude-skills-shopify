# Lista de comprobación para móvil

Se recorre en el tema de pruebas antes de publicar y otra vez en el publicado. **Método.** Lo que no puedas comprobar
(por ejemplo, un teléfono real) va al informe como «sin verificar», no se da por bueno.

## Condiciones

- [ ] Anchos de 360 y 390 px (y uno de escritorio, 1.440, para no romper lo otro).
- [ ] Un perfil lento (4G lenta y procesador ×4) además del normal: muchos fallos solo salen cuando los scripts llegan
      tarde.
- [ ] Primera visita (caché vacía) y segunda visita.
- [ ] Con el banner de cookies sin responder, rechazado y aceptado. En vista previa Shopify no lo muestra: eso se mira
      en el tema publicado.

## Primera pantalla

- [ ] La foto principal se ve entera, sin recorte ni recuadro vacío prolongado, y se descarga **una** vez.
- [ ] Título, valoración, precio y botón de compra, en su sitio; el texto no cambia de renglones cuando llega la
      fuente (o el salto está medido y avisado).
- [ ] La barra o el botón de compra **responde en cuanto se ve**. Tócalo nada más pintarse, con el perfil lento.
- [ ] Nada que arranque invisible y se quede así (animaciones de entrada con `opacity: 0`).
- [ ] El banner de cookies no tapa el botón de compra ni tarda más que antes en salir.

## Al deslizar

- [ ] Sin desplazamiento horizontal: el ancho del documento es el de la pantalla a 360 y a 390 px.
- [ ] Galería: deslizar antes de que acabe la carga trae la foto siguiente; puntos y miniaturas responden; el zoom
      abre; las miniaturas son imágenes, no texto.
- [ ] Las imágenes diferidas se piden con antelación suficiente: no se ven huecos al bajar a ritmo normal.
- [ ] Vídeos: portada visible, no en gris; no se descarga el archivo sin reproducir; reproducen al pulsar; uno cada
      vez.
- [ ] Deslizadores, pestañas, acordeones de preguntas y paginación de reseñas funcionan aunque su sección se haya
      preparado al acercarse.
- [ ] Efectos ligados al scroll: igual de suaves que antes y también en móvil.
- [ ] La barra fija de compra aparece y desaparece donde debe y no tapa contenido ni el botón de WhatsApp.
- [ ] Zonas táctiles de al menos 24 × 24 px.
- [ ] Con la página quieta, el procesador descansa (traza de la ventana de reposo).

## Menú y navegación

- [ ] El menú móvil abre al primer toque, también si se toca antes de que lleguen los módulos del tema.
- [ ] Los enlaces del menú, del pie y de las tarjetas llevan a donde deben.

## Paridad con lo que había

- [ ] Misma altura total de página y mismas medidas de los elementos principales que en el tema publicado (comparar
      estilos calculados o capturas pantalla a pantalla con las animaciones congeladas; no vale una captura de página
      entera si hay `content-visibility`).
- [ ] Las diferencias que queden están en el informe, aunque sean de un píxel.

## Sin verificar salvo que se haya hecho de verdad

- [ ] Teléfono real de gama baja y Android antiguo.
- [ ] iPhone y Safari.
- [ ] Navegador integrado de Instagram y de Facebook (en los dos casos, por ahí llegaban los compradores).
- [ ] Móvil con poca memoria.

Prueba manual que se le pide al dueño cuando haga falta (en su móvil, antes de publicar o justo después): abrir un
anuncio desde dentro de Instagram o Facebook, tocar el botón de compra en cuanto se vea, deslizar la galería, bajar
hasta el pie.
