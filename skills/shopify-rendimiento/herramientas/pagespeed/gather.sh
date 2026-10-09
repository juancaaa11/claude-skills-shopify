#!/bin/bash
# gather.sh <carpeta> <url>: guarda los artefactos de una pasada de Lighthouse (móvil, como PageSpeed) para
# analizarlos con graph.js y whatif.mjs sin repetirla. Si la carpeta ya existe, se sobrescriben sus archivos.
[ -z "$CHROME_PATH" ] && [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ] && export CHROME_PATH="/c/Program Files/Google/Chrome/Application/chrome.exe"
dir=${1:?uso: gather.sh <carpeta> <url>}; url=${2:?falta la url}
npx --yes lighthouse@12 "$url" --only-categories=performance --form-factor=mobile -G="./$dir" \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --use-angle=swiftshader" --quiet >/dev/null 2>&1
ls "$dir" | tr '\n' ' '
