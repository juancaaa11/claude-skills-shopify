# Medición y píxeles: comprobar sin romper y sin pedidos reales

Qué mirar cuando un cambio puede afectar a lo que la tienda mide, y cómo revisarlo antes de una campaña. El método es
reutilizable; los detalles de Meta y del formulario propio son de dos tiendas reales (**Caso**) y solo se aplican
tal cual si la tienda mide igual.

## 1. Primero, el inventario

No se añade ni se cambia nada hasta saber qué hay (**Método**; en uno de los casos ya había habido píxeles
duplicados):

- **Quién carga cada píxel:** una app oficial del canal, un píxel personalizado, código en el tema, un gestor de
  etiquetas. En la tienda se ve en la lista de píxeles web que Shopify inyecta en la página y en si existe la función
  del píxel en la ventana antes y después de aceptar las cookies.
- **Cuándo se carga:** casi siempre, solo tras aceptar el banner de cookies.
- **Qué evento envía cada pieza** y si dos piezas envían el mismo.
- **Dónde nace la venta:** qué petición crea el pedido y qué respuesta lo da por confirmado.

En las dos tiendas quedó así, sin solapes: la app de Shopify envía vista de página y de producto (con cookies
aceptadas); el formulario propio envía inicio de pago y compra usando el píxel que cargó la app; el servidor de
pedidos envía la compra por la API de conversiones con el mismo identificador. Los pedidos no pasan por el checkout de
Shopify, así que la app nunca envía su propia compra.

## 2. Reglas que no se rompen

- **Una compra se envía solo con el pedido confirmado por el servidor.** Nunca al abrir el formulario, al pulsar el
  botón ni tras un envío fallido.
- **Un intento, un identificador.** Reintentos automáticos, reenvíos y renovaciones de sesión conservan el mismo;
  solo reabrir el formulario genera otro. Navegador y servidor envían ese mismo identificador con el mismo nombre de
  evento: así la plataforma fusiona las dos copias.
- **El importe lo calcula el servidor**; el navegador repite el que recibe.
- **El servidor no depende de que cargue ninguna página** para enviar su copia, y guarda el evento antes de enviarlo
  para poder reintentar.
- **No se conecta el envío por servidor de una tienda cuyo formulario no manda el identificador:** duplicaría las
  compras de quien acepta cookies.
- **Los tokens y claves nunca van al tema, al repositorio ni a un registro.** Los teclea el dueño en su propio script.
- **No se elude el consentimiento en el navegador** (ni píxel manual, ni cookies contra la elección del visitante) ni
  los bloqueadores.
- **No se tocan ni se retrasan** los cargadores de píxeles, analítica y banner de cookies por rendimiento sin que el
  dueño lo decida.

**Decisión de un caso, no una recomendación.** El dueño de aquellas tiendas decidió que la compra se enviara por
servidor siempre, aceptara o no cookies el visitante, informado del riesgo legal y de las condiciones de la
plataforma. Es una decisión legal y de negocio que corresponde a cada dueño: no se aplica por defecto. En otra tienda
se explica qué se gana, qué riesgo tiene y se deja que decida. El banner de cookies quedó con la configuración
predeterminada de Shopify.

## 3. Batería con todo simulado

Un navegador aislado carga la tienda de verdad; la API de pedidos se simula entera y las peticiones a los píxeles, a
la analítica y al carrito se responden en local. No crea pedidos ni envía nada a ninguna plataforma. Casos que cubre:

| Caso | Qué debe pasar |
| --- | --- |
| Sin responder al banner / rechazando | Cero peticiones al píxel y cero cookies de publicidad; aun así el pedido lleva identificador, página y parámetros del anuncio |
| Aceptando, compra válida (móvil y escritorio) | Un inicio de pago, una compra; el identificador del navegador es el del servidor |
| Envío inválido | Ni llamada al servidor ni compra |
| Abandono y reapertura | Nuevo inicio de pago con otro identificador |
| Doble clic | Una petición, una compra |
| Fallos del servidor y reintento | Mismo identificador, una compra |
| Conflicto y reintento automático | Dos envíos, mismo identificador, una compra |
| Sesión caducada | Se renueva sin un segundo inicio de pago |
| Recargar tras confirmar y volver atrás | Ni compra ni pedido nuevos |
| Página de inicio | Los parámetros del anuncio se guardan aunque no se entre por la ficha |

Una batería así es propia de cada tienda, porque depende de su formulario; se guarda en el repositorio del tema. En
los dos casos tenía entre 45 y 50 comprobaciones y se pasaba contra el tema de pruebas y contra el publicado después
de tocar el formulario, el layout o la carga de scripts.

## 4. Comprobación con el píxel real, sin compra

Cuando hace falta ver que el píxel de verdad recibe (antes de una campaña): una visita que acepta el banner y abre el
formulario, **sin enviarlo**. Deben salir vista de página, vista de producto e inicio de pago hacia el píxel de esa
tienda, y nada antes de aceptar. Envía unos pocos eventos reales: se hace las veces justas y se le dice al dueño.

## 5. Evidencia en producción

- **Registros del servidor de pedidos** (solo lectura): por cada pedido, la línea de entrega a la plataforma. Sin
  línea de fallo no hubo reintento.
- **Panel de eventos de la plataforma** (solo lectura, con el navegador del dueño): recepción por navegador y por
  servidor, deduplicación, calidad de coincidencias.
- **Recepción no es atribución.** El panel de eventos enseña todo lo recibido; el de anuncios, solo lo que atribuye a
  un anuncio. «No me ha contado el pedido de las 18:14» suele ser atribución, no pérdida. No se promete que la
  plataforma atribuya el 100 %.
- Un pedido real de prueba solo lo hace el dueño, o yo con su permiso expreso para ese pedido.

## 6. Lo que engaña

- Los **eventos de prueba no se apartan** del conjunto de datos. Un evento de prueba con forma de compra queda como
  compra: la prueba de conexión se hace con un evento personalizado.
- Al **observar el formulario en la tienda publicada** quedan eventos reales en el píxel. Para mirar, la batería
  simulada. Y desde que el servidor envía el inicio de pago, **abrir el formulario contra la API real deja un evento
  real aunque no haya consentimiento ni píxel cargado**: cualquier prueba que lo abra debe simular la API de pedidos
  (tres aperturas de una comprobación automática quedaron así registradas).
- **Sesiones y visitas a la página de destino dependen del consentimiento**: no cuentan a quien no acepta.
- El embudo de Shopify marca «llegó al checkout: 0» cuando los pedidos no pasan por su checkout.
- Un **«añadir al carrito» inflado** puede venir de código que sincroniza el carrito al cambiar de pack (caso B:
  origen muy probable, sin verificar con una prueba; el dueño pidió no quitar esa sincronización).
- Eventos automáticos por cada clic en cualquier botón: no indican pérdida ni duplicado.
- La IP del cliente que ve el servidor puede ser la del proveedor de alojamiento: hay que leer la cabecera correcta.
- En el panel de eventos hay diálogos que no se pueden deshacer; no se acepta ninguno sin preguntar.
- Los paneles de anuncios pintan solo las columnas visibles: se leen eligiendo las columnas en la dirección y con una
  ventana ancha, no desplazando.

## 7. Revisión antes de lanzar campañas

1. Batería simulada contra el tema publicado de cada tienda: todo correcto.
2. Píxel real, aceptando y rechazando: eventos al píxel correcto, nada antes de aceptar.
3. Últimos pedidos reales entregados por servidor a la primera (registros). **Mira la hora del último pedido frente a
   la del último despliegue del servidor:** si no ha entrado ninguno desde entonces, la creación de pedidos en la
   versión nueva no está probada. Lo que se puede hacer sin crear nada: salud del servidor, precio que devuelve para
   cada pack (una sesión sin contexto de medición no envía ningún evento) y que la ruta de pedidos rechaza un token
   inventado y un cuerpo vacío (`herramientas/prelaunch_api.js`, que se configura con los datos de la tienda). Lo que
   falta, un pedido real de prueba, se le pide al dueño.
4. Banner de cookies: aparece, en su configuración acordada.
5. Los anuncios apuntan a `https://` y al dominio final (sin redirecciones), a un producto publicado y disponible.
6. Lo que anuncian (ofertas, regalos, nombre del producto) coincide con lo que da la tienda. Las discrepancias se
   avisan; los anuncios no se editan (y editar uno programado lo devuelve a revisión).
7. Informe: qué está comprobado, qué no se puede comprobar hasta el primer pedido real, y qué mirar el primer día
   (compras en el panel frente a pedidos reales).

## 8. Pendiente y sin comprobar

- El **inicio de pago desde el servidor** al abrirse el formulario (recomendación de la plataforma) está en producción
  desde el 9 de octubre de 2026 y los registros muestran entregas aceptadas a la primera en las dos tiendas. Su efecto
  sobre la optimización de campañas no está medido. Los dos pedidos de prueba que hizo el dueño esa madrugada, uno
  por tienda, lo confirmaron de principio a fin: inicio de pago y compra entregados por servidor a la primera, los
  dos con el mismo identificador del formulario y con la cookie del píxel.
- La «cobertura» entre navegador y servidor que enseña el panel de eventos baja cuando muchos compradores no aceptan
  cookies (sus compras llegan solo por servidor). Es la lectura que se dio a un 35 %; no se contrastó con la plataforma.
- La primera comparación de compras del panel frente a pedidos reales tras lanzar las campañas del 9 de octubre de
  2026 quedó por hacer.
