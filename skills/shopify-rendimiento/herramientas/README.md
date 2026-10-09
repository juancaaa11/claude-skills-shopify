# Herramientas de medición

Scripts para medir una tienda Shopify sin dejar rastro en ella: ni pedidos, ni eventos en los píxeles, ni carritos.
Nacieron en los dos casos de `../casos/` y aquí están generalizados: lo propio de cada tienda (dominio, páginas,
selectores) va en un archivo de configuración, no en el código.

## Preparación (una vez)

1. Node 22 o posterior, Google Chrome y, para los `.sh`, Bash (en Windows, Git Bash).
2. Una carpeta de trabajo fuera del tema (ahí se guardan grabaciones y resultados) con:

   ```bash
   npm i puppeteer-core
   ```

3. Copia `config.ejemplo.json` a esa carpeta como `tienda.config.json` y rellénalo. También puedes dejarlo en otro
   sitio e indicarlo con `SHOPIFY_SKILLS_CONFIG=<ruta>`.
4. Solo para la reproducción local, un certificado autofirmado en la carpeta de trabajo:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"
   ```

Todos los comandos se lanzan **desde la carpeta de trabajo**, llamando al script por su ruta.

## La configuración

| Clave | Para qué |
| --- | --- |
| `tienda` | Dirección de la tienda, sin barra final |
| `paginas` | Páginas a grabar y medir: nombre corto y ruta |
| `paginasPrincipales` | Las que se miden con todos los perfiles (el resto, solo móvil lento y escritorio) |
| `marcas` | Momentos propios que quieres cronometrar. `{ "selector": "…" }`: el elemento existe. Con `"visible": true`: además se ve. `{ "global": "objeto.propiedad" }`: esa variable global ya es cierta |
| `scrollEscritorio` | Selector del contenedor que se desplaza en escritorio, si no es el documento (en Horizon, `.page-wrapper`) |
| `cssCapturas` | CSS extra para las capturas (ocultar el banner de cookies, la barra de vista previa…) |
| `apiPropia` | Si la tienda llama a una API tuya (un formulario de pedido propio): `patron` (expresión regular), `respuestas` simuladas por ruta y `nuncaCrear`, las rutas que crearían un pedido: se responden con error y quedan anotadas |
| `jsPropio` | Expresión regular que distingue tus scripts de los del tema base en los informes |
| `contraste` | Textos cuyo contraste quieres medir: nombre y selector |
| `repasoPrevio` | Lo que comprueba `prelaunch_api.js` (en la skill `shopify-cambios-en-vivo`) |

Analítica, píxeles (Meta, Google, TikTok y otros) y escrituras en el carrito se responden siempre en local: no hay que
configurarlo.

## reproduccion/ — grabar una visita real y volver a servirla en local

Sirve para comparar antes y después con las **mismas** condiciones y sin gastar visitas a la tienda. El porqué y los
avisos del método están en `../medicion.md`.

| Archivo | Qué hace |
| --- | --- |
| `measure.js <etiqueta> <url> <perfil>` | Una carga con todo medido: FCP, LCP y qué elemento es, CLS, tareas largas y TBT, índice de velocidad, peso, peticiones, cascada, procesador en carga y en reposo, tus marcas y errores de consola. `--rec=` graba la visita; `--replay=` la mide contra la reproducción; `--post` recorre la página sin límites y revisa imágenes, desbordes, vídeos y animaciones; `--shots` añade capturas |
| `rec.sh <prefijo>` | Graba una visita en móvil y otra en escritorio por página, espaciadas (`ESPERA=12`) |
| `replay.js <puerto> <grabación> [cambios]` | Servidor local que responde con lo grabado |
| `exp.js <grabación> <nombre> <t1,t2>` | Aplica cambios de prueba al HTML grabado («¿y si el resto de fotos fueran diferidas?») sin tocar la tienda. Trae ejemplos; añade los tuyos |
| `exp.sh <grabación> <nombre> <cambios o -> <perfil>` | Levanta la reproducción, mide un perfil y la apaga |
| `batch.sh <prefijo> <nombre>` | Todas las páginas con todos los perfiles, 3 pasadas (2 en escritorio) |
| `sum.js "<patrón>" …` | Mediana y rango de las pasadas |

Perfiles: `m4` móvil lento (4G lenta y procesador ×4), `f4` 4G rápida ×4, `m6` procesador ×6 sin límite de red, `d`
escritorio, `m1` móvil sin límites (para grabar).

Orden de uso:

```bash
H=<ruta de esta carpeta>/reproduccion
$H/rec.sh antes
$H/batch.sh antes base
# … publicas el cambio en el tema de pruebas …
$H/rec.sh despues
$H/batch.sh despues nuevo
node $H/sum.js "rp-base-producto-m4-r\d" "rp-nuevo-producto-m4-r\d"
```

## pagespeed/ — entender la nota en vez de perseguirla a ciegas

| Archivo | Qué hace |
| --- | --- |
| `lh.sh <etiqueta> <url> [n]` | Lighthouse 12 como PageSpeed móvil, n pasadas; marca las pasadas «tropezadas» |
| `gather.sh <carpeta> <url>` | Guarda los artefactos de una pasada para analizarla sin repetirla |
| `graph.js <informe.json> [-v]` | Qué peticiones terminaron antes del LCP observado: lo que la simulación «cobra» |
| `whatif.mjs <carpeta> [--sin "patrón1,patrón2"]` | Aplica el simulador de Lighthouse a una pasada guardada y calcula cuánto bajarían FCP y LCP quitando ciertos recursos, antes de programar nada. Necesita `npm i lighthouse@12` en la carpeta de trabajo (o `LIGHTHOUSE_DIR=<carpeta de lighthouse>`) |
| `ab.sh <url> <parámetro> [n]` | Alterna pasadas con y sin un interruptor de diagnóstico en la URL, si el tema tiene uno |
| `a11y_contrast.sh <etiqueta> <url>` | Solo accesibilidad: **todo** lo que falla, con los colores que ve el auditor. La fuente fiable para el contraste |

## varios/ — contraste

| Archivo | Qué hace |
| --- | --- |
| `contrast_calc.js <texto> <fondo> …` | El tono más cercano que llega a 4,5:1: mismo matiz, menos luminosidad; o más opacidad si es translúcido |
| `contrast_verify.js <url> <etiqueta> [movil o escritorio]` | Color real, contraste y medidas de cada texto de `contraste`, con una captura del bloque que lo rodea |
| `contrast_sheet.js <antes> <después> <salida.png>` | Hoja «antes / después» para enseñársela al dueño antes de publicar |

## Qué está probado

Todas se ejecutaron contra una tienda real antes de publicarse, en Windows 11 con Git Bash, Node 24 y Chrome: grabar,
reproducir, la tanda completa y el resumen; las seis de PageSpeed; las tres de contraste; y el repaso previo. **No se
han probado en macOS ni en Linux.** Si algo falla en tu sistema, casi siempre es la ruta de Chrome (`chrome` en la
configuración o `CHROME_PATH`).

En Git Bash, un argumento que empieza por `/` se convierte en una ruta de Windows: escribe los patrones de
`whatif.mjs` sin la barra inicial (`--sin "assets/mi-"`) o antepón `MSYS_NO_PATHCONV=1`.

## Límites

- Todo es laboratorio: Chrome de escritorio emulando un móvil. No es un teléfono real.
- La reproducción no incluye el adelanto de hojas de estilo de Shopify ni el banner de cookies, y reparte la conexión
  por igual entre descargas simultáneas.
- Una batería que pruebe **tu** flujo de compra de principio a fin (abrir el formulario, validar, enviar con la API
  simulada, comprobar los eventos) depende de tu tienda: no viene aquí. `../../shopify-cambios-en-vivo/medicion-y-pixeles.md`
  dice qué casos debe cubrir.
