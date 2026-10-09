---
name: shopify-rendimiento
description: Optimiza la velocidad de una tienda Shopify con método, sin romper el diseño, la compra ni la medición. Úsala cuando el usuario diga que su tienda o una página (sobre todo la ficha de producto) carga lenta, pegue una nota o una lista de errores de PageSpeed o Lighthouse, pida subir la nota en móvil, hable de Core Web Vitals (LCP, INP, CLS, TBT), pida «optimizar la web», aligerar o limpiar el tema (Liquid, CSS, JavaScript, imágenes, vídeos, fuentes, animaciones, recursos que bloquean el renderizado), revisar qué frenan las apps, los píxeles o los scripts de seguimiento, o comparar el antes y el después de un cambio de rendimiento. Para publicar y comprobar que la tienda sigue funcionando se apoya en la skill shopify-cambios-en-vivo.
---

# Rendimiento de tiendas Shopify

Método para diagnosticar y mejorar la carga de una tienda Shopify que ya está diseñada y, normalmente, vendiendo.
Sale del trabajo hecho en dos tiendas reales (octubre de 2026). Todo lo que dice se hizo o se midió allí; lo que no se
llegó a comprobar está aparte, marcado como hipótesis.

## Cómo está clasificado lo que vas a leer

| Marca | Qué es | Cómo usarlo |
| --- | --- | --- |
| **Método** | Forma de trabajar que vale para cualquier tienda | Aplícalo siempre |
| **Criterio de partida** | Cómo quería trabajar el dueño de aquellas tiendas. Son buenos valores por defecto | Aplícalo salvo que el dueño de esta tienda diga otra cosa; ante la duda, pregúntaselo |
| **Caso** | Cifras y decisiones de una tienda concreta (`casos/`) | Como ejemplo de qué buscar y qué magnitud esperar, nunca como dato de otra tienda |
| **Hipótesis** | Idea que no se llegó a comprobar (`hipotesis.md`) | Nunca la presentes como hecho; si la usas, mídela primero |

Una cifra de un caso no es una promesa para otra tienda: «−0,8 s por aplazar las portadas de vídeo» pasó en una ficha
concreta, con sus vídeos. En otra tienda se vuelve a medir.

## Criterios de partida

Salvo que el dueño de la tienda indique otra cosa:

- **Rendimiento real antes que nota.** Lo que importa es que la página cargue rápido de verdad, sobre todo en móviles
  modestos o lentos. Muchos dueños miden el éxito con la nota móvil de PageSpeed de la ficha de producto y la vuelven a
  pasar ellos: hay que atender las dos cosas y explicar cuándo no coinciden.
- **No se toca el diseño ni la identidad visual sin que lo pidan.** Estructura, contenido, ofertas, precios, colores y
  flujo de compra se conservan.
- **Animaciones:** si reducir o quitar una puede ayudar mucho, se mide o se explica el impacto y se propone **antes**
  de alterar una parte visual importante. Arreglar cómo está hecha una animación sin que cambie lo que se ve no
  necesita permiso.
- **Preguntar poco y bien.** Si una decisión relevante depende del dueño, se le pregunta de forma concreta (qué gana,
  qué pierde, qué recomiendas). Si no, se avanza con autonomía, se mide y se deja un resultado que pueda revisar.
  Cuando avisa de que no va a estar, las dudas menores se resuelven con la opción más prudente y se anota el criterio.
- **Nada de cambios a ciegas:** identificar, priorizar por impacto y riesgo, verificar.
- **No se toca ni se retrasa la medición** (píxeles, API de conversiones, analítica, banner de cookies) sin que el
  dueño lo decida.
- **La ficha de producto es lo primero**; después inicio y el resto.
- **Sin promesas que no se pueden cumplir:** no decir «optimizada al 100 %» por una nota. Si el dueño pide una
  confirmación rotunda al cerrar, se le da lo que está comprobado y, aparte, lo que no se pudo verificar.

Dato de un caso, no regla general (**Caso B**): al encargar la optimización, el dueño indicó que más de la mitad de
sus visitantes usaba móviles lentos o de gama baja y que su público comprador principal tenía entre 40 y 65 años. Es lo
que él aportó; no hubo una medición que lo confirmara (ver `casos/caso-b-cosmetica.md`). En otra tienda, pregunta o
mira los datos antes de suponer el mismo público.

## El flujo

No te saltes pasos ni cambies el orden: casi todos los errores de aquellos trabajos vinieron de programar antes de
medir o de dar por buena una sola medición.

### 1. Entender la página y el problema

- Qué página importa y por dónde llega la gente (en los dos casos: ficha de producto, móvil, desde un anuncio y
  dentro del navegador de Instagram o Facebook).
- Qué entiende el dueño por «ir bien»: una nota, que la página se vea antes, que el botón responda, que lleguen más
  visitas, que haya más ventas. Son resultados distintos (ver «Tres clases de datos»).
- Qué no se puede tocar: diseño, flujo de compra, medición, contenido que el dueño cambia desde el editor.
- Cómo compra el cliente. Si el formulario de pedido es propio, **no asumas el checkout estándar de Shopify**: cambia
  qué scripts sobran, qué eventos existen y qué hay que probar.
- Lee las instrucciones del proyecto (`CLAUDE.md`), sus `docs/` y lo que haya de trabajos anteriores: puede haber
  una pasada previa, con sus herramientas y sus «no tocar».

### 2. Línea base con condiciones comparables

Lee `medicion.md` antes de medir nada. Lo imprescindible:

- Fija los perfiles (móvil lento, 4G rápida, procesador lento sin límite de red, escritorio) y **no los cambies** entre
  el antes y el después.
- Varias pasadas y mediana con su rango. Una pasada sola no demuestra ni una mejora ni una regresión.
- Compara igual con igual: vista previa contra vista previa, publicado contra publicado, mismas fotos, mismos
  ajustes del tema, mismo día.
- Mide también lo que no sale en ninguna nota: cuándo responde el botón de compra, cuándo está listo el formulario,
  cuánto trabaja el procesador con la página quieta, qué se ve a los 1, 2, 3 y 5 segundos.
- Ningún pedido real y nada enviado a los píxeles: analítica, píxeles y la API de pedidos se responden en local.

### 3. Localizar causas

Lee `diagnostico.md`. Empieza siempre por la misma pregunta: **cuál es el mayor elemento de la primera pantalla (LCP)
y qué se descarga o se ejecuta antes de que se pinte**. No culpes a Shopify por defecto: en los dos casos buena parte
de lo que parecía «de Shopify» era código propio mal colocado, contenido subido por el dueño o algo de Shopify que sí
se podía apagar con una condición. Y no culpes a la velocidad de lo que es otra cosa (el hueco entre clics y sesiones
resultó ser, sobre todo, consentimiento de cookies).

### 4. Priorizar por impacto, esfuerzo y riesgo

Antes de programar, una lista con: problema y evidencia · archivo o elemento responsable · ganancia esperada (mejor
si está **medida** sobre una grabación o simulada, ver `medicion.md`) · confianza · riesgo para diseño, compra y
medición · esfuerzo · cómo se comprobará. Primero lo que adelanta el contenido y la respuesta en móviles lentos.
Separa lo seguro de lo que obliga al dueño a elegir entre velocidad y apariencia; eso último se le pregunta.

Si una idea no da ganancia medible, no se aplica aunque sea «buena práctica» (quitar 17 módulos sin uso del tema base
no movió nada: riesgo sin beneficio).

### 5. Cambios pequeños y reversibles

- Una rama por pasada y un commit por cambio, con el porqué. Cada cambio debe poder deshacerse solo.
- Lo que desactiva algo de Shopify va atado a una condición (por ejemplo, «solo mientras el pago con tarjeta esté
  desactivado») para que vuelva solo si la tienda cambia.
- Deja un interruptor de diagnóstico cuando el cambio sea grande (un parámetro en la URL que carga «como antes»):
  permite comparar en la misma página y en el mismo momento.
- Técnicas que funcionaron, las que no y sus trampas: `tecnicas.md`.

### 6. Comparar antes y después

Mismas condiciones que la línea base, mismas pasadas. Si la diferencia cabe dentro de la variación entre pasadas
iguales, **no hay diferencia**: dilo así. Si una métrica empeora, explícalo o deshaz el cambio. Mide cada cambio por
separado cuando puedas: saber qué aportó cada uno es lo que permite deshacer solo el que moleste.

### 7. Comprobar diseño, compra y medición

Usa la skill `shopify-cambios-en-vivo` (carpeta hermana `../shopify-cambios-en-vivo/`): su `lista-funcional.md` para
comprobar que la tienda sigue funcionando y su `medicion-y-pixeles.md` para la medición. Aquí, además, recorre
`lista-movil.md`. Comprueba por render, no leyendo el código: la regresión que llegó a una tienda publicada
(miniaturas de la galería mostrando el HTML como texto) venía de un cambio de rendimiento de una línea.

### 8. Informar

En el idioma del dueño, en frases completas y sin jerga, con este contenido:

1. Tabla antes/después con las condiciones de prueba y cuántas pasadas.
2. Causas comprobadas (y lo que se descartó como causa).
3. Cambios hechos, con archivos y motivo, y la ganancia de cada uno si se midió por separado.
4. Diferencias visibles, aunque sean mínimas o solo durante la carga.
5. Lo que seguirá apareciendo en PageSpeed y no depende del tema.
6. Decisiones que quedan para el dueño, cada una con lo que gana y lo que pierde.
7. Lo que no se pudo verificar (casi siempre: teléfono real, iPhone, navegadores de Instagram y Facebook).
8. Cómo revisarlo desde su móvil y cómo deshacerlo.

Encabeza las tablas con qué clase de cifra es: «laboratorio, Chrome de escritorio emulando un móvil; no es un teléfono
real».

## Tres clases de datos que no se mezclan

| Clase | De dónde sale | Para qué sirve | Para qué no |
| --- | --- | --- | --- |
| **Laboratorio** | PageSpeed, Lighthouse, trazas, reproducción local | Comparar antes y después, encontrar la causa | Decir cuánto tarda en el teléfono de un cliente |
| **Usuarios reales** | Informe de rendimiento web de Shopify (LCP, INP y CLS en p75 por tipo de página y dispositivo) | Saber cómo le va a quien llega de verdad | Juzgar un cambio de ayer (muestra pequeña); no cuenta a quien se fue antes de pintar |
| **Negocio** | Clics del anuncio, visitas a la página de destino, sesiones, aperturas del formulario, pedidos | Decidir si hay un problema que merezca trabajo | Atribuirlo a la velocidad sin más prueba |

Una página más rápida, una medición más completa y más ventas son tres resultados distintos. Se informan por separado.

## Reglas que costaron caras

1. **Una pasada miente.** La nota móvil de PageSpeed bailó entre ~96 y ~85 en la misma página sin cambiar nada, por un
   freno del navegador de pruebas (`medicion.md`). Las cargas reales de una misma página dieron 3,0 s y 7,7 s.
2. **Vista previa y publicado no se comparan entre sí.** La vista previa añade una redirección y sirve otros estilos.
3. **Visible no es utilizable.** La barra de compra se veía a los 1,4 s y no respondía hasta los 4,1 s; un toque
   temprano se perdía para siempre. Eso no sale en la nota y es lo que más nota el cliente.
4. **El procesador en reposo también cuenta.** Una sola animación sobre `box-shadow` tenía el procesador al ~75 % con
   la página quieta.
5. **Antes de pintarse la foto principal solo deberían viajar el HTML, los estilos y esa foto.** Todo lo demás compite
   con ella en una conexión lenta.
6. **Una precarga que no coincide a la letra con su `<img>` descarga la foto dos veces.**
7. **Reordenar o partir hojas de estilo cambia qué regla gana.** Rompió una animación. Borrar plantillas «sin uso»
   dejó una URL del sitemap en 404.
8. **Poner los estilos base en línea empeoró** (nota simulada 92 → 72): Shopify ya los adelanta.
9. **Lo que Shopify inyecta después de renderizar el tema no se alcanza desde el tema.** No pierdas horas ahí.
10. **Los cargadores de píxeles, analítica y banner de cookies no se aplazan** aunque subirían la nota: es decisión
    del dueño.
11. **Antes de decirle al dueño cuánto hay que tocar, cuéntalo con la herramienta que pone la nota.** Se le dijo «cinco
    textos con poco contraste» a partir de la lista que había pegado; el auditor completo sacó 27.

## Cuándo preguntar y cuándo seguir

Sigue sin preguntar: medir, diagnosticar, cambios que no alteran lo que se ve ni lo que se mide, trabajo en rama y en
el tema de pruebas.

Pregunta antes (una vez, con recomendación): cambio visible importante · quitar o simplificar una animación que se ve ·
tipografía · calidad o tamaño de fotos que se note · cualquier cosa que retrase o quite medición · formulario de
pedido, precios u ofertas · publicar en el tema en vivo si no lo ha pedido ya para este encargo.

## Archivos de esta skill

| Archivo | Léelo cuando |
| --- | --- |
| `medicion.md` | Vayas a medir, a comparar o a interpretar una nota de PageSpeed |
| `diagnostico.md` | Busques la causa, o el usuario pegue una lista de avisos de PageSpeed |
| `tecnicas.md` | Vayas a elegir o programar un cambio (qué funcionó, qué no, qué no depende del tema, trampas, limpieza) |
| `lista-movil.md` | Antes de dar por bueno un cambio |
| `hipotesis.md` | Te tiente una idea que «debería» funcionar: quizá ya está apuntada como no comprobada |
| `casos/caso-a-suplementos.md`, `casos/caso-b-cosmetica.md` | Quieras un ejemplo completo, con sus cifras y lo que salió mal |
| `herramientas/README.md` | Necesites montar la medición: scripts que se configuran con los datos de la tienda |
