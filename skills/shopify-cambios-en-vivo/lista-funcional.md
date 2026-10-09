# Lista funcional: la tienda sigue funcionando

**Método.** Se recorre en el tema de pruebas antes de publicar y, lo que se pueda sin crear pedidos, otra vez en el
publicado. Marca cada punto como comprobado, no aplicable o **sin verificar**; lo último va al informe. Para móvil hay
una lista aparte en `../shopify-rendimiento/lista-movil.md`.

Adapta los nombres a la tienda: «formulario de pedido» es el checkout de Shopify donde se use, o el formulario propio
donde lo haya (en los dos casos de estas skills, un formulario contra reembolso que crea el pedido contra un
servidor propio).

## 1. Diseño

- [ ] Las páginas tocadas se ven igual que antes salvo por el cambio pedido (comparación con el tema publicado a 360,
      390 y 1.440 px).
- [ ] Misma altura de página; ninguna sección desaparecida, duplicada o vacía ocupando hueco.
- [ ] Sin desbordes horizontales.
- [ ] Fuentes, iconos e imágenes cargan; ninguna imagen rota; ningún texto con etiquetas HTML a la vista.
- [ ] Animaciones y efectos de scroll, como antes (móvil y escritorio).

## 2. Ficha de producto

- [ ] Galería: foto principal, deslizar, puntos, miniaturas, zoom.
- [ ] Variantes: cambiar de variante cambia precio, foto y disponibilidad.
- [ ] Packs u ofertas: seleccionar cada uno cambia precio, ahorro y lo que llega al formulario o al carrito; etiquetas
      («más popular») y regalos anunciados, visibles.
- [ ] Precio y precio tachado correctos y coherentes con lo que cobra el formulario.
- [ ] Disponibilidad: el producto no aparece como agotado sin estarlo.
- [ ] Bloques bajo el título y bajo el botón (valoración, medios de pago, prueba social) presentes.
- [ ] Vídeos: portada, reproducción, sin descarga si no se reproducen.
- [ ] Reseñas: se muestran, paginan y abren sus fotos.

## 3. Comprar

Con la API de pedidos y los píxeles simulados. En el tema publicado no se envía el formulario.

- [ ] El botón de compra y la barra fija responden al primer toque, también tocando nada más pintarse.
- [ ] El formulario abre con el producto, el pack y el precio correctos.
- [ ] Producto extra y regalo: aparecen donde deben y no donde no (según las reglas de esa tienda).
- [ ] Validación: campos obligatorios, teléfono, nombres con apóstrofos, acentos y abreviaturas, direcciones con
      barras y puntos. Un envío inválido no llama al servidor.
- [ ] Llegar con una dirección muy larga (parámetros del anuncio incluidos) no hace fallar el pedido.
- [ ] Código de descuento: válido, inválido, y combinado con el pack.
- [ ] Doble clic en enviar: una sola petición.
- [ ] Error del servidor: mensaje claro, reintento con el mismo intento, sin pantalla de confirmación falsa.
- [ ] Sesión caducada: se renueva sola.
- [ ] Confirmación: aparece solo con respuesta correcta del servidor; recargar o volver atrás no crea otro pedido.
- [ ] Cerrar el formulario y volver a abrirlo funciona; la oferta al cerrar, si la hay, aparece una vez.
- [ ] Si la tienda usa carrito y checkout de Shopify: añadir, cambiar cantidad, quitar, ir al checkout, descuentos
      automáticos aplicados.

## 4. Resto de la tienda

- [ ] Cabecera y menú (móvil y escritorio), pie, enlaces legales.
- [ ] Inicio, colección, búsqueda (con y sin resultados), carrito vacío, páginas, políticas, contacto, 404, blog.
- [ ] Todas las URLs del sitemap responden 200 (o lo mismo que respondían antes).
- [ ] Formularios de contacto y de boletín: se muestran y validan. Enviarlos de verdad crea datos reales: solo con
      permiso.
- [ ] Botón de WhatsApp u otros flotantes: visibles, se cierran, no tapan la barra de compra.
- [ ] Redirecciones de direcciones antiguas.

## 5. Consentimiento y medición

Detalle en `medicion-y-pixeles.md`.

- [ ] El banner de cookies aparece (en el tema publicado; en vista previa Shopify no lo muestra), con su aspecto y en
      su sitio, y sus botones funcionan.
- [ ] Sin responder o rechazando: ninguna petición a los píxeles, ninguna cookie de publicidad.
- [ ] Aceptando: vista de página y vista de producto, una vez cada una, al píxel correcto.
- [ ] Abrir el formulario dispara el inicio de pago una vez; la compra solo se dispara con el pedido confirmado y con
      el mismo identificador que envía el servidor.
- [ ] Los parámetros del anuncio (`utm_*`, `fbclid`) se guardan al llegar y viajan con el pedido.
- [ ] Nadie ha tocado ni retrasado los cargadores de píxeles, analítica y banner.

## 6. Técnica

- [ ] Consola sin errores nuevos; ninguna petición fallida nueva.
- [ ] `shopify theme check`: mismos avisos que antes.
- [ ] Editor del tema: la sección tocada se puede abrir, configurar y vaciar sin romperse; los ajustes nuevos tienen
      valor por defecto.
- [ ] Las plantillas JSON publicadas conservan lo que el dueño había editado.
- [ ] La página publicada no pide nada del tema de pruebas.
- [ ] Peso y número de peticiones dentro de lo habitual de esa página (si hay presupuestos, dentro de ellos).

## 7. Lo que esta lista no puede dar por bueno

- Las cifras de opiniones, clientes o resultados que muestra la tienda las escribe el dueño: aquí se comprueba que se
  ven, no que sean ciertas.
- Un pedido real de principio a fin (almacén, correo de confirmación, registro en el panel de anuncios) solo se
  comprueba cuando el dueño hace o autoriza uno.
- Teléfonos reales y navegadores integrados de redes sociales.
