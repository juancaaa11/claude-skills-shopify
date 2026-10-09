#!/bin/bash
# rec.sh <prefijo>: graba una visita real en móvil y otra en escritorio por cada página de la configuración,
# en rec/<prefijo>-<página> dentro de la carpeta de trabajo. Espera entre visitas para no saturar la tienda
# (ESPERA=segundos, por defecto 12).
here="$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))"
prefix=${1:?uso: rec.sh <prefijo>}
HERE="$here" node -e "const c=require(process.env.HERE+'/../config').load();for(const p of c.paginas)console.log(p.nombre+'|'+c.tienda+'/'+p.ruta)" | while IFS='|' read -r name url; do
  for prof in m1 d; do
    [ -f "out/rec-$prefix-$name-$prof.json" ] && continue
    node "$here/measure.js" "rec-$prefix-$name-$prof" "$url" $prof --rec="$prefix-$name" --post --wait=13000 2>&1 | tail -1 | sed -E 's/\| mocks.*//' | cut -c1-330
    sleep "${ESPERA:-12}"
  done
done
echo GRABADO
