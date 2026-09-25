# Stage 1: Build de la SPA con Node 22
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias del monorepo
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Instalar dependencias limpias
RUN npm ci

# Copiar código fuente del frontend
COPY apps/web/ ./apps/web/

# Compilar TypeScript y bundle de producción Vite
RUN npm run build --workspace=@aws-quest/web

# Stage 2: Servidor Nginx ligero de producción
FROM nginx:1.27-alpine AS runner

# Copiar configuración personalizada de Nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar distribución estática compilada desde el builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Exponer puerto HTTP estándar
EXPOSE 80

# Healthcheck interno del contenedor web
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=5s \
  CMD wget -qO- http://127.0.0.1:80/health || exit 1

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
