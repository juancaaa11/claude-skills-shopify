# Copia las skills de este repositorio a la carpeta de skills personales de Claude Code.
# Uso (PowerShell, desde la carpeta del repositorio):
#   powershell -ExecutionPolicy Bypass -File .\instalar.ps1
#   powershell -ExecutionPolicy Bypass -File .\instalar.ps1 -Destino "D:\otra\carpeta\skills"
param(
  [string]$Destino = (Join-Path $HOME ".claude\skills")
)

$ErrorActionPreference = "Stop"
$origen = Join-Path $PSScriptRoot "skills"
if (-not (Test-Path $origen)) { throw "No encuentro la carpeta 'skills' junto a este script." }

New-Item -ItemType Directory -Force -Path $Destino | Out-Null
foreach ($skill in Get-ChildItem -Directory $origen) {
  $objetivo = Join-Path $Destino $skill.Name
  # Se sustituye la carpeta entera: así no quedan archivos de una versión anterior.
  if (Test-Path $objetivo) { Remove-Item -Recurse -Force -Confirm:$false $objetivo }
  Copy-Item -Recurse $skill.FullName $objetivo
  $archivos = (Get-ChildItem -Recurse -File $objetivo).Count
  Write-Host ("  {0}  ->  {1}  ({2} archivos)" -f $skill.Name, $objetivo, $archivos)
}
Write-Host ""
Write-Host "Listo. Abre una sesion nueva de Claude Code: las skills se cargan al empezar."
