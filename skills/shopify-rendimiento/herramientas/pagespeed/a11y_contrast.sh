#!/bin/bash
# a11y_contrast.sh <etiqueta> <url>: Lighthouse 12, solo accesibilidad (móvil), y la lista de TODO lo que falla.
# Para el contraste da los colores que ve el propio auditor (texto y fondo ya compuestos): es la fuente fiable para
# saber cuántos textos hay que tocar antes de dar un alcance. Deja a11y-<etiqueta>.json en la carpeta de trabajo.
[ -z "$CHROME_PATH" ] && [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ] && export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
label=${1:?uso: a11y_contrast.sh <etiqueta> <url>}; url=${2:?falta la url}
npx --yes lighthouse@12 "$url" --only-categories=accessibility --form-factor=mobile --output=json --output-path="a11y-$label.json" \
  --chrome-flags="--headless=new --no-sandbox" --quiet >/dev/null 2>&1
F="a11y-$label.json" L="$label" node -e "
const j=JSON.parse(require('fs').readFileSync(process.env.F,'utf8'));
console.log(process.env.L+': accesibilidad', Math.round(j.categories.accessibility.score*100), '·', j.finalDisplayedUrl.slice(0,90));
for (const [id,a] of Object.entries(j.audits)) { if (a.score===null || a.score===1 || !a.details || !a.details.items) continue;
  console.log('  FALLA', id, '('+a.details.items.length+')');
  for (const it of a.details.items) { const n=it.node||{}; console.log('     ', (n.selector||'').slice(-70), '|', (n.nodeLabel||'').slice(0,30), '|', (n.explanation||'').replace(/\s+/g,' ').replace('Fix any of the following: ','').slice(0,170)); } }
"
