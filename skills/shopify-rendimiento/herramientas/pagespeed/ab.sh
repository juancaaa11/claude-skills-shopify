#!/bin/bash
# ab.sh <url> <parámetro> [n]: alterna pasadas de Lighthouse con y sin un interruptor de diagnóstico en la URL
# (por ejemplo «carga=antigua», si el tema tiene uno que desactiva la carga aplazada). Imprime la nota y los
# tiempos observados de cada pasada, para comparar las dos cargas en la misma página y en el mismo rato.
[ -z "$CHROME_PATH" ] && [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ] && export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
url=${1:?uso: ab.sh <url> <parámetro> [n]}; param=${2:?falta el parámetro, por ejemplo carga=antigua}; N=${3:-8}
case "$url" in *\?*) sep="&";; *) sep="?";; esac
for i in $(seq 1 "$N"); do
  for v in con sin; do
    U="$url"; [ $v = sin ] && U="$url$sep$param"
    npx --yes lighthouse@12 "$U" --only-categories=performance --form-factor=mobile --output=json --output-path="lh-ab-$v-$i.json" \
      --chrome-flags="--headless=new --no-sandbox --disable-gpu --use-angle=swiftshader" --quiet >/dev/null 2>&1
    F="lh-ab-$v-$i.json" V="$v" I="$i" node -e "
const j=JSON.parse(require('fs').readFileSync(process.env.F,'utf8'));const a=j.audits;const m=a.metrics.details.items[0];
console.log(process.env.V,process.env.I,'nota',Math.round(j.categories.performance.score*100),'FCP',a['first-contentful-paint'].displayValue,'LCP',a['largest-contentful-paint'].displayValue,'SI',a['speed-index'].displayValue,'| observado FCP',Math.round(m.observedFirstContentfulPaint),'LCP',Math.round(m.observedLargestContentfulPaint),m.observedFirstContentfulPaint>900?'TROPEZADA':'');"
    sleep 4
  done
done
