# Hipótesis y cosas sin comprobar

Nada de lo que hay aquí es un hecho. Son ideas que se apuntaron y no se midieron, mediciones de una sola vez, o
afirmaciones que alguien hizo sin dato detrás. Antes de usar una, hay que comprobarla; al contarla, se dice que no
está comprobada. A y B son las dos tiendas de `casos/`.

## Nunca se probó en ninguna de las dos tiendas

- **Teléfono real.** Ni gama baja, ni Android antiguo, ni iPhone/Safari, ni los navegadores integrados de Instagram y
  Facebook, ni móviles con poca memoria. Todo es Chrome de escritorio emulando un móvil.
- **Que el arreglo del procesador en reposo se comporte igual en Chrome de Android** (caso B: se midió en Chrome 154 de
  escritorio; con la versión anterior el problema ni aparecía).
- **Que Safari entienda el `sizes` con `min()`/`max()`** de la galería (caso A). Se supuso que, si no, ignora el valor y
  pide la foto como antes.
- **El editor del tema** con la carga aplazada (caso A): la puerta está desactivada por código en el editor, pero no se
  pudo abrir fuera de la vista previa para verlo.
- **Quitar una app de terceros.** No había casi ninguna en el escaparate; no hay experiencia medida.

## Ganancias estimadas, no medidas

| Idea | De dónde sale la cifra | Estado |
| --- | --- | --- |
| Tope de nitidez a 2x en pantallas muy densas: un tercio menos de peso por foto (caso A), −50 a −60 KB (caso B) | Cálculo; la emulación no reproduce pantallas 3x | caso B lo aplicó; caso A no |
| Añadir un archivo de cursiva seminegrita propio, o poner en redonda los nombres de las opiniones: −0,3 s en móvil lento (caso A) | Estimado en la reproducción | Sin aplicar; decisión del dueño |
| Reexportar más ligero el banner de inicio en móvil (129 KB para 390 px) sería «previsiblemente lo que más bajaría» el LCP de inicio (caso A) | Opinión razonada, sin prueba | Sin hacer; depende del dueño |
| Quitar la precarga de la fuente de la cinta superior: ~0,25 s más en la foto (caso B) | Estimación | Se quitó en el tema publicado; el efecto no se midió aislado |
| Letra de reserva ajustada para quitar el salto de 0,09 al cambiar la fuente en políticas de escritorio (caso A) | Idea | Sin hacer |
| Aplazar los scripts de Shopify (píxeles, analítica, banner) subiría las pasadas «tropezadas» de PageSpeed | Razonamiento sobre qué cuenta la simulación | No se hizo ni se hará sin decisión del dueño |
| Partir la hoja de estilos por tipo de página | Se cree que no mueve la nota | No se hizo (riesgo de cascada) |

## Mediciones de una sola vez

- **INP real de 48 ms en la ficha del caso B** el primer día completo tras una ronda (antes, 282–512 ms). Un día. No se
  volvió a mirar.
- **Una de ~6 trazas del caso B con 2,7 s de procesador ocupado en reposo.** Vista una vez; apuntada para vigilar.
- **Que llegar a 90 en PageSpeed móvil en el caso B exigía un cambio visible de tipografía.** Se apuntó así; después, sin
  cambiar la tipografía, la ficha dio 92 en la comprobación oficial del 9 de octubre de 2026. Es una comprobación, con
  la variación que tiene esa nota: ni lo uno ni lo otro está cerrado.
- **Relación entre Early Hints y el tropiezo de PageSpeed** (caso A, en local): 6 de 13 pasadas con tropiezo cuando las
  hojas de estilo no llegaban adelantadas, frente a 1 de 29 cuando sí. Es una observación local; no se sabe si vale
  para la máquina oficial.
- En las notas del caso B hay una contradicción sin resolver sobre si ciertos parámetros de Chrome reproducen o no el
  tropiezo. La explicación posterior (el freno `ThrottleUndrawnFrames`, vista en la traza) es la que se da por buena.

## Sobre visitantes y negocio

- **«Más de la mitad de los visitantes usa móviles lentos o de gama baja; el comprador principal tiene entre 40 y 65
  años»** (caso B). Lo dijo el dueño al encargar el trabajo. No hubo medición que lo respaldara ni que lo
  contradiga. Lo que sí hay medido está en `casos/caso-b-cosmetica.md`.
- **Que la velocidad explique la diferencia entre clics del anuncio y visitas.** Fue la preocupación de partida en el caso B.
  La evidencia apuntó a otra cosa (las visitas y sesiones solo se cuentan con cookies aceptadas) y la ficha no cargaba
  peor que la página ligera. No se asignó ningún porcentaje a ninguna causa.
- **Toques accidentales** en los anuncios de tráfico frío como causa de su baja tasa de sesiones (caso B): probable, sin
  verificar.
- **Que la pantalla contra bots de Shopify afecte a clientes reales** que comparten IP de operador (caso B): sin verificar.
- **Que el banner de cookies con la configuración predeterminada de Shopify haga que «entre» más gente** que el banner
  personalizado. Es la impresión del dueño («antes entraba un 85 %»). Se volvió a la configuración predeterminada en
  las dos tiendas el 9 de octubre de 2026; el efecto no está medido.
- **Tasa de aceptación de cookies «algo menos de la mitad»** (caso B): inferida de dos proporciones, no medida.

## Propuestas que quedaron sin hacer

- Un contador propio y anónimo de llegadas (carga iniciada, producto mostrado, sigue a los 3 s), sin cookies, para
  separar «no llegó» de «no se midió» (caso B).
- Desglosar los clics salientes por iPhone y Android en el administrador de anuncios para separar consentimiento de
  lentitud en gama baja (caso B).
- Menos animaciones en bucle en la primera pantalla (caso B): necesitaba permiso; tras arreglar el reposo ya no aportaba
  nada medible.
- Subir el nombre del producto a la primera pantalla en móvil (caso B: empezaba en el píxel 769 de 823): es diseño, no se
  tocó.

## De dónde sale todo esto

De dos tiendas, en unas semanas de trabajo, medidas siempre en laboratorio y con datos reales solo de una de ellas.
Es poca muestra: lo que aquí figura como «funcionó» funcionó allí. Si en otra tienda una técnica no da el mismo
resultado, lo que manda es la medición nueva, y lo suyo es apuntarlo aquí.
