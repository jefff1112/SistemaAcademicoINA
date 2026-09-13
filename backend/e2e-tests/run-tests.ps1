<# 
.SYNOPSIS
Ejecuta tests E2E del Cuadro Auxiliar Digital con Playwright

.DESCRIPTION
Script PowerShell para ejecutar los tests automatizados con configuración adecuada
#>

param(
    [string]$Mode = "headed",           # headed, headless, ui
    [string]$Filter = "",               # Filtro de tests (ej: "Flujo completo")
    [string]$BaseUrl = "http://localhost:3000",
    [string]$ApiUrl = "http://localhost:5228/api"
)

# Colores para output
$green = [ConsoleColor]::Green
$yellow = [ConsoleColor]::Yellow
$red = [ConsoleColor]::Red
$cyan = [ConsoleColor]::Cyan

function Write-Color($msg, $color) {
    $orig = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $color
    Write-Host $msg
    $Host.UI.RawUI.ForegroundColor = $orig
}

Write-Color "═══════════════════════════════════════════" $cyan
Write-Color "  TESTS E2E - CUADRO AUXILIAR DIGITAL" $cyan
Write-Color "═══════════════════════════════════════════" $cyan

# Verificar dependencias
Write-Color "`n📦 Verificando dependencias..." $yellow
if (-not (Test-Path "node_modules/@playwright/test")) {
    Write-Color "  Instalando @playwright/test..." $yellow
    npm install -D @playwright/test
}
if (-not (Test-Path "node_modules/xlsx")) {
    Write-Color "  Instalando xlsx..." $yellow
    npm install xlsx
}

# Instalar navegadores si no existen
Write-Color "`n🌐 Verificando navegadores Playwright..." $yellow
npx playwright install chromium --with-deps 2>&1 | Out-Null

# Configurar variables de entorno
$env:BASE_URL = $BaseUrl
$env:API_URL = $ApiUrl
$env:HEADLESS = if ($Mode -eq "headed") { "false" } else { "true" }

Write-Color "`n🚀 Ejecutando tests..." $green
Write-Color "  Mode: $Mode" $cyan
Write-Color "  Base URL: $BaseUrl" $cyan
Write-Color "  API URL: $ApiUrl" $cyan
if ($Filter) { Write-Color "  Filtro: $Filter" $cyan }

# Construir comando
$cmd = "npx playwright test e2e-tests/cuadro-auxiliar.test.js"
if ($Mode -eq "ui") { $cmd += " --ui" }
elseif ($Mode -eq "headed") { $cmd += " --headed" }
if ($Filter) { $cmd += " -g `"$Filter`"" }
$cmd += " --reporter=html,line"

Write-Color "`nComando: $cmd" $yellow
Write-Color "`n" $cyan

# Ejecutar
try {
    & cmd /c $cmd
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Color "`n✅ TODOS LOS TESTS PASARON" $green
    } else {
        Write-Color "`n❌ ALGUNOS TESTS FALLARON (código: $exitCode)" $red
        Write-Color "  Ver reporte: npx playwright show-report" $yellow
    }
    
    exit $exitCode
}
catch {
    Write-Color "`n❌ ERROR EJECUTANDO TESTS: $_" $red
    exit 1
}