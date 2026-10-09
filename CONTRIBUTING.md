# Cómo contribuir

Gracias por querer mejorar esto. Estas skills valen porque todo lo que dicen se hizo o se midió. Para que siga
siendo así:

## Qué se acepta

- **Una técnica que te ha funcionado**, con su medición: qué cambiaste, en qué condiciones mediste (perfil, número de
  pasadas) y la cifra de antes y después. Va a `skills/shopify-rendimiento/tecnicas.md`.
- **Algo que probaste y no sirvió.** Vale tanto como lo anterior: ahorra el intento a otros.
- **Una trampa** de la CLI de Shopify, de Liquid o de las herramientas de medición, con la regla que deja. Va a
  `skills/shopify-cambios-en-vivo/trampas.md`.
- **Arreglos en las herramientas**, sobre todo para macOS y Linux, donde no se han probado.
- **Un caso nuevo**, anónimo, en `skills/shopify-rendimiento/casos/`.

## Qué no

- Consejos sin medir. Si es una idea que no has comprobado, va a `hipotesis.md` y se dice que lo es.
- Nombres de tiendas, dominios, identificadores, cifras de ventas o cualquier dato que identifique a un negocio.
- Claves, tokens o credenciales, ni siquiera de ejemplo con forma real.
- Cualquier cosa que sirva para saltarse el consentimiento de cookies, los bloqueos contra bots o las políticas de
  las plataformas de anuncios.

## Cómo

1. Haz un fork y una rama con un nombre que diga qué cambia.
2. Mantén el estilo: frases completas, cifras exactas, y la marca que toque (**Método**, **Criterio de partida**,
   **Caso** o **Hipótesis**).
3. Si tocas un script, comprueba su sintaxis (`node --check archivo.js`, `bash -n archivo.sh`) y di en la petición en
   qué sistema lo has probado.
4. Si cambias las skills, sube la `version` en `.claude-plugin/plugin.json` y pasa `claude plugin validate .`
5. Abre la petición explicando qué mediste y cómo.

## Dudas

Abre una incidencia o escribe a [@juancaaa11](https://instagram.com/juancaaa11) en Instagram.
