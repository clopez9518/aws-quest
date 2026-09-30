# ☁️ AWS Architecture Quest

> **Simulador interactivo y gamificado para el aprendizaje y validación de arquitecturas cloud en Amazon Web Services (AWS).**

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-600%2B%20Passing-brightgreen?style=flat-square)](apps/api/tests)

---

## 📖 Descripción General

**AWS Architecture Quest** es una plataforma educativa interactiva donde estudiantes, desarrolladores y arquitectos cloud resuelven desafíos de diseño arquitectónico sobre un lienzo visual interactivo. 

El sistema evalúa en tiempo real topologías de red, colocación de servicios (VPCs, Subnets públicas/privadas, Security Groups, Routing Tables, Gateways), patrones de resiliencia y el cumplimiento del **AWS Well-Architected Framework**.

---

## ✨ Características Principales

- 🎨 **Architecture Canvas Studio:** Lienzo visual basado en [@xyflow/react](https://reactflow.dev/) con soporte para contenedores de VPCs, Subredes, nodos de servicios AWS y conexiones dirigidas.
- 🚦 **Simulador de Flujo de Tráfico Dinámico:** Emisor de partículas animadas y HUD contextual que simula tráfico de red y diagnostica cuellos de botella y desconexiones.
- 🧩 **Currículum Pedagógico de 12 Unidades y 49 Desafíos:** Desde fundamentos de IaaS y redes hasta arquitecturas serverless, contenedores (ECS/EKS) y capstones de alta disponibilidad.
- ⚡ **Motor de Evaluación Determinista:** Analiza presencia de servicios, adyacencias topológicas, reglas de seguridad de Security Groups y antipatrones con feedback granular.
- 💡 **Sistema de Pistas Progresivo:** Desbloqueo de pistas pedagógicas con penalización controlada de XP y protección anti-cheat.
- 📚 **AWS Quest Dictionary:** Base de conocimiento integrada con enlaces contextuales, pilares del Well-Architected Framework y buscador interactivo.
- 👤 **Sesión de Invitado y Migración Fluida:** Inicio inmediato en Modo Invitado con migración automática del XP y progreso al registrarse.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura desacoplada de monorepo:

```text
aws-game/
├── apps/
│   ├── api/                     # Backend REST en .NET 10 (Clean Architecture)
│   │   ├── src/
│   │   │   ├── AwsQuest.Domain          # Entidades, Enums, Motor de Evaluación y Scoring
│   │   │   ├── AwsQuest.Application     # Casos de uso, DTOs y FluentValidation
│   │   │   ├── AwsQuest.Infrastructure  # EF Core, PostgreSQL, Seeders y AuthService
│   │   │   └── AwsQuest.Api             # Controladores REST, Middlewares y Program.cs
│   │   └── tests/                       # 260+ Pruebas Unitarias y de Integración
│   └── web/                     # Frontend SPA en React 19 + Vite + TypeScript
│       ├── src/
│       │   ├── features/                # auth, canvas, catalog, challenge, dictionary, evaluation
│       │   ├── routes/                  # React Router 7 con ErrorBoundary y NotFound
│       │   └── shared/                  # UI Components, Hooks, Stores Zustand y API Client
│       └── tests/                       # 340+ Pruebas Vitest (Unitarias y Accesibilidad)
├── content/                     # Catálogo declarativo (JSONs de Unidades, Desafíos y Diccionario)
├── docker/                      # Scripts de inicialización PostgreSQL (pgcrypto, uuid-ossp)
├── docs/                        # Documentación técnica y especificaciones funcionales
├── postman/                     # Colecciones y entornos de prueba de API
└── scripts/                     # Scripts de validación y smoke tests
```

---

## 🚀 Inicio Rápido con Docker Compose (Recomendado)

### Requisitos Previos
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose v2+.

### 1. Clonar y configurar entorno
```bash
# Clonar repositorio
git clone <URL_DEL_REPOSITORIO>
cd aws-game

# Copiar variables de entorno de ejemplo
cp .env.example .env
```

### 2. Levantar el stack completo
```bash
npm run docker:up
# o directamente:
docker compose up -d --build
```

### 3. Acceder a las aplicaciones
- 🌐 **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- 🔌 **API REST / Swagger UI:** [http://localhost:8080/swagger](http://localhost:8080/swagger)
- 🗄️ **PostgreSQL:** `localhost:5437` (`db: awsquest_db`, `user: postgres`)

---

## 💻 Desarrollo Local

### Requisitos Previos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/) y `npm`
- PostgreSQL 15 local o vía Docker

### 1. Base de Datos
Levanta únicamente PostgreSQL con Docker:
```bash
docker compose up -d postgres
```

### 2. Backend (.NET 10)
```bash
cd apps/api/src/AwsQuest.Api
dotnet run
```
La API iniciará en `http://localhost:5000` (o HTTPS en `https://localhost:7234`).

### 3. Frontend (React 19)
```bash
# En la raíz del repositorio
npm install
npm run dev:web
```
El frontend iniciará en `http://localhost:5173`.

---

## 🧪 Ejecución de Pruebas

El repositorio cuenta con más de **600 pruebas automatizadas** que cubren el 100% de los flujos críticos:

```bash
# Ejecutar todas las pruebas del frontend (Vitest)
npm run test:web

# Ejecutar pruebas unitarias del backend (.NET)
npm run test:unit:backend

# Ejecutar pruebas de integración del backend (.NET + PostgreSQL)
npm run test:integration:backend

# Verificación de tipos TypeScript
npm run lint:web

# Smoke tests de contenedores Docker
npm run docker:smoke
```

---

## ⚙️ Variables de Entorno

Variables principales definidas en [`.env.example`](.env.example):

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `WEB_PORT` | Puerto expuesto para la aplicación web | `3000` |
| `API_PORT` | Puerto expuesto para el backend ASP.NET Core | `8080` |
| `POSTGRES_PORT` | Puerto expuesto de PostgreSQL en el host | `5437` |
| `POSTGRES_USER` | Usuario de la base de datos | `postgres` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `POSTGRES_DB` | Nombre de la base de datos | `awsquest_db` |
| `JWT_SECRET` | Clave criptográfica para firma de tokens JWT | *(Clave de desarrollo)* |
| `JWT_EXPIRATION_HOURS` | Tiempo de expiración para usuarios registrados | `24` |
| `JWT_GUEST_EXPIRATION_DAYS`| Tiempo de retención para tokens de invitado | `30` |

---

## 📚 Documentación Adicional

Para más información técnica, consulta los documentos en el directorio [`docs/`](docs/):
- [`06-architecture.md`](docs/06-architecture.md): Arquitectura detallada del sistema.
- [`07-data-model.md`](docs/07-data-model.md): Modelo de datos y diagrama entidad-relación.
- [`08-api-spec.md`](docs/08-api-spec.md): Especificación formal de la API REST.
- [`10-game-mechanics.md`](docs/10-game-mechanics.md): Mecánicas de gamificación, puntuación y XP.
- [`24-production-deployment-audit-and-plan.md`](docs/24-production-deployment-audit-and-plan.md): Auditoría completa y plan de implementación para producción (Vercel, Render y Neon).
