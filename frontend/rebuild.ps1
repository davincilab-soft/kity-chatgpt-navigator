param(
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'

# Rebuild the frontend extension bundle.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $scriptDir
try {
  if ($Clean) {
    Write-Host 'Cleaning dist...'
    npm run clean
  }

  Write-Host 'Building extension...'
  npm run build
}
finally {
  Pop-Location
}
