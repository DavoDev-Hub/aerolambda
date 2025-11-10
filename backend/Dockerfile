# Etapa 1: Build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto (se sobrescriben con docker-compose)
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "dist/server.js"]