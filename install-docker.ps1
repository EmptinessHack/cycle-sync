# Script de instalación de Docker Desktop para Windows
# IMPORTANTE: Ejecutar este script como Administrador
# Click derecho en PowerShell > Ejecutar como administrador

Write-Host "=== Instalador de Docker Desktop para Cycle Sync ===" -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Cierra esta ventana" -ForegroundColor Yellow
    Write-Host "2. Click derecho en PowerShell" -ForegroundColor Yellow
    Write-Host "3. Selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    Write-Host "4. Navega a: $PWD" -ForegroundColor Yellow
    Write-Host "5. Ejecuta: .\install-docker.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✓ Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# Paso 1: Verificar y habilitar WSL
Write-Host "Paso 1: Verificando WSL (Windows Subsystem for Linux)..." -ForegroundColor Cyan
$wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -ErrorAction SilentlyContinue
if ($wslFeature.State -eq "Enabled") {
    Write-Host "✓ WSL ya está habilitado" -ForegroundColor Green
} else {
    Write-Host "Habilitando WSL..." -ForegroundColor Yellow
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
    Write-Host "✓ WSL habilitado (puede requerir reinicio)" -ForegroundColor Green
}

# Paso 2: Verificar y habilitar Virtual Machine Platform
Write-Host ""
Write-Host "Paso 2: Verificando Virtual Machine Platform..." -ForegroundColor Cyan
$vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue
if ($vmFeature.State -eq "Enabled") {
    Write-Host "✓ Virtual Machine Platform ya está habilitado" -ForegroundColor Green
} else {
    Write-Host "Habilitando Virtual Machine Platform..." -ForegroundColor Yellow
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All -NoRestart
    Write-Host "✓ Virtual Machine Platform habilitado (puede requerir reinicio)" -ForegroundColor Green
}

# Paso 3: Verificar WSL 2
Write-Host ""
Write-Host "Paso 3: Verificando WSL 2..." -ForegroundColor Cyan
$wslVersion = wsl --status 2>&1
if ($wslVersion -match "WSL version: 2" -or $wslVersion -match "Default Version: 2") {
    Write-Host "✓ WSL 2 está configurado" -ForegroundColor Green
} else {
    Write-Host "Configurando WSL 2 como versión predeterminada..." -ForegroundColor Yellow
    wsl --set-default-version 2 2>&1 | Out-Null
    Write-Host "✓ WSL 2 configurado" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Si WSL 2 no está instalado, descarga e instala el kernel desde:" -ForegroundColor Yellow
    Write-Host "https://aka.ms/wsl2kernel" -ForegroundColor Cyan
    Write-Host ""
}

# Paso 4: Verificar si Docker Desktop ya está instalado
Write-Host ""
Write-Host "Paso 4: Verificando Docker Desktop..." -ForegroundColor Cyan
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
)

$dockerInstalled = $false
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        Write-Host "✓ Docker Desktop encontrado en: $path" -ForegroundColor Green
        $dockerInstalled = $true
        break
    }
}

if (-not $dockerInstalled) {
    Write-Host "Docker Desktop no está instalado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Paso 5: Descarga e Instalación de Docker Desktop" -ForegroundColor Cyan
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Abre tu navegador y ve a: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host "2. Descarga Docker Desktop para Windows" -ForegroundColor Yellow
    Write-Host "3. Ejecuta el instalador" -ForegroundColor Yellow
    Write-Host "4. Durante la instalación, asegúrate de seleccionar 'Use WSL 2 instead of Hyper-V'" -ForegroundColor Yellow
    Write-Host "5. Reinicia tu computadora si se solicita" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Después de instalar Docker Desktop:" -ForegroundColor Cyan
    Write-Host "- Abre Docker Desktop desde el menú Inicio" -ForegroundColor Yellow
    Write-Host "- Espera a que inicie completamente" -ForegroundColor Yellow
    Write-Host "- Luego ejecuta: .\docker-dev.ps1 start" -ForegroundColor Green
    Write-Host ""
    
    # Abrir el navegador automáticamente
    $openBrowser = Read-Host "¿Quieres que abra el navegador para descargar Docker Desktop? (S/N)"
    if ($openBrowser -eq "S" -or $openBrowser -eq "s" -or $openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://www.docker.com/products/docker-desktop"
    }
} else {
    Write-Host ""
    Write-Host "Paso 5: Verificando si Docker Desktop está corriendo..." -ForegroundColor Cyan
    $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerProcess) {
        Write-Host "✓ Docker Desktop está corriendo" -ForegroundColor Green
    } else {
        Write-Host "Iniciando Docker Desktop..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        Write-Host "Espera 30-60 segundos a que Docker Desktop inicie completamente..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

Write-Host ""
Write-Host "=== Instalación completada ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Si se solicitó reinicio, reinicia tu computadora" -ForegroundColor Yellow
Write-Host "2. Abre Docker Desktop y espera a que inicie" -ForegroundColor Yellow
Write-Host "3. En una nueva terminal (no como admin), ejecuta:" -ForegroundColor Yellow
Write-Host "   .\docker-dev.ps1 start" -ForegroundColor Green
Write-Host ""
pause

