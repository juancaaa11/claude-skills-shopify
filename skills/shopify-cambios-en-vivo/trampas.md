# Trampas conocidas

Cosas que no se comportaron como se esperaba al trabajar en dos tiendas reales. Todas ocurrieron. Las de entorno
(Windows, panel de navegador) dependen del equipo con el que se trabaje; el resto valen para cualquier tienda.

## CLI de Shopify y temas

| Trampa | Qué hacer |
| --- | --- |
| `theme push` sin `--nodelete` borra del tema remoto lo que no está en local | `--nodelete` siempre; borrar, a propósito |
| `theme pull` sobre el repositorio pisa cambios sin confirmar y lo que otro agente esté editando | Traer a una carpeta aparte con `--path` y comparar |
| Subir el `settings_data.json` local entero pisa los ajustes que el dueño cambió en el editor | Partir de la versión publicada y cambiar solo la clave necesaria |
| Los ajustes del tema no viajan con el código: el tema de pruebas puede tener ajustes viejos | Igualarlos antes de comparar o de dar por buena una vista previa |
| El identificador del tema publicado puede cambiar (el dueño publica una copia) | `shopify theme list` al empezar |
| Al subir, Shopify quita bloques de apps desinstaladas de las plantillas | Diferencia inocua; no «arreglarla» |
| Un script que genera plantillas, ejecutado sobre plantillas ya editadas en el editor, pisa más de cien valores | No ejecutarlo; editar el JSON traído del tema publicado |
| El layout nuevo se publica antes que el snippet que usa | Subir primero el snippet |
| El token de la CLI de temas no ve pedidos ni analítica | Esos datos, en el administrador con el navegador del dueño |
| `shopify store execute --query '…"…"…'` falla en PowerShell (se come las comillas) | `--query-file` y `--variable-file` |
| Abrir vistas previas enseña a Shopify a adelantar a los visitantes las hojas del tema de pruebas | `&pb=0`, pocas aperturas y comprobar al final que la página publicada no pide nada del tema de pruebas |
| La tienda responde 429 o muestra la pantalla contra bots tras varias cargas seguidas | Espaciar; no intentar superarla; verificar en el navegador integrado |
| Shopify no muestra el banner de cookies en vista previa | Lo del banner se mira en el tema publicado |
| Una opción de envío del mercado sin ubicación de origen marca **todo** como agotado en el escaparate | Ante un «agotado» inesperado, mirar envíos antes que el tema |
| Un blog vacío sigue en el sitemap; sin plantilla da 404 | No borrar plantillas de tipos de página que existen en la tienda |

## Liquid y CSS

Las de rendimiento están en `../shopify-rendimiento/tecnicas.md`, apartado D. Las que afectan a cualquier cambio:

- `image_tag` seguido de un filtro de texto y `| escape` imprime la etiqueta como texto visible.
- `image_tag` no escribe `alt` si recibe `nil`.
- `images['archivo']` de un archivo que no existe no es `nil`: se comprueba con `!= blank`.
- `theme check` da error por `<img` escrito dentro de un comentario Liquid y por `<img>` sin `width` y `height`.
- Los estilos de `{% stylesheet %}` se cargan **después** de las hojas del tema: para pisarlos hace falta más
  especificidad.
- Un ajuste de tipo producto dentro de un bloque de la ficha pasa a ser el producto «más cercano» y el bloque deja de
  ver el producto de la página.
- Un bloque que no pinta nada cuando le falta un ajuste (por ejemplo, el número de opiniones a cero) parece «perdido»
  al dueño: o tiene un valor por defecto visible, o se le avisa.
- Cambiar el separador del título de un producto rompe lo que corta el título por ese separador (nombre corto en el
  formulario y en las tarjetas).

## Navegador y pruebas

- Pulsar el flujo de compra en la tienda publicada crea pedidos reales y deja eventos en el píxel. El sistema de
  permisos además lo bloquea: no se reintenta de otra forma.
- En el panel de navegador integrado, estrecho (~600 px), una emulación más ancha escala la captura: para escritorio se
  leen medidas con JavaScript.
- Con el panel oculto, `IntersectionObserver` y `requestAnimationFrame` pueden no ejecutarse, y los informes de
  PageSpeed no se refrescan hasta traer la pestaña al frente.
- En temas donde la página se desplaza dentro de un contenedor (Horizon en escritorio), `window.scrollTo` no mueve
  nada: usar `scrollIntoView`.
- Capturas de página entera con secciones en `content-visibility`: en blanco donde no se ha pintado.
- Un «el formulario no se abrió» resultó ser el toque de la prueba cayendo en otro sitio mientras la página se movía:
  las pruebas de toque, deterministas (evento sobre el elemento, no coordenadas).
- En paneles de terceros (administrador de Shopify, anuncios), los clics por referencia a veces no registran y por
  coordenadas sí; si el dueño está usando la misma pestaña, el estado cambia mientras se lee: parar y volver a
  comprobar.
- El navegador de las herramientas de depuración no tiene las sesiones del dueño; el suyo, sí.
- Con la ventana del navegador del dueño minimizada o tapada, sus pestañas están «ocultas»: las capturas caducan, los
  clics simulados no abren paneles y algunas secciones no llegan a pintarse (en el editor de un anuncio se leía el
  texto, pero no la sección de destino). Lo que no se ha podido leer se dice; no se deduce.
- Al filtrar la salida de una subida al tema publicado se perdió el texto de un aviso de la CLI, que luego no se
  pudo reproducir. La salida completa de cada subida se guarda en un archivo y se lee entera.

## Terminal en Windows

- Rutas con formato de Git Bash pegadas en PowerShell: «no encuentra la ruta». Al dueño, rutas de Windows y un
  comando por bloque.
- Scripts en línea con comillas o acentos graves se rompen en Bash y en PowerShell: escribir el script en un archivo y
  ejecutarlo.
- Git Bash convierte los argumentos que empiezan por `/`; `MSYS_NO_PATHCONV=1` lo evita, pero rompe `--path` de la CLI
  de Shopify.

## Trabajo en paralelo

- No dar al dueño comandos que toquen todo el árbol mientras un agente trabaja en él.
- Un agente que publica debe recibir las mismas reglas (`--nodelete`, `--only`, carpeta aparte): uno subió el tema de
  pruebas sin `--nodelete`.
- Tras un trabajo delegado, comprobar por render lo que dice haber dejado hecho antes de contárselo al dueño.

## Servicios alrededor del tema

- En el repositorio del servidor de pedidos, subir a la rama principal puede desplegar a producción: solo con el
  visto bueno del dueño. Y puede **no** desplegar aunque se suba (la integración continua estaba parada por un
  problema de facturación): confirmar el despliegue en el alojamiento, no darlo por hecho.
- Las pruebas de ese servidor fallan sin variables de entorno: se ejecutan con valores ficticios, nunca con los reales.
- Un cambio de precio vive en varios sitios a la vez (variante, descuentos automáticos, plantillas, configuración del
  servidor de pedidos): si no coinciden, la ficha anuncia un precio y el formulario cobra otro.
