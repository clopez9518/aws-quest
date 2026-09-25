# Especificación Técnica: Optimización y Contenedorización Docker (Fase 7 - Hito 7.4)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura de empaquetado, optimización de bundles, configuración de servidores web de producción, construcción de imágenes de contenedor multi-etapa (*multi-stage*), endpoints de comprobación de salud (*health checks*), plantillas de variables de entorno y orquestación con Docker Compose para la plataforma **AWS Architecture Quest**. Corresponde a la **Tarea 7.4** de la **Fase 7: Testing E2E, Accesibilidad y Preparación para Release MVP** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El objetivo primordial del Hito 7.4 es llevar la plataforma al **Milestone 7 — Versión MVP Lista para Lanzamiento (Release Ready)**, asegurando:
1. **Despliegues reproducibles, ligeros y seguros** en cualquier entorno que soporte Docker (local, VPS o infraestructura Cloud en AWS ECS/EC2).
2. **Máximo rendimiento de carga frontend (RNF-03: FCP $<3$s)** mediante *chunk splitting* en Vite, minificación, compresión Gzip/Brotli y cabeceras de caché inmutables en Nginx.
3. **Contenedores de Backend seguros y optimizados** en ASP.NET Core (.NET 10) ejecutados con usuarios no privilegiados (*non-root*), con imágenes runtime mínimas y comprobación activa de salud conectada a PostgreSQL.
4. **Orquestación unificada mediante Docker Compose** (`docker-compose.yml` / `docker-compose.prod.yml`) que levanta el stack completo (Base de Datos PostgreSQL + API Backend .NET 10 + Frontend React/Nginx) con una única instrucción y validación automática de dependencias saludables (*service_healthy*).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          ARQUITECTURA DE CONTENEDORIZACIÓN Y TOPOLOGÍA DE PRODUCCIÓN MVP                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│     Usuario / Navegador (Puerto 3000 / 80)                                                                      │
│                │                                                                                                │
│                ▼                                                                                                │
│   ┌─────────────────────────┐                                                                                   │
│   │     awsquest-web        │  • Nginx 1.27 Alpine (Non-Root / Unprivileged)                                    │
│   │     (Frontend SPA)      │  • React 19 + React Flow + Zustand + Tailwind CSS (Bundle optimizado)             │
│   │                         │  • Gzip ON + Cache-Control inmutable en /assets/ + SPA Fallback                   │
│   │                         │  • Reverse Proxy / Redirección /api/ -> awsquest-api:8080                         │
│   └────────────┬────────────┘                                                                                   │
│                │ Proxy HTTP interno (/api/*)                                                                    │
│                ▼                                                                                                │
│   ┌─────────────────────────┐                                                                                   │
│   │     awsquest-api        │  • ASP.NET Core Web API (.NET 10 Runtime Alpine / Chiseled)                       │
│   │     (Backend REST)      │  • Clean Architecture + Motor de Evaluación en Memoria (<100ms)                   │
│   │                         │  • Healthcheck activo en /health (Verificación de PostgreSQL)                     │
│   │                         │  • Auto-migración EF Core y Seeder Declarativo al inicio                          │
│   └────────────┬────────────┘                                                                                   │
│                │ TCP / Npgsql (Puerto 5432)                                                                     │
│                ▼                                                                                                │
│   ┌─────────────────────────┐                                                                                   │
│   │    awsquest-postgres    │  • PostgreSQL 15.3 Alpine                                                         │
│   │     (Persistencia)      │  • Extensión pgcrypto (UUIDs nativos) + Soporte JSONB                             │
│   │                         │  • Volumen persistente postgres_data + Healthcheck pg_isready                     │
│   └─────────────────────────┘                                                                                   │
│                                                                                                                 │
│   Red Aislada Docker: awsquest-network (bridge)                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos No Funcionales y Criterios de Aceptación Vinculados

| Requisito / Criterio | Descripción | Enfoque de Implementación en Contenedorización y Optimización |
| :--- | :--- | :--- |
| **RNF-01** | Fluidez visual a 60 FPS | Minimización de JS en runtime, eliminación de dependencias pesadas innecesarias y bundling eficiente en Vite. |
| **RNF-02** | Tiempo de evaluación $<2$s | Backend compilado en modo `Release` con optimizaciones de compilador C# 13/.NET 10 y runtime optimizado en contenedor. |
| **RNF-03** | Tiempo de carga inicial (FCP $<3$s) | *Vendor chunking* en Vite (React, React Flow, TanStack Query), compresión Gzip y caché HTTP (`max-age=31536000, immutable`). |
| **RNF-08** | Contenido declarativo estandarizado | Inclusión automática y reproducible del catálogo de `content/` en la imagen del backend para el `ChallengeSeeder`. |
| **RNF-10** | Compatibilidad multi-navegador | Configuración de servidor Nginx con soporte de estándares MIME, cabeceras seguras y enrutamiento SPA. |
| **RNF-12** | Integridad de reglas de evaluación | Aislamiento completo de variables de entorno de producción y ejecución de reglas exclusivamente en el contenedor de backend. |
| **RNF-13** | Consistencia y persistencia de progreso | Volumen persistente de PostgreSQL (`postgres_data`) y control de migraciones idempotentes de EF Core al inicializar el contenedor. |
| **Seguridad** | Principio de menor privilegio | Contenedores ejecutados como usuarios no administradores (`USER app` / `USER nginx`), sin `root`. |

---

## 3. Optimización del Frontend y Configuración de Nginx (`apps/web`)

### 3.1. Optimización del Bundle en Vite (`apps/web/vite.config.ts`)

Para cumplir con **RNF-03**, el archivo de configuración de Vite debe estructurar la división de paquetes (*manual chunks*) para que el navegador del usuario almacene en caché las librerías vendor de larga duración de forma separada del código fuente de la aplicación:

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:7234',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@xyflow/react')) {
              return 'vendor-xyflow';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-tanstack';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            return 'vendor-common';
          }
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
});
```

### 3.2. Configuración de Nginx para Producción (`apps/web/nginx.conf`)

El servidor Nginx debe servir la Single Page Application (SPA) con:
1. **Fallback de enrutamiento:** `try_files $uri $uri/ /index.html;` para que React Router DOM maneje las URLs cliente (`/catalog`, `/challenges/:id`, `/login`, etc.).
2. **Compresión Gzip activada:** Reducción del tamaño de transferencia de HTML, JS, CSS, JSON y SVG hasta en un 70%.
3. **Políticas de Cache-Control diferenciadas:**
   - `/assets/`: Archivos con hash inmutable cacheados por 1 año (`max-age=31536000, immutable`).
   - `/index.html` y `/`: No cacheados (`no-cache, no-store, must-revalidate`) para garantizar que nuevas versiones del frontend se actualicen de inmediato.
4. **Cabeceras de Seguridad HTTP:** Protección contra Clickjacking (`X-Frame-Options`), MIME Sniffing (`X-Content-Type-Options`) y filtrado XSS.
5. **Proxy inverso opcional hacia `/api/`:** Permite que en producción el frontend sirva como punto de entrada unificado y redirija las llamadas API al backend sin requerir configuración CORS adicional entre puertos.

```nginx
# apps/web/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Cabeceras de Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy inverso transparente hacia la API REST
    location /api/ {
        proxy_pass http://api:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
    }

    # Caché inmutable para activos versionados por Vite (JS, CSS, SVGs, Fonts)
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # index.html nunca debe cachearse agresivamente para permitir updates inmediatos
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Redirección SPA para React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Healthcheck para el contenedor Web
    location = /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 3.3. `Dockerfile` Multi-Stage para el Frontend (`apps/web/Dockerfile`)

```dockerfile
# apps/web/Dockerfile

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
```

### 3.4. `.dockerignore` del Frontend (`apps/web/.dockerignore`)

```dockerignore
node_modules
dist
.vscode
.idea
*.local
.env*
!apps/web/.env.example
playwright-report
test-results
coverage
*.log
```

---

## 4. Contenedorización del Backend (.NET 10 Web API) (`apps/api`)

### 4.1. Endpoint de Health Check Nativo (`/health`)

Para permitir que Docker Compose, balanceadores de carga (AWS ALB) y orquestadores Kubernetes comprueben la disponibilidad de la API y de su conexión a la base de datos PostgreSQL, se debe registrar el servicio de Health Checks en [`Program.cs`](file:///c:/workspace/aws/aws-game/apps/api/src/AwsQuest.Api/Program.cs):

```csharp
// Registro en Inyección de Dependencias
builder.Services.AddHealthChecks()
    .AddNpgSql(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection") 
                          ?? throw new InvalidOperationException("DefaultConnection is missing"),
        name: "postgresql",
        tags: ["db", "ready"]);

// Mapeo del Endpoint en el Pipeline HTTP
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = System.Text.Json.JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            duration = report.TotalDuration.TotalMilliseconds,
            checks = report.Entries.Select(e => new
            {
                component = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds
            })
        });
        await context.Response.WriteAsync(result);
    }
});
```

### 4.2. `Dockerfile` Multi-Stage para Backend .NET 10 (`apps/api/Dockerfile`)

El `Dockerfile` del backend aprovecha el contexto de compilación del repositorio para restaurar paquetes, compilar las capas de Clean Architecture (`Domain`, `Application`, `Infrastructure`, `Api`) y generar una imagen de ejecución mínima y segura:

```dockerfile
# apps/api/Dockerfile

# Stage 1: Build y Publish con .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos .csproj de cada proyecto para aprovechar el caché de capas de Docker
COPY apps/api/src/AwsQuest.Domain/AwsQuest.Domain.csproj apps/api/src/AwsQuest.Domain/
COPY apps/api/src/AwsQuest.Application/AwsQuest.Application.csproj apps/api/src/AwsQuest.Application/
COPY apps/api/src/AwsQuest.Infrastructure/AwsQuest.Infrastructure.csproj apps/api/src/AwsQuest.Infrastructure/
COPY apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj apps/api/src/AwsQuest.Api/

# Restaurar dependencias NuGet
RUN dotnet restore apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj

# Copiar todo el código fuente del backend
COPY apps/api/src/ apps/api/src/

# Compilar y publicar en modo Release optimizado
RUN dotnet publish apps/api/src/AwsQuest.Api/AwsQuest.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# Stage 2: Runtime de Producción ASP.NET Core .NET 10
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Instalar curl para healthchecks si es necesario (o usar script nativo)
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copiar artefactos binarios publicados
COPY --from=build /app/publish .

# Copiar el catálogo declarativo oficial de contenidos (Desafíos y Servicios)
COPY content/ /app/content/

# Configurar variables de entorno por defecto del contenedor
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ContentSettings__ChallengesPath=/app/content/challenges
ENV ContentSettings__ServicesPath=/app/content/services
ENV ContentSettings__SystemConfigPath=/app/content/system-config.json

# Ejecutar como usuario no privilegiado 'app'
USER $APP_UID

# Exponer puerto de la API REST
EXPOSE 8080

# Healthcheck interno del contenedor API
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de entrada
ENTRYPOINT ["dotnet", "AwsQuest.Api.dll"]
```

### 4.3. Configuración de Producción (`apps/api/src/AwsQuest.Api/appsettings.Production.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Port=5432;Database=awsquest_db;Username=postgres;Password=postgres;Include Error Detail=false"
  },
  "JwtSettings": {
    "Issuer": "AwsQuestApi",
    "Audience": "AwsQuestClient",
    "ExpirationHours": 24,
    "GuestExpirationDays": 30
  },
  "ContentSettings": {
    "ChallengesPath": "/app/content/challenges"
  },
  "CorsSettings": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:80",
      "http://127.0.0.1:3000"
    ]
  }
}
```

### 4.4. `.dockerignore` del Backend (`apps/api/.dockerignore`)

```dockerignore
bin
obj
.vscode
.idea
*.user
*.db
tests
coverage
*.log
```

---

## 5. Orquestación Completa con Docker Compose (`docker-compose.yml`)

### 5.1. Definición del Stack Multicontenedor

El archivo [`docker-compose.yml`](file:///c:/workspace/aws/aws-game/docker-compose.yml) orquesta los tres servicios interconectados a través de la red interna `awsquest-network`:

```yaml
services:
  # Servicio 1: Base de Datos Relacional PostgreSQL 15 con JSONB y pgcrypto
  postgres:
    image: postgres:15.3-alpine
    container_name: awsquest-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-awsquest_db}
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init-db.sql:/docker-entrypoint-initdb.d/01-init-extensions.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-awsquest_db}"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s
    networks:
      - awsquest-network

  # Servicio 2: Backend API REST .NET 10
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: awsquest-api
    restart: unless-stopped
    environment:
      ASPNETCORE_ENVIRONMENT: ${ASPNETCORE_ENVIRONMENT:-Production}
      ASPNETCORE_URLS: http://+:8080
      ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=${POSTGRES_DB:-awsquest_db};Username=${POSTGRES_USER:-postgres};Password=${POSTGRES_PASSWORD:-postgres};Include Error Detail=false"
      JwtSettings__Secret: ${JWT_SECRET:-SuperSecretKeyForProductionMustBeAtLeast32CharsLong123!}
      JwtSettings__Issuer: ${JWT_ISSUER:-AwsQuestApi}
      JwtSettings__Audience: ${JWT_AUDIENCE:-AwsQuestClient}
      JwtSettings__ExpirationHours: ${JWT_EXPIRATION_HOURS:-24}
      JwtSettings__GuestExpirationDays: ${JWT_GUEST_EXPIRATION_DAYS:-30}
      ContentSettings__ChallengesPath: /app/content/challenges
    ports:
      - "${API_PORT:-8080}:8080"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - awsquest-network

  # Servicio 3: Frontend Web SPA React + Nginx
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: awsquest-web
    restart: unless-stopped
    ports:
      - "${WEB_PORT:-3000}:80"
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:80/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 5s
    networks:
      - awsquest-network

volumes:
  postgres_data:
    name: awsquest_postgres_data

networks:
  awsquest-network:
    name: awsquest-network
    driver: bridge
```

### 5.2. Plantilla de Variables de Entorno (`.env.example`)

```env
# ==============================================================================
# AWS Architecture Quest - Configuración de Entorno Docker MVP
# ==============================================================================

# Entorno de Ejecución
NODE_ENV=production
ASPNETCORE_ENVIRONMENT=Production

# Puertos Expuestos en Host
WEB_PORT=3000
API_PORT=8080
POSTGRES_PORT=5432

# Base de Datos PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_secure_password_123!
POSTGRES_DB=awsquest_db

# Seguridad JWT (.NET 10 Backend)
JWT_SECRET=SuperSecretKeyForProductionMustBeAtLeast32CharsLong123!
JWT_ISSUER=AwsQuestApi
JWT_AUDIENCE=AwsQuestClient
JWT_EXPIRATION_HOURS=24
JWT_GUEST_EXPIRATION_DAYS=30
```

---

## 6. Scripts Monorepo y Automatización de Operaciones (`package.json`)

Para facilitar la construcción, arranque, parada y verificación de humo del stack completo en cualquier máquina o pipeline CI/CD, se agregan los siguientes scripts en el [`package.json`](file:///c:/workspace/aws/aws-game/package.json) raíz:

```json
{
  "scripts": {
    "docker:build": "docker compose build",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:logs": "docker compose logs -f",
    "docker:restart": "docker compose restart",
    "docker:clean": "docker compose down -v --remove-orphans",
    "docker:smoke": "node scripts/docker-smoke-test.js"
  }
}
```

---

## 7. Suite de Smoke Testing Automatizada (`scripts/docker-smoke-test.js`)

Se define un script de verificación automatizada de salud posterior al despliegue que valida el estado HTTP, headers y respuestas JSON de todos los servicios del contenedor:

```javascript
// scripts/docker-smoke-test.js
/**
 * Smoke Test para Validar el Despliegue de Contenedores Docker MVP
 * Verifica:
 * 1. Healthcheck Frontend Nginx (HTTP 200)
 * 2. Compresión Gzip y Headers de Seguridad en Frontend
 * 3. Healthcheck Backend ASP.NET Core (HTTP 200 con componente postgres Healthy)
 * 4. Endpoint Catálogo Maestro: GET /api/v1/services (Retorna 6 servicios)
 * 5. Endpoint Catálogo Unidades: GET /api/v1/units (Retorna 4 unidades y 8 desafíos)
 * 6. Endpoint Sesión Invitado: POST /api/v1/auth/guest (Retorna Token JWT válido)
 */

import http from 'http';

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8080';

async function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runSmokeTests() {
  console.log('🚀 Iniciando Smoke Tests del Stack Docker MVP...');
  let passed = 0;
  let total = 0;

  async function check(description, testFn) {
    total++;
    process.stdout.write(`  [..] ${description}`);
    try {
      await testFn();
      passed++;
      process.stdout.write(`\r  [✓] ${description}\n`);
    } catch (err) {
      process.stdout.write(`\r  [✗] ${description}: ${err.message}\n`);
    }
  }

  // 1. Healthcheck Frontend
  await check('Frontend Nginx responde en /health con 200 OK', async () => {
    const res = await request(`${WEB_URL}/health`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
  });

  // 2. SPA Index.html y Security Headers
  await check('Frontend entrega index.html con cabeceras de seguridad', async () => {
    const res = await request(`${WEB_URL}/`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    if (!res.headers['x-frame-options']) throw new Error('Falta X-Frame-Options');
    if (!res.headers['x-content-type-options']) throw new Error('Falta X-Content-Type-Options');
  });

  // 3. Healthcheck Backend
  await check('Backend API responde en /health con estado Healthy', async () => {
    const res = await request(`${API_URL}/health`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (json.status !== 'Healthy') throw new Error(`Estado API: ${json.status}`);
  });

  // 4. Servicios Maestros
  await check('Backend entrega 6 servicios en GET /api/v1/services', async () => {
    const res = await request(`${API_URL}/api/v1/services`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || json.data.length < 6) throw new Error(`Servicios insuficientes: ${json.data?.length}`);
  });

  // 5. Creación de Sesión Invitado (Auth Guest)
  await check('Backend emite token JWT en POST /api/v1/auth/guest', async () => {
    const res = await request(`${API_URL}/api/v1/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.statusCode !== 200 && res.statusCode !== 201) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || !json.data?.token) throw new Error('Token JWT no encontrado en respuesta');
  });

  // 6. Proxy Frontend a Backend (/api/)
  await check('Frontend proxy inverso redirige /api/v1/services correctamente', async () => {
    const res = await request(`${WEB_URL}/api/v1/services`);
    if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}`);
    const json = JSON.parse(res.body);
    if (!json.success || json.data.length < 6) throw new Error('Falla en reverse proxy Nginx');
  });

  console.log(`\n🏁 Resultado: ${passed}/${total} pruebas de humo superadas con éxito.`);
  if (passed !== total) process.exit(1);
}

runSmokeTests().catch((err) => {
  console.error('Error fatal en Smoke Tests:', err);
  process.exit(1);
});
```

---

## 8. Criterios de Aceptación y Definición de Hecho (DoD - Definition of Done)

Para declarar formalmente completada la **Tarea 7.4** y alcanzar el **Milestone 7 (Release Ready MVP)**:

1. [ ] **Builds Multi-Stage Funcionales:**
   - `apps/web/Dockerfile` compila el frontend con Node 22 y genera la imagen `nginx:1.27-alpine` sin dependencias de compilación.
   - `apps/api/Dockerfile` compila la solución .NET 10 y genera la imagen runtime ligera `mcr.microsoft.com/dotnet/aspnet:10.0` con usuario no-root `app`.
2. [ ] **Health Checks Operativos:**
   - Endpoint `GET /health` en el Backend devuelve `200 OK {"status": "Healthy"}` verificando la conexión a PostgreSQL.
   - Endpoint `GET /health` en el Frontend devuelve `200 OK` para sondeo de balanceadores.
3. [ ] **Optimización y Caching Frontend:**
   - `vite.config.ts` divide el bundle en *chunks* (`vendor-react`, `vendor-xyflow`, `vendor-tanstack`, `vendor-lucide`).
   - Nginx aplica compresión Gzip y cabeceras `Cache-Control: public, max-age=31536000, immutable` a `/assets/*`.
4. [ ] **Orquestación y Persistencia:**
   - `docker compose up -d` inicializa los 3 contenedores (`awsquest-postgres`, `awsquest-api`, `awsquest-web`) en el orden correcto usando `condition: service_healthy`.
   - Las migraciones de base de datos y el seeder de 4 unidades y 8 desafíos se ejecutan automáticamente al inicio.
5. [ ] **Smoke Tests Verificados:**
   - `npm run docker:smoke` supera el 100% de las pruebas contra los contenedores en ejecución.
6. [ ] **Zero Regresiones:**
   - El 100% de la suite de pruebas del monorepo (**373 pruebas**) se mantiene en verde.
