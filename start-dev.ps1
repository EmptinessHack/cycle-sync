# Script temporal para levantar el proyecto con npm
$env:PATH += ";C:\Program Files\nodejs"

Write-Host "Verificando Node.js..." -ForegroundColor Cyan
node --version
npm --version

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencias ya instaladas" -ForegroundColor Green
}

Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "El proyecto estará disponible en: http://localhost:8080" -ForegroundColor Cyan
npm run dev

