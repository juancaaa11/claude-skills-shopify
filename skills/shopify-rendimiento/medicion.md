# Medir: línea base, comparación y lectura de PageSpeed

Todo esto es **Método**, salvo donde se indica un caso. Las cifras entre paréntesis son del caso A o del caso B (ver `casos/`) y sirven de ejemplo de magnitud, no de referencia para otra tienda.

## 1. Qué se mide

Además de las métricas de siempre (primer contenido FCP, mayor elemento LCP, bloqueo TBT, saltos CLS, índice de
velocidad, peso y número de peticiones), mide lo que el cliente nota y ninguna nota recoge:

- **Qué elemento es el LCP** y a qué hora se pide, llega y se pinta. Sin esto no hay diagnóstico.
- **Cuándo responde el botón o la barra de compra** y **cuándo está listo el formulario de pedido** (marcas propias
  puestas desde el script de medición).
- **Toque temprano:** tocar «Comprar» en cuanto se ve, antes de que arranquen los scripts, y cronometrar qué pasa.
- **Cuándo aparece el banner de cookies** (de él depende que el píxel empiece a contar).
- **Trabajo del procesador durante la carga y con la página quieta** (ventana de reposo, por ejemplo de los 3 a los
  10 s o de los 8 a los 15 s). En un móvil modesto, una página que no descansa va a tirones al deslizar.
- **Qué se ve a los 1, 2, 3, 5 y 8 segundos** (fotogramas de la traza).
- **Peso tras recorrer la página entera**, no solo al cargar: ahí salen vídeos y fotos que se piden de más.

El INP (respuesta a la interacción) no se puede medir en laboratorio: solo existe con usuarios reales. En laboratorio
se aproxima con el TBT, las tareas largas y las marcas de «responde» y «toque temprano».

## 2. Perfiles de laboratorio

Los que se usaron, con Chrome de escritorio emulando un móvil (390 × 780, densidad 2):

| Perfil | Red | Procesador | Para qué |
| --- | --- | --- | --- |
| Móvil lento | «4G lenta» de Lighthouse aplicada: 562,5 ms de latencia por petición, 1.474 Kbps de bajada, 675 Kbps de subida | ×4 | El peor caso razonable; donde se ven las descargas que compiten |
| 4G rápida | 150 ms, 9 Mbps de bajada, 3 Mbps de subida | ×4 | Lo más parecido a lo que dieron los usuarios reales (caso B: foto a ~1,2 s en laboratorio frente a 1,4 s de p75 real) |
| Procesador lento | Sin límite | ×6 | Aísla el coste de scripts y maquetación; así trabaja la máquina de PageSpeed |
| Escritorio | Sin límite | ×1 | Control |

Son perfiles sintéticos: no equivalen a ningún modelo de teléfono ni reproducen poca memoria. Dilo en el informe.

## 3. Cuántas pasadas y qué es ruido

- Páginas principales: 3 a 5 pasadas por perfil en móvil y 2 en escritorio; se informa la **mediana y el rango**.
  Páginas secundarias: 2 en móvil lento y 1 en escritorio.
- Variación vista entre pasadas idénticas (caso A, reproducción local): la foto principal en móvil lento, el peso y las
  peticiones repiten con ±50 ms; el TBT y el «formulario listo» de los perfiles limitados por procesador varían
  ±100–300 ms. Con procesador ×6 el TBT llegó a dar 736 ms con rango 295–978 (caso B).
- Una diferencia que cabe en esa variación no es una diferencia.
- No lances nada pesado en el ordenador mientras mide, ni dos mediciones a la vez si lo que importa es el procesador.
- El índice de velocidad con una sola pasada no es fiable cuando hay animaciones en bucle (depende de en qué punto
  queda la animación en el último fotograma).

## 4. Dos formas de limitar la red, dos sesgos

- **Límite aplicado** (el navegador va lento de verdad; Lighthouse con `--throttling-method=devtools`, o la
  emulación de red de Chrome): reparte la línea a partes iguales entre todo lo que se descarga a la vez, **sin
  respetar prioridades**. Exagera lo que cuesta cada descarga simultánea (caso B: ~0,6 s del LCP eran ese artefacto). El
  orden de magnitud vale; la cifra exacta en un teléfono será menor.
- **Límite simulado** (PageSpeed y Lighthouse por defecto): carga sin límites y luego calcula. Respeta prioridades,
  pero los valores «observados» del informe van sin límite, y el resultado es una estimación (apartado 7).

Cuando un resultado dependa del método, mídelo de las dos formas y dilo.

## 5. Grabar y reproducir

Las cargas reales contra la tienda varían demasiado (caso A: la misma página publicada dio 3,0 s y 7,7 s de foto principal)
y la tienda limita las visitas seguidas (HTTP 429; en el caso B saltó además la pantalla contra bots tras unas seis
recargas por minuto). Solución que funcionó:

1. **Grabar** una visita real de cada página (una en móvil y otra en escritorio), sin límites, guardando cada
   respuesta.
2. **Reproducirla** desde el propio ordenador: un servidor local responde con lo grabado y Chrome se lanza de modo que
   todos los dominios caigan ahí. Se aplican los perfiles y se hacen las pasadas que hagan falta. No genera tráfico y
   repite casi al milisegundo.
3. **Probar ideas sobre la grabación** antes de programarlas: se edita el HTML grabado («¿y si las fotos 2–5 fueran
   diferidas?») y se mide la diferencia. Así se supo qué merecía la pena y qué no.
4. Publicar el cambio en el tema de pruebas, volver a grabar y comparar.

Avisos que hay que poner en el informe:

- La reproducción no incluye el adelanto de hojas de estilo de Shopify («Early Hints») ni el banner de cookies.
- Reparte la conexión por igual (mismo sesgo del límite aplicado).
- La vista previa de un tema sin publicar recibe la hoja de estilos completa y un script de recarga: en la
  reproducción hay que igualarla a lo que recibe un tema publicado.

Los scripts están en `herramientas/reproduccion/`.

## 6. Vista previa contra publicado

- La vista previa (`?preview_theme_id=`) añade una redirección y la barra de Shopify, y sirve la hoja compilada entera
  en vez del recorte por página (caso A: 43 KB frente a 31; empieza a pintar más tarde; en PageSpeed, 3–4 puntos menos que
  el publicado; caso B: ~1,5 s más tarde con límite aplicado).
- Regla: **vista previa en los dos lados** (el tema de pruebas contra una copia sin cambios, o contra el propio tema
  publicado abierto en vista previa), o publicado contra publicado. Solo vale la diferencia entre columnas.
- **Los ajustes del tema no viajan con el código.** En el caso B el tema de pruebas conservaba una precarga de fuente
  que el dueño ya había quitado en el publicado y salía 1,2 s peor sin tener culpa. Antes de comparar, iguala ajustes
  y contenido (mismos vídeos, mismas fotos).
- **Early Hints:** Shopify adelanta hojas de estilo según lo que recuerda de cada dirección. Unas pasadas llegan con
  ellas adelantadas y otras no: anótalo y compara solo pasadas iguales. Ojo: abrir vistas previas puede enseñar a
  Shopify a adelantar las hojas del tema de pruebas a los visitantes reales (caso A: descargaban 5 archivos inútiles y
  pintaban ~1 s más tarde). Abre las vistas previas con `&pb=0` y las menos veces posible, y al terminar comprueba que
  la página publicada no pide nada del tema de pruebas.

## 7. PageSpeed: qué calcula y por qué baila

- PageSpeed no mide la carga: carga la página sin límites y **simula** un móvil lento. En esa simulación «cobra» todo
  lo que terminó de descargarse antes de que se pintara el mayor elemento. Por eso pesan más «menos peticiones antes
  del LCP» y «pintar pronto» que los bytes totales.
- Pesos de la nota de rendimiento: TBT 30 %, LCP 25 %, CLS 25 %, FCP 10 %, índice de velocidad 10 %.
- No ve lo que solo se muestra en una región. En las dos tiendas PageSpeed medía desde fuera de España y el banner de
  cookies, que solo sale allí, no aparecía en su informe.
- **El «tropiezo» del navegador de pruebas.** En muchas pasadas, tras navegar, el Chrome sin pantalla que usa
  PageSpeed deja a la página un segundo sin turnos de dibujo (decisión `ThrottleUndrawnFrames` de Chromium). No es de
  la tienda y no se arregla desde el tema. Cómo reconocerlo en el informe: «retraso de renderizado del elemento» de
  ~1.060–1.100 ms (o ~2.100) en el desglose del LCP, y una tira de fotogramas que pasa de blanco a la página completa
  de golpe. En local: primer pintado observado por encima de ~900 ms cuando lo normal son 300–450.
  (caso A, 8 de octubre: 7 de 9 pasadas oficiales lo tuvieron; nota 96 sin tropiezo, 83–87 con él. Caso B: 81 → 63.)
- Lo que sí depende del tema es **cuánto cuesta** el tropiezo: al retrasarse el pintado un segundo, la simulación
  cuenta todo lo descargado entretanto. Cuanto menos viaje antes del LCP, menos quita (caso A, misma tarde: 96 → 83–87
  con la carga aplazada; 93 → 77 con la carga antigua).
- **Cómo medir con PageSpeed sin engañarse:** 3 a 5 pasadas; separa las que tienen la firma del tropiezo de las que
  no; compara solo dentro del mismo grupo; informa de las dos notas. Nunca prometas una nota mínima en todas las
  pasadas.
- La API anónima de PageSpeed suele tener la cuota agotada: se usa la web (pagespeed.web.dev).
- Lighthouse en local con la misma configuración sirve para iterar y para guardar artefactos, pero su nota **no es
  comparable** con la oficial (otra máquina). En una máquina rápida algunas mejoras no mueven la nota local aunque
  sean reales.
- **Simular antes de programar:** con los artefactos de una pasada guardada se puede aplicar el simulador de
  Lighthouse quitando recursos y ver cuánto bajarían FCP y LCP (caso A: «sin los módulos del tema, LCP 3,0 → 2,4 s; sin el
  script de Shop Pay, −0,15 s»). Scripts en `herramientas/pagespeed/`.
- PageSpeed incluye accesibilidad, prácticas recomendadas y SEO. Sus avisos se resuelven uno a uno (`diagnostico.md`),
  pero cualquier cambio de etiqueta (un `h3` que pasa a `h2`) puede cambiar el aspecto: compara estilos calculados.

## 8. Datos de usuarios reales

- Shopify guarda LCP, INP y CLS de visitantes reales. Se consultó con ShopifyQL desde el administrador, en el
  navegador del dueño con su sesión (el token de la CLI de temas no tiene acceso a analítica):
  `FROM web_performance SHOW lcp_p75_ms, inp_p75_ms GROUP BY page_type, device_type`.
- Límites: solo cuenta a quien llegó a medirse (quien se fue antes del primer pintado no aparece); la muestra de una
  tienda pequeña es corta; un día bueno no confirma nada (caso B: el INP de la ficha en móvil pasó de 282–512 ms a 48 ms
  el primer día completo tras una ronda; se anotó como «un solo día»). Para juzgar un cambio hacen falta semanas y
  periodos equivalentes.
- Sirve para poner el laboratorio en su sitio: en el caso B el laboratorio «lento» daba 5 s de LCP y los visitantes
  reales tenían 1,4 s de p75. El laboratorio lento es una lupa, no un retrato.

## 9. Datos de negocio: clics, llegadas y sesiones

- Clics en el enlace (Meta), visitas a la página de destino (Meta, necesita píxel), sesiones (Shopify) y aperturas
  del formulario (servidor de pedidos) **no son la misma cosa** y no se comparan como si lo fueran.
- Las sesiones de Shopify y las visitas a la página de destino de Meta solo se cuentan si el visitante acepta las
  cookies. Sesiones entre clics mide, sobre todo, aceptación de cookies (caso B: la página de anuncio ligera tenía 88 %
  de visitas de destino sobre clics y 23 % de sesiones; la ficha, 43 % y 52 %: se ordenaban al revés).
- Busca una señal que no dependa de cookies: en estas tiendas, las aperturas del formulario registradas por el
  servidor de pedidos.
- Distingue «la visita no llegó a cargar» de «cargó pero no quedó medida». No asignes un porcentaje del hueco a la
  velocidad sin una prueba que lo aísle. En el caso B la ficha no pesaba más ni pintaba más tarde que la página ligera:
  la carga no explicaba la diferencia.
- Descarta lo que no es cliente: sesiones de otros países en campañas de un solo país, visitas a `/password`,
  rastreadores de revisión de anuncios.
- Revisa el camino antes de la página: anuncios que apuntan a `http://` o a `www.` añaden una redirección (caso B: ~0,6 s
  y ~0,7 s con límite aplicado).

## 10. No contaminar y no molestar

- En toda medición automática se responden en local: píxeles (Meta, Google, TikTok…), analítica de Shopify, escrituras
  en el carrito y la API de pedidos. La lista de patrones usada está en `herramientas/reproduccion/lib.js`.
- Si un intento de pedido llega a salir, que el arnés lo responda con error y lo deje anotado.
- Espacia las visitas reales (al grabar se dejaron 12 s entre cargas) y cuenta cuántas llevas. Si aparece la pantalla contra bots
  de Shopify, para: no se intenta superar.
- Capturas de página entera con secciones en `content-visibility` salen en blanco donde no se ha pintado: captura
  pantalla a pantalla.
- En un panel de navegador oculto, `IntersectionObserver` y `requestAnimationFrame` pueden no ejecutarse: no saques
  conclusiones de ahí.

## 11. Presupuestos

Tras una ronda, fija límites que avisen de una regresión (**Caso B**, como ejemplo de formato): peso
transferido de la ficha ≤ 1,35 MB; ≤ 140 peticiones; hilo principal con procesador ×4 ≤ 4,0 s; reposo (3–10 s) ≤ 0,5 s;
cero peticiones del checkout de Shopify con la tarjeta desactivada; precarga de la foto principal en los primeros 4 KB
del HTML. Superarlos obliga a revisar antes de publicar.

## 12. Lo que se declara siempre como no verificado

Salvo que de verdad se haya probado: teléfono real, Android antiguo, iPhone y Safari, navegadores integrados de
Instagram y Facebook, móviles con poca memoria, el banner de cookies en vista previa (Shopify no lo muestra ahí), y
los píxeles y la analítica reales cuando en las pruebas se respondieron en local.
