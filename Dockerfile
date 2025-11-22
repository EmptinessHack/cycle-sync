# Dockerfile multi-stage para cycle-sync
# Stage 1: Dependencias y build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Build de la aplicación
RUN npm run build

# Stage 2: Servidor de desarrollo (para desarrollo local)
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo devDependencies para desarrollo)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando para desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Producción (servidor estático con nginx)
FROM nginx:alpine AS production

# Copiar los archivos build desde el stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada (opcional)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

