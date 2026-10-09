# Crea un .zip por skill en la carpeta dist\ (para subirlas a claude.ai, que las admite como archivo ZIP).
# Uso: powershell -ExecutionPolicy Bypass -File .\empaquetar.ps1
$ErrorActionPreference = "Stop"
$origen = Join-Path $PSScriptRoot "skills"
$dist = Join-Path $PSScriptRoot "dist"
New-Item -ItemType Directory -Force -Path $dist | Out-Null

foreach ($skill in Get-ChildItem -Directory $origen) {
  $zip = Join-Path $dist ($skill.Name + ".zip")
  if (Test-Path $zip) { Remove-Item -Force -Confirm:$false $zip }
  # Se comprime la carpeta (no su contenido): dentro del zip queda <nombre-de-la-skill>\SKILL.md.
  Compress-Archive -Path $skill.FullName -DestinationPath $zip
  Write-Host ("  {0}  ({1:N0} KB)" -f $zip, ((Get-Item $zip).Length / 1KB))
}
