---
name: shopify-cambios-en-vivo
description: Aplica, comprueba y publica cambios en el tema de una tienda Shopify que ya está vendiendo, sin pisar lo que el dueño edita desde el editor y sin romper el diseño, la compra ni la medición. Úsala antes de subir cualquier cosa a un tema publicado («súbelo a live», «publícalo», «todo para arriba»), al traer cambios del tema publicado al repositorio, al comprobar que la tienda sigue funcionando después de un cambio (galería, variantes, packs y ofertas, botón y formulario de pedido, carrito, checkout, banner de cookies, píxel de Meta y analítica), y cuando el usuario pida «comprueba que todo funciona», «revisa que no se haya roto nada» o una revisión antes de lanzar campañas. La usa también la skill shopify-rendimiento para verificar y publicar sus cambios.
---

# Cambios en una tienda Shopify que está vendiendo

Procedimiento para tocar el tema de una tienda abierta. Sale del trabajo en dos tiendas reales (octubre de
2026): cada regla responde a algo que pasó. Las marcas son las mismas que en `shopify-rendimiento`: **Método**
(reutilizable), **Criterio de partida** (cómo quería trabajar el dueño de aquellas tiendas: buen valor por defecto,
se confirma con el de esta), **Caso** (una tienda concreta) e **Hipótesis** (sin comprobar).

## Tres ideas que lo ordenan todo

1. **El tema publicado es la fuente de la verdad, no el repositorio.** El dueño sube fotos, vídeos y textos desde el
   editor a diario y avisa después. Una copia local de ayer, subida entera, borra su trabajo.
2. **Nada llega al tema publicado sin haberse visto antes en un tema de pruebas.**
3. **Se comprueba por render, no leyendo el código.** Que el Liquid «esté bien» no dice qué ve el cliente.

## Antes de tocar nada

- Lee las instrucciones del proyecto (`CLAUDE.md`) y lo que haya de trabajos anteriores: ahí suelen estar los temas,
  los comandos y los «no tocar» de esa tienda.
- Confirma con `shopify theme list` cuál es el tema publicado y cuál el de pruebas. Los identificadores cambian.
- Mira `git status`. Si hay cambios sin confirmar, no hagas ningún `theme pull` sobre el repositorio.
- Averigua quién más está tocando: el dueño en el editor, otro agente en el mismo árbol de trabajo. Dos manos en el
  mismo árbol a la vez ya costaron ediciones perdidas.
- Entiende cómo se compra en esa tienda (checkout de Shopify, o formulario propio) y qué mide las ventas. De eso
  depende qué hay que probar.
- Antes de una limpieza o un cambio amplio: duplica el tema publicado como copia de referencia.

## Procedimiento

### 1. Traer lo que hay publicado, a una carpeta aparte

```bash
shopify theme pull --store <tienda> --theme <id publicado> --path <carpeta aparte> --only "templates/*.json" --only "sections/*.json" --only "config/settings_data.json"
```

Compara con el repositorio y fusiona. Para plantillas JSON, grupos de secciones y `settings_data.json`: se parte de la
versión publicada y se aplica **solo** el cambio. Nunca se sube el `settings_data.json` local entero.

### 2. Hacer el cambio

Rama, cambio pequeño, commit con el porqué. Si genera plantillas un script, no lo ejecutes sobre plantillas que el
dueño ya ha editado: pisaría sus valores.

### 3. Subir al tema de pruebas y comprobar por render

```bash
shopify theme push --store <tienda> --theme <id de pruebas> --nodelete --only <archivo>
```

- Vista previa: `https://<dominio>/?preview_theme_id=<id>&pb=0`. Comprueba en la página que el tema cargado es el de
  pruebas (`Shopify.theme.name`).
- Móvil (360 y 390 px) y escritorio (1.440 px). Lee medidas y estilos calculados con JavaScript además de mirar la
  captura.
- Compara con el tema publicado elemento a elemento cuando el cambio no debía verse: una comparación así detectó un
  interlineado que cambió al pasar un `h3` a `h2`.
- Recorre todos los estados del componente tocado (vacío, con un elemento, con muchos, abierto, cerrado), y el editor
  del tema si el cambio tiene ajustes.
- Espacia las visitas: la tienda limita las seguidas (HTTP 429). Si aparece la pantalla contra bots, para.
- `shopify theme check`: los mismos avisos que antes, ninguno nuevo.

### 4. Lista funcional

Recorre `lista-funcional.md`. El flujo de compra se prueba con la API de pedidos y los píxeles **simulados**
(`medicion-y-pixeles.md`): en la tienda publicada no se pulsa «realizar pedido».

### 5. Publicar, archivo por archivo

```bash
shopify theme push --store <tienda> --theme <id publicado> --allow-live --nodelete --only <archivo> --only <archivo>
```

- **Siempre `--nodelete`.** Un push sin él borra del tema publicado todo lo que no esté en la carpeta local.
- Orden: primero el snippet o el asset nuevo, después el archivo que lo usa.
- Las plantillas JSON, desde la carpeta aparte del paso 1 (`--path`), con solo el cambio aplicado.
- Solo se publica si el dueño lo ha pedido para este encargo (ver «Permisos»).

### 6. Comprobar en el tema publicado

- La página publicada sirve lo nuevo (basta pedir el HTML con un agente de usuario móvil y buscar la marca del cambio).
- Sin errores de consola ni peticiones fallidas en las páginas tocadas.
- Las baterías con todo simulado, ahora contra el tema publicado.
- La página publicada no pide archivos del tema de pruebas.

### 7. Dejarlo igual en todas partes

El mismo push al tema de pruebas, fusionar la rama, commit, y apuntar en el `CLAUDE.md` del proyecto lo que el
siguiente necesita saber (dónde vive el cambio, qué lo condiciona). Avisa al dueño de que ya está publicado.

## Marcha atrás

Cada cambio se deshace con `git revert` y subiendo esos mismos archivos; por eso van separados. Lo que apaga algo de
Shopify se enciende de nuevo desde su ajuste. Si no sabes deshacer un cambio en dos minutos, no está listo para
publicarse.

## Permisos

**Criterio de partida.** Muchos dueños aprueban con órdenes muy cortas («súbelo a live», «todo para arriba») y
prefieren que la subida la hagas tú y les avises al terminar, en vez de recibir comandos para copiar. Cuando no hay
más remedio que ejecuten algo ellos (porque tienen que teclear un secreto), rutas de su sistema y un comando por
bloque.

El permiso vale para lo que cubre, no para siempre ni para todo:

| Puedo hacerlo cuando lo pide para ese encargo | Necesita una confirmación propia, cada vez | No lo hago |
| --- | --- | --- |
| Publicar en el tema los cambios probados | Cambios visibles de diseño no pedidos | Teclear o leer contraseñas, claves o tokens |
| Pruebas con todo simulado | Tocar precios, ofertas, textos comerciales o el formulario de pedido | Pedidos reales, o enviar el formulario a la API real, sin permiso expreso |
| Leer paneles (Events Manager, analítica) | Quitar o retrasar píxel, analítica o banner de cookies | Editar campañas, anuncios o presupuestos |
| | Cambiar ajustes de privacidad o consentimiento | Saltarme el consentimiento o los bloqueos de bots |
| | Desplegar el servidor de pedidos | Reintentar por otra vía algo que el sistema de permisos ha denegado |
| | Borrar archivos del tema publicado | Inventar cifras, opiniones o sellos de terceros |

Un trabajo encargado como «no publiques, déjalo revisable» se queda en el tema de pruebas aunque en otro encargo haya
dado permiso para publicar.

## Informar

Qué se publicó y dónde · qué se comprobó y con qué resultado (con números: «46 de 46») · qué diferencia visible hay ·
qué no se pudo verificar · qué decisiones quedan para el dueño. Si algo falló, se dice con la salida del fallo. Si
pide una confirmación rotunda («¿todo perfecto al 100 %?»), se le confirma lo comprobado y se nombra aparte lo que
no depende de nosotros o no se pudo probar.

## Archivos de esta skill

| Archivo | Léelo cuando |
| --- | --- |
| `lista-funcional.md` | Vayas a dar por bueno un cambio o a hacer una revisión general de la tienda |
| `medicion-y-pixeles.md` | El cambio toque el layout, la carga de scripts, el formulario o el consentimiento; o haya que revisar la medición antes de una campaña |
| `trampas.md` | Algo de la CLI, de Liquid, de la vista previa o del navegador de pruebas no se comporte como esperas |
