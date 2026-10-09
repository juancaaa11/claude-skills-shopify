#!/bin/bash
# lh.sh <etiqueta> <url> [n]: Lighthouse 12 configurado como PageSpeed (móvil, simulado), n pasadas (3 por defecto).
# Imprime la nota, las métricas y los tiempos OBSERVADOS, que sirven para reconocer las pasadas «tropezadas»
# (primer pintado observado por encima de ~900 ms cuando lo normal son 300–450).
# Deja lh-<etiqueta>-<i>.json en la carpeta de trabajo.
[ -z "$CHROME_PATH" ] && [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ] && export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
label=${1:?uso: lh.sh <etiqueta> <url> [n]}; url=${2:?falta la url}; N=${3:-3}
for i in $(seq 1 "$N"); do
  npx --yes lighthouse@12 "$url" --only-categories=performance --form-factor=mobile --output=json --output-path="lh-$label-$i.json" \
    --chrome-flags="--headless=new --no-sandbox --disable-gpu --use-angle=swiftshader" --quiet >/dev/null 2>&1
  F="lh-$label-$i.json" node -e "
const j=JSON.parse(require('fs').readFileSync(process.env.F,'utf8'));const a=j.audits;const m=a.metrics.details.items[0];
console.log(process.env.F.replace('.json','')+': nota',Math.round(j.categories.performance.score*100),'| FCP',a['first-contentful-paint'].displayValue,'| LCP',a['largest-contentful-paint'].displayValue,'| TBT',a['total-blocking-time'].displayValue,'| CLS',a['cumulative-layout-shift'].displayValue,'| SI',a['speed-index'].displayValue,'| pintado observado',Math.round(m.observedFirstContentfulPaint)+' ms','| LCP observado',Math.round(m.observedLargestContentfulPaint)+' ms',m.observedFirstContentfulPaint>900?'| TROPEZADA':'');
"
  sleep 6
done
