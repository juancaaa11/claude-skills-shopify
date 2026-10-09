#!/bin/bash
# exp.sh <grabación> <nombre> <cambios|-> <perfil> [más argumentos de measure.js]
# Levanta la reproducción de rec/<grabación> en un puerto libre, mide un perfil y la apaga.
# <cambios> es una lista de transformaciones de exp.js separadas por comas («-» para medir la grabación tal cual).
here="$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))"
rec=$1; name=$2; ts=$3; prof=$4; shift 4
[ "$ts" != "-" ] && node "$here/exp.js" "$rec" "$name" "$ts"
port=$(( ${PORTBASE:-8500} + RANDOM % 300 ))
mkdir -p "overlay/$name"
node "$here/replay.js" $port "rec/$rec" "overlay/$name" > /dev/null 2>&1 &
pid=$!; sleep 0.8
doc=$(REC="$rec" node -e "const ix=JSON.parse(require('fs').readFileSync('rec/'+process.env.REC+'/index.json','utf8'));console.log(Object.values(ix).find(v=>v.doc).url)")
node "$here/measure.js" "rp-$name-$prof$SUF" "$doc" $prof --replay=$port "$@" | sed -E 's/\| mocks.*//' | cut -c1-470
kill $pid
