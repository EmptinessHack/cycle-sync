# Guía de Docker para Cycle Sync

Esta guía te ayudará a ejecutar el proyecto usando Docker, evitando problemas con versiones de Node.js y dependencias.

## Requisitos Previos

- Docker Desktop instalado (https://www.docker.com/products/docker-desktop)
- Docker Compose (incluido en Docker Desktop)

## Configuración Inicial

### 1. Crear archivo de variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Privy Configuration
# Obtén tu App ID desde https://dashboard.privy.io
VITE_PRIVY_APP_ID=tu-privy-app-id-aqui

# Node Environment
NODE_ENV=development
```

> **Nota:** Si no tienes un Privy App ID, puedes dejar `VITE_PRIVY_APP_ID` vacío. El proyecto funcionará en modo demo.

## Uso con Docker Compose (Recomendado)

### Desarrollo

#### Opción 1: Usando el script helper (Windows)

```powershell
# Iniciar el servidor (crea .env automáticamente si no existe)
.\docker-dev.ps1 start

# O simplemente
.\docker-dev.ps1
```

#### Opción 2: Comandos directos

```bash
# Construir y levantar el contenedor
docker-compose up --build

# O en modo detached (en segundo plano)
docker-compose up -d --build
```

El servidor estará disponible en: **http://localhost:8080**

> **Nota:** El archivo `.env` se carga automáticamente desde la raíz del proyecto. Si no existe, el script `docker-dev.ps1` lo creará automáticamente con valores por defecto.

### Detener el servidor

```bash
# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Ver logs

```bash
# Ver logs en tiempo real
docker-compose logs -f app-dev

# Ver logs de todos los servicios
docker-compose logs -f
```

### Reconstruir después de cambios en dependencias

```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Levantar de nuevo
docker-compose up
```

## Uso Directo con Docker

### Desarrollo

```bash
# Construir la imagen de desarrollo
docker build --target development -t cycle-sync-dev .

# Ejecutar el contenedor
docker run -p 8080:8080 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --env-file .env \
  cycle-sync-dev
```

### Producción

```bash
# Construir la imagen de producción
docker build --target production -t cycle-sync-prod .

# Ejecutar el contenedor
docker run -p 80:80 cycle-sync-prod
```

## Comandos Útiles

### Acceder al contenedor

```bash
# Ejecutar comandos dentro del contenedor
docker-compose exec app-dev sh

# O con docker directo
docker exec -it cycle-sync-dev sh
```

### Reinstalar dependencias

```bash
# Dentro del contenedor
docker-compose exec app-dev npm install

# O reconstruir la imagen
docker-compose build --no-cache app-dev
```

### Limpiar Docker

```bash
# Eliminar contenedores, redes y volúmenes
docker-compose down -v

# Eliminar imágenes no utilizadas
docker image prune -a

# Limpieza completa (cuidado: elimina todo)
docker system prune -a --volumes
```

## Solución de Problemas

### Puerto 8080 ya en uso

Si el puerto 8080 está ocupado, puedes cambiarlo en `docker-compose.yml`:

```yaml
ports:
  - "3000:8080"  # Cambia 3000 por el puerto que prefieras
```

### Problemas con hot-reload

Si los cambios no se reflejan automáticamente:

1. Verifica que el volumen esté montado correctamente en `docker-compose.yml`
2. Reinicia el contenedor: `docker-compose restart app-dev`
3. Verifica los permisos de archivos

### Error de permisos en macOS/Linux

```bash
# Dar permisos al directorio
sudo chown -R $USER:$USER .
```

### Reconstruir desde cero

```bash
# Eliminar todo y reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Scripts Helper

### Windows (PowerShell)

El script `docker-dev.ps1` facilita el manejo del proyecto:

```powershell
.\docker-dev.ps1 start      # Inicia el servidor
.\docker-dev.ps1 stop       # Detiene el servidor
.\docker-dev.ps1 restart    # Reinicia el servidor
.\docker-dev.ps1 logs       # Muestra logs en tiempo real
.\docker-dev.ps1 build      # Reconstruye la imagen
.\docker-dev.ps1 shell      # Abre shell en el contenedor
.\docker-dev.ps1 clean      # Limpia todo
.\docker-dev.ps1 help       # Muestra ayuda
```

### Linux/macOS (Bash)

El script `docker-dev.sh` proporciona la misma funcionalidad:

```bash
./docker-dev.sh start      # Inicia el servidor
./docker-dev.sh stop       # Detiene el servidor
# ... etc
```

## Estructura de Archivos Docker

- `Dockerfile`: Configuración multi-stage (desarrollo y producción)
- `docker-compose.yml`: Orquestación de servicios con soporte para `.env`
- `.dockerignore`: Archivos excluidos del build
- `docker-dev.ps1`: Script helper para Windows
- `docker-dev.sh`: Script helper para Linux/macOS

## Ventajas de usar Docker

✅ **Aislamiento**: No afecta tu sistema local  
✅ **Consistencia**: Mismo entorno en todos los equipos  
✅ **Reproducibilidad**: Mismo resultado siempre  
✅ **Fácil limpieza**: Elimina contenedores cuando no los necesites  
✅ **Sin conflictos**: No interfiere con otras versiones de Node.js instaladas  

## Próximos Pasos

Una vez que el contenedor esté corriendo:

1. Abre tu navegador en http://localhost:8080
2. Deberías ver la pantalla de bienvenida
3. Prueba el flujo de login
4. Verifica que el hot-reload funcione haciendo cambios en el código

