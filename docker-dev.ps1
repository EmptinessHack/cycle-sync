# Script helper para desarrollo con Docker en Windows
# Uso: .\docker-dev.ps1 [comando]

param(
    [Parameter(Position=0)]
    [string]$Command = "start"
)

# Colores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-ColorOutput Cyan "Cycle Sync - Docker Helper"
    Write-Output ""
    Write-Output "Uso: .\docker-dev.ps1 [comando]"
    Write-Output ""
    Write-Output "Comandos disponibles:"
    Write-Output "  start     - Inicia el servidor de desarrollo (default)"
    Write-Output "  stop      - Detiene el servidor"
    Write-Output "  restart   - Reinicia el servidor"
    Write-Output "  logs      - Muestra los logs en tiempo real"
    Write-Output "  build     - Reconstruye la imagen sin caché"
    Write-Output "  shell     - Abre una shell dentro del contenedor"
    Write-Output "  clean     - Limpia contenedores, imágenes y volúmenes"
    Write-Output "  help      - Muestra esta ayuda"
    Write-Output ""
}

function Test-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ColorOutput Yellow "Error: Docker no está instalado o no está en el PATH"
        Write-Output "Por favor:"
        Write-Output "1. Instala Docker Desktop desde https://www.docker.com/products/docker-desktop"
        Write-Output "2. Asegúrate de que Docker Desktop esté corriendo"
        Write-Output "3. Reinicia PowerShell o tu terminal"
        exit 1
    }

    # Verificar que Docker esté corriendo
    $dockerRunning = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Yellow "Error: Docker Desktop no está corriendo"
        Write-Output "Por favor inicia Docker Desktop y vuelve a intentar"
        exit 1
    }

    # Verificar Docker Compose (nueva sintaxis: docker compose)
    $composeCheck = docker compose version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Yellow "Advertencia: Docker Compose no está disponible"
        Write-Output "Asegúrate de tener Docker Desktop actualizado"
    }
}

function Test-EnvFile {
    if (-not (Test-Path .env)) {
        Write-ColorOutput Yellow "Advertencia: No se encontró archivo .env"
        Write-Output "Creando archivo .env de ejemplo..."
        @"
# Privy Configuration
# Obtén tu App ID desde https://dashboard.privy.io
# Si no tienes uno, puedes dejar esto vacío y el proyecto funcionará en modo demo
VITE_PRIVY_APP_ID=

# Node Environment
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
        Write-ColorOutput Green "Archivo .env creado. Puedes editarlo para agregar tu VITE_PRIVY_APP_ID"
    }
}

# Ejecutar comando
switch ($Command.ToLower()) {
    "start" {
        Test-Docker
        Test-EnvFile
        Write-ColorOutput Green "Iniciando servidor de desarrollo..."
        docker compose up --build
    }
    "stop" {
        Write-ColorOutput Green "Deteniendo servidor..."
        docker compose down
    }
    "restart" {
        Write-ColorOutput Green "Reiniciando servidor..."
        docker compose restart
    }
    "logs" {
        Write-ColorOutput Green "Mostrando logs..."
        docker compose logs -f app-dev
    }
    "build" {
        Test-Docker
        Write-ColorOutput Green "Reconstruyendo imagen sin caché..."
        docker compose build --no-cache
        Write-ColorOutput Green "Imagen reconstruida. Ejecuta 'start' para levantar el servidor."
    }
    "shell" {
        Write-ColorOutput Green "Abriendo shell en el contenedor..."
        docker exec -it cycle-sync-dev sh
    }
    "clean" {
        Write-ColorOutput Yellow "Limpiando contenedores, imágenes y volúmenes..."
        docker compose down -v
        docker rmi cycle-sync-dev 2>$null
        Write-ColorOutput Green "Limpieza completada."
    }
    "help" {
        Show-Help
    }
    default {
        Write-ColorOutput Yellow "Comando desconocido: $Command"
        Write-Output ""
        Show-Help
    }
}

