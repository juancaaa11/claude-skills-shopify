#!/bin/bash
# batch.sh <prefijo de la grabación> <nombre>: reproduce todas las páginas grabadas con los perfiles fijos,
# 3 pasadas (2 en escritorio).
# Páginas principales («paginasPrincipales» en la configuración): móvil lento, 4G rápida, procesador ×6 y escritorio.
# El resto: móvil lento y escritorio.
here="$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))"
recp=${1:?uso: batch.sh <prefijo de la grabación> <nombre>}; name=${2:?falta el nombre de la tanda}
principales=$(HERE="$here" node -e "const c=require(process.env.HERE+'/../config').load();console.log((c.paginasPrincipales||c.paginas.slice(0,2).map(p=>p.nombre)).join(' '))")
resto=$(HERE="$here" node -e "const c=require(process.env.HERE+'/../config').load();const m=new Set(c.paginasPrincipales||c.paginas.slice(0,2).map(p=>p.nombre));console.log(c.paginas.map(p=>p.nombre).filter(n=>!m.has(n)).join(' '))")
for i in 1 2 3; do
  for pg in $principales; do
    for prof in m4 f4 m6 d; do
      [ $prof = d ] && [ $i = 3 ] && continue
      [ -f "out/rp-$name-$pg-$prof-r$i.json" ] && continue
      SUF="-r$i" "$here/exp.sh" "$recp-$pg" "$name-$pg" - $prof --wait=16000 2>/dev/null | cut -c1-150
    done
  done
  for pg in $resto; do
    for prof in m4 d; do
      [ $prof = d ] && [ $i = 3 ] && continue
      [ -f "out/rp-$name-$pg-$prof-r$i.json" ] && continue
      SUF="-r$i" "$here/exp.sh" "$recp-$pg" "$name-$pg" - $prof --wait=14000 2>/dev/null | cut -c1-150
    done
  done
done
echo TANDA-TERMINADA
