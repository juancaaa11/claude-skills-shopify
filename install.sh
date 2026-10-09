#!/usr/bin/env bash
# Copia las skills de este repositorio a la carpeta de skills personales de Claude Code.
# Uso (macOS, Linux o Git Bash, desde la carpeta del repositorio):
#   ./install.sh                 # a ~/.claude/skills
#   ./install.sh /otra/carpeta   # a otra carpeta de skills
set -euo pipefail

origen="$(cd "$(dirname "$0")" && pwd)/skills"
destino="${1:-$HOME/.claude/skills}"
[ -d "$origen" ] || { echo "No encuentro la carpeta 'skills' junto a este script." >&2; exit 1; }

mkdir -p "$destino"
for skill in "$origen"/*/; do
  nombre="$(basename "$skill")"
  # Se sustituye la carpeta entera: así no quedan archivos de una versión anterior.
  rm -rf "${destino:?}/$nombre"
  cp -R "$skill" "$destino/$nombre"
  echo "  $nombre  ->  $destino/$nombre  ($(find "$destino/$nombre" -type f | wc -l | tr -d ' ') archivos)"
done
echo
echo "Listo. Abre una sesión nueva de Claude Code: las skills se cargan al empezar."
