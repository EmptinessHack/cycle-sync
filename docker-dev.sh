#!/bin/bash

# Script helper para desarrollo con Docker
# Uso: ./docker-dev.sh [comando]

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Cycle Sync - Docker Helper${NC}"
    echo ""
    echo "Uso: ./docker-dev.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start     - Inicia el servidor de desarrollo (default)"
    echo "  stop      - Detiene el servidor"
    echo "  restart   - Reinicia el servidor"
    echo "  logs      - Muestra los logs en tiempo real"
    echo "  build     - Reconstruye la imagen sin caché"
    echo "  shell     - Abre una shell dentro del contenedor"
    echo "  clean     - Limpia contenedores, imágenes y volúmenes"
    echo "  help      - Muestra esta ayuda"
    echo ""
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}Error: Docker no está instalado${NC}"
        echo "Por favor instala Docker Desktop desde https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${YELLOW}Error: Docker Compose no está disponible${NC}"
        exit 1
    fi
}

# Verificar si existe .env
check_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Advertencia: No se encontró archivo .env${NC}"
        echo "Creando archivo .env de ejemplo..."
        echo "VITE_PRIVY_APP_ID=" > .env
        echo "NODE_ENV=development" >> .env
        echo -e "${GREEN}Archivo .env creado. Puedes editarlo para agregar tu VITE_PRIVY_APP_ID${NC}"
    fi
}

# Comando por defecto
COMMAND=${1:-start}

case $COMMAND in
    start)
        check_docker
        check_env
        echo -e "${GREEN}Iniciando servidor de desarrollo...${NC}"
        docker-compose up --build
        ;;
    stop)
        check_docker
        echo -e "${GREEN}Deteniendo servidor...${NC}"
        docker-compose down
        ;;
    restart)
        check_docker
        echo -e "${GREEN}Reiniciando servidor...${NC}"
        docker-compose restart
        ;;
    logs)
        check_docker
        echo -e "${GREEN}Mostrando logs (Ctrl+C para salir)...${NC}"
        docker-compose logs -f app-dev
        ;;
    build)
        check_docker
        echo -e "${GREEN}Reconstruyendo imagen sin caché...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}Imagen reconstruida. Ejecuta './docker-dev.sh start' para iniciar${NC}"
        ;;
    shell)
        check_docker
        echo -e "${GREEN}Abriendo shell en el contenedor...${NC}"
        docker-compose exec app-dev sh
        ;;
    clean)
        check_docker
        echo -e "${YELLOW}¿Estás seguro de que quieres limpiar todo? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo -e "${GREEN}Limpiando contenedores, imágenes y volúmenes...${NC}"
            docker-compose down -v
            docker image prune -f
            echo -e "${GREEN}Limpieza completada${NC}"
        else
            echo "Operación cancelada"
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}Comando desconocido: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

