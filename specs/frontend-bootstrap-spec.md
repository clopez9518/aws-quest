# Especificación Técnica: Inicialización del Espacio de Trabajo Frontend (Fase 1 - Hito 1.4)

## 1. Introducción y Objetivos

Esta especificación técnica define los requisitos, configuración, dependencias, estructura de carpetas y herramientas para la inicialización (*bootstrap*) del cliente web Frontend (**`apps/web`**) de la plataforma **AWS Architecture Quest**, de acuerdo con el plan de desarrollo ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)) y la arquitectura base del cliente ([`docs/09-frontend-bootstrap.md`](file:///c:/workspace/aws/aws-game/docs/09-frontend-bootstrap.md)).

### Objetivos Clave:
1. Configurar el espacio de trabajo monorepo con **npm workspaces** (`package.json` raíz con campo `workspaces`).
2. Inicializar la aplicación SPA con **Vite 6+**, **React 19 / 18+** y **TypeScript 5+** en `apps/web`.
3. Establecer las versiones más recientes y estables de las librerías del ecosistema: **React Flow (`@xyflow/react`)**, **Zustand**, **TanStack Query**, **React Router DOM**, **Tailwind CSS** y **Lucide React**.
4. Configurar el motor de estilos con **Tailwind CSS** (tema extendido AWS Dark/Light, directivas y plugins).
5. Configurar el compilador TypeScript (`tsconfig.json`, `tsconfig.node.json`, path aliases `@/*`).
6. Establecer la estructura modular guiada por funcionalidades (**Feature-Based Architecture**).

---

## 2. Configuración del Monorepo con npm (`package.json` Raíz)

En la raíz del proyecto para habilitar la gestión unificada de workspaces mediante **npm**:

### `package.json` (Raíz)
```json
{
  "name": "aws-architecture-quest",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev:web": "npm run dev --workspace=@aws-quest/web",
    "build:web": "npm run build --workspace=@aws-quest/web",
    "preview:web": "npm run preview --workspace=@aws-quest/web",
    "lint:web": "npm run lint --workspace=@aws-quest/web"
  }
}
```

---

## 3. Stack Tecnológico Frontend y Dependencias (`apps/web/package.json`)

Se definen las versiones más recientes y compatibles en el registro npm:

```json
{
  "name": "@aws-quest/web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.66.0",
    "@tanstack/react-query-devtools": "^5.66.0",
    "@xyflow/react": "^12.4.2",
    "axios": "^1.7.9",
    "clsx": "^2.1.1",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.2.0",
    "tailwind-merge": "^3.0.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/node": "^22.13.4",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

### Justificación de Dependencias Seleccionadas:
| Paquete | Versión | Rol en el Proyecto |
| :--- | :--- | :--- |
| **`react` / `react-dom`** | `^19.0.0` | Biblioteca base de interfaz visual declarativa y concurrente. |
| **`@xyflow/react`** | `^12.4.2` | Motor de diagramación interactivo (React Flow) para canvas Drag & Drop a 60 FPS (**RNF-01**). |
| **`zustand`** | `^5.0.3` | Gestión de estado global y del canvas desacoplada de React Context para máximo rendimiento. |
| **`@tanstack/react-query`** | `^5.66.0` | Gestión de caché, estado asíncrono del servidor y sincronización HTTP optimizada. |
| **`react-router-dom`** | `^7.2.0` | Enrutamiento SPA basado en `createBrowserRouter`. |
| **`axios`** | `^1.7.9` | Cliente HTTP con interceptores para inyección automática de tokens JWT de sesión/invitado. |
| **`tailwindcss`** | `^3.4.17` | Framework de utilidades CSS para diseño responsive y soporte de Dark/Light Mode. |
| **`lucide-react`** | `^0.475.0` | Catálogo de iconografía vectorial limpia y accesible (**RNF-05**). |
| **`clsx` + `tailwind-merge`** | `^2.1.1` / `^3.0.1` | Combinación condicional de clases de Tailwind sin conflictos de especificidad (`cn()` utility). |

---

## 4. Configuración de Construcción y Compilación

### 4.1. Configuración de Vite (`apps/web/vite.config.ts`)
Configura el servidor de desarrollo, proxy reverso hacia el Backend ASP.NET Core (`http://localhost:5000` / `5050`) y alias de módulos:

```typescript
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
        target: 'http://localhost:5000', // URL del Backend ASP.NET Core
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### 4.2. Configuración de TypeScript (`apps/web/tsconfig.json` y `tsconfig.app.json`)

#### `apps/web/tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### `apps/web/tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### `apps/web/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 5. Configuración de Estilos y Tema (`Tailwind CSS`)

### 5.1. `apps/web/tailwind.config.js`
Define la paleta cromática temática de AWS (Squid Dark, AWS Orange, AWS Smile Blue) y estados de feedback pedagógico:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aws: {
          squid: '#232F3E',
          orange: '#FF9900',
          smile: '#146EB4',
          dark: '#0F172A',
          card: '#1E293B',
          surface: '#334155'
        },
        feedback: {
          pass: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6'
        }
      }
    }
  },
  plugins: []
};
```

### 5.2. `apps/web/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### 5.3. `apps/web/src/app/styles/globals.css`
Directivas principales de Tailwind CSS y personalización del canvas:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950;
    overflow-x: hidden;
  }
}

/* React Flow Canvas Customizations */
.react-flow__background {
  background-color: #0b1120;
}

.react-flow__handle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #0f172a;
}
```

---

## 6. Estructura de Directorios del Frontend (`apps/web/src/`)

El proyecto adopta una **Feature-Based Architecture** modular para garantizar alta cohesión y bajo acoplamiento:

```text
apps/web/
├── index.html                      # Documento raíz HTML (viewport, title, fonts)
├── package.json                    # Dependencias y scripts del frontend
├── vite.config.ts                  # Configuración de Vite y proxy
├── tailwind.config.js              # Configuración de estilos y tema AWS
├── postcss.config.js               # Pipeline PostCSS
├── tsconfig.json                   # Configuración global TypeScript
├── tsconfig.app.json               # Configuración TypeScript para código de aplicación
├── tsconfig.node.json              # Configuración TypeScript para Vite
├── public/
│   ├── favicon.ico
│   └── icons/
│       └── aws/                    # Iconografía oficial simplificada en SVG
│           ├── ec2.svg
│           ├── rds.svg
│           ├── alb.svg
│           └── s3.svg
│
└── src/
    ├── app/
    │   ├── App.tsx                 # Providers globales (QueryClient, Router, Auth)
    │   ├── main.tsx                # Punto de entrada de la SPA
    │   └── styles/
    │       └── globals.css         # Estilos globales y directivas Tailwind
    │
    ├── routes/
    │   ├── index.tsx               # Configuración central de rutas (createBrowserRouter)
    │   └── RootLayout.tsx          # Layout principal con Header (Nivel, XP, Auth)
    │
    ├── features/
    │   ├── auth/                   # Módulo de Autenticación y Modo Invitado
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── components/
    │   │
    │   ├── catalog/                # Módulo del Catálogo de Unidades y Desafíos
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── components/
    │   │
    │   ├── challenge/              # Módulo del Workspace del Desafío
    │   │   ├── api/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   └── components/
    │   │
    │   ├── canvas/                 # Módulo del Motor de Diagramación (React Flow)
    │   │   ├── components/
    │   │   │   ├── nodes/
    │   │   │   ├── edges/
    │   │   │   └── controls/
    │   │   └── stores/
    │   │
    │   └── evaluation/             # Módulo de Resultados y Feedback Pedagógico
    │       ├── api/
    │       ├── hooks/
    │       └── components/
    │
    └── shared/                     # Recursos compartidos y utilidades globales
        ├── api/
        │   └── httpClient.ts       # Instancia Axios con interceptores JWT Bearer
        ├── components/             # Componentes UI atómicos (Button, Modal, Spinner)
        ├── stores/                 # Zustand Stores globales (useAuthStore)
        ├── types/                  # Tipos e interfaces globales compartidas
        └── utils/
            └── cn.ts               # Utilidad de combinación clsx + tailwind-merge
```

---

## 7. Archivos Iniciales y Código Base

### 7.1. Utilidad de Clases (`apps/web/src/shared/utils/cn.ts`)
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### 7.2. Cliente HTTP Centralizado (`apps/web/src/shared/api/httpClient.ts`)
```typescript
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 7.3. Punto de Entrada (`apps/web/src/app/main.tsx`)
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 7.4. Raíz de la Aplicación con Providers (`apps/web/src/app/App.tsx`)
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

### 7.5. Documento HTML Raíz (`apps/web/index.html`)
```html
<!DOCTYPE html>
<html lang="es" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AWS Architecture Quest</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

---

## 8. Flujo de Comandos de Inicialización y Verificación con npm

```bash
# 1. Instalar dependencias en el monorepo usando npm
npm install

# 2. Ejecutar la compilación y verificación de tipos del frontend
npm run build --workspace=@aws-quest/web

# 3. Levantar el servidor de desarrollo de Vite
npm run dev --workspace=@aws-quest/web
```

---

## 9. Matriz de Trazabilidad Técnica

Esta especificación ha sido verificada y alineada con los requisitos y decisiones del proyecto:

| Requisito / Documento Base | Componente / Decisión en la Spec | Estado |
| :--- | :--- | :--- |
| **RNF-01 (Fluidez Canvas 60 FPS)** | `@xyflow/react` v12 + `zustand` v5 en aislamiento | ✅ Totalmente cubierto |
| **RNF-04 (Diseño Adaptable)** | Tailwind CSS v3.4 con breakpoints responsivos | ✅ Totalmente cubierto |
| **RNF-05 (Iconografía Limpia)** | `lucide-react` + `/public/icons/aws/` SVG simplificados | ✅ Totalmente cubierto |
| **RNF-06 (Feedback Visual)** | Paleta `feedback.pass/error/warning/info` en Tailwind | ✅ Totalmente cubierto |
| **RNF-07 / RNF-11 (Desacoplamiento / Móvil)** | Capa `httpClient.ts` agnóstica con DTOs normalizados | ✅ Totalmente cubierto |
| **`06-architecture.md` (Monorepo)** | Configuración multi-app (`apps/web` y `apps/api`) con npm | ✅ Totalmente cubierto |
| **`09-frontend-bootstrap.md` (Feature Architecture)** | Estructura modular `features/{auth,catalog,challenge,canvas,evaluation}` | ✅ Totalmente cubierto |
| **`12-implementation-plan.md` (Hito 1.4)** | Inicialización completa de workspace frontend | ✅ Totalmente cubierto |
