# Especificación de Frontend Bootstrap - AWS Architecture Quest

## 1. Introducción y Propósito

Este documento define la arquitectura base, configuración inicial, estructura de carpetas, enrutamiento, gestión de estado y flujo de comunicación HTTP para la aplicación Frontend (`apps/web`).

El objetivo es garantizar una experiencia fluida a 60 FPS en el canvas interactivo, desacoplamiento estricto entre capas y una convención clara y uniforme para el desarrollo de componentes y peticiones a la API.

---

## 2. Stack Tecnológico y Dependencias (`package.json`)

Definición de dependencias y scripts de `apps/web/package.json`:

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

---

## 3. Flujo de Datos y Comunicación HTTP (Arquitectura por Capas)

Para mantener la separación de responsabilidades y evitar llamadas directas a la API desde la interfaz visual, toda solicitud HTTP sigue una arquitectura unidireccional estricta en 4 niveles:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. PÁGINAS / COMPONENTES (pages/ y components/)             │
│    Ej: ChallengeWorkspacePage.tsx, CatalogPage.tsx           │
│    - Renderiza la interfaz gráfica                          │
│    - Consume datos reactivos desde hooks                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Invoca
┌──────────────────────────────▼──────────────────────────────┐
│ 2. HOOKS DE ESTADO DEL SERVIDOR (hooks/)                    │
│    Ej: useChallenge.ts, useEvaluateChallenge.ts             │
│    - Encapsula useQuery() y useMutation() de TanStack Query │
│    - Maneja estados de carga (isLoading), error y caché     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Llama a
┌──────────────────────────────▼──────────────────────────────┐
│ 3. SERVICIOS DE API (api/)                                  │
│    Ej: challengeApi.ts, authApi.ts, unitApi.ts              │
│    - Funciones puras con Axios/Fetch tipadas                │
│    - Realiza la serialización y mapeo de DTOs               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ejecuta HTTP
┌──────────────────────────────▼──────────────────────────────┐
│ 4. BACKEND REST API (/api/v1/...)                           │
│    Ej: GET /api/v1/challenges/:id                           │
│        POST /api/v1/challenges/:id/evaluate                 │
└─────────────────────────────────────────────────────────────┘
```

### Ejemplo Concreto de Flujo de Datos:
```text
ChallengeWorkspacePage
      │
      ▼
useChallenge(challengeId)        [Hook TanStack Query]
      │
      ▼
challengeApi.getById(challengeId) [Capa API Axios]
      │
      ▼
GET /api/v1/challenges/:id        [Endpoint Backend ASP.NET Core (.NET 10)]
```

---

## 4. Estructura de Directorios y Carpetas (`apps/web/src/`)

El proyecto adopta una **Feature-Based Architecture** donde cada funcionalidad agrupa sus propias `pages`, `components`, `hooks` y `api`:

```text
apps/web/src/
├── app/
│   ├── App.tsx                     # Providers principales (QueryClient, Router, Auth)
│   ├── main.tsx                    # Punto de entrada de Vite
│   └── styles/
│       └── globals.css             # Directivas de Tailwind CSS
│
├── routes/
│   ├── index.tsx                   # Configuración del Router con createBrowserRouter
│   └── RootLayout.tsx              # Layout global con Header persistente (Nivel, XP, Auth)
│
├── features/
│   ├── auth/                       # Módulo de Autenticación y Modo Invitado
│   │   ├── api/
│   │   │   └── authApi.ts          # createGuestSession(), register(), login(), getMe()
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Estado de sesión y autenticación
│   │   │   └── useGuestSession.ts  # Inicialización de sesión anónima
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── components/
│   │       └── AuthModal.tsx
│   │
│   ├── catalog/                    # Módulo de Catálogo de Unidades y Desafíos
│   │   ├── api/
│   │   │   └── unitApi.ts          # getUnitsWithChallenges()
│   │   ├── hooks/
│   │   │   └── useUnits.ts         # Hook TanStack Query para listar unidades
│   │   ├── pages/
│   │   │   └── CatalogPage.tsx     # Vista principal de selección de desafíos
│   │   └── components/
│   │       ├── UnitAccordion.tsx
│   │       ├── ChallengeCard.tsx
│   │       └── DifficultyBadge.tsx
│   │
│   ├── challenge/                  # Módulo de Workspace del Desafío
│   │   ├── api/
│   │   │   └── challengeApi.ts     # getChallengeById(), unlockHint()
│   │   ├── hooks/
│   │   │   ├── useChallenge.ts     # Carga del contexto del desafío
│   │   │   └── useUnlockHint.ts    # Mutation para desbloquear pistas
│   │   ├── pages/
│   │   │   └── ChallengePage.tsx   # Contenedor del Workspace (Canvas + Paneles)
│   │   └── components/
│   │       ├── WorkspaceHeader.tsx # Título, XP, timer y botón Enviar
│   │       ├── ProblemContextPanel.tsx # Requisitos y restricciones
│   │       ├── ServicePalette.tsx  # Lista Drag & Drop de servicios AWS
│   │       └── HintDrawer.tsx      # Panel lateral de pistas progresivas
│   │
│   ├── canvas/                     # Módulo del Motor de Diagramación (React Flow)
│   │   ├── components/
│   │   │   ├── ArchitectureCanvas.tsx # Wrapper de React Flow
│   │   │   ├── nodes/
│   │   │   │   └── AwsServiceNode.tsx # Nodo personalizado para servicios AWS
│   │   │   ├── edges/
│   │   │   │   └── CustomConnectionEdge.tsx # Línea de conexión visual
│   │   │   └── controls/
│   │   │       └── CanvasToolbar.tsx  # Zoom, Reset, Limpiar
│   │   └── stores/
│   │       └── useCanvasStore.ts   # Store Zustand para el grafo del canvas
│   │
│   └── evaluation/                 # Módulo de Resultados y Evaluación
│       ├── api/
│       │   └── evaluationApi.ts    # evaluateArchitecture()
│       ├── hooks/
│       │   └── useEvaluateChallenge.ts # Mutation para enviar y recibir feedback
│       └── components/
│           ├── EvaluationModal.tsx # Pantalla modal con la nota obtenida
│           ├── ScoreGauge.tsx      # Animación de puntaje 0-100
│           └── FeedbackList.tsx    # Desglose explicativo de aciertos/errores
│
└── shared/                         # Recursos globales compartidos
    ├── api/
    │   └── httpClient.ts           # Instancia Axios con interceptores JWT Bearer
    ├── components/
    │   ├── Button.tsx
    │   ├── Modal.tsx
    │   ├── Spinner.tsx
    │   └── Toast.tsx
    ├── stores/
    │   └── useAuthStore.ts         # Zustand Store para token y usuario actual
    └── utils/
        └── cn.ts                   # Utilidad clsx + tailwind-merge
```

---

## 5. Configuración del Enrutador (React Router con `createBrowserRouter`)

El enrutamiento se configura mediante la API moderna de React Router:

```typescript
// apps/web/src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ChallengePage } from '../features/challenge/pages/ChallengePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/catalog" replace />
      },
      {
        path: 'catalog',
        element: <CatalogPage />
      },
      {
        path: 'challenges/:id',
        element: <ChallengePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      }
    ]
  }
]);
```

---

## 6. Configuración de Estado y Cliente HTTP

### 6.1. Cliente HTTP Base con Interceptor JWT (`shared/api/httpClient.ts`)

```typescript
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

export const httpClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar automáticamente el JWT (usuario o invitado)
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 6.2. Configuración de TanStack Query (`app/App.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché para catálogo y desafíos
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

### 6.3. Store del Canvas en Zustand (`features/canvas/stores/useCanvasStore.ts`)
Aísla las mutaciones del grafo (nodos y aristas de React Flow) del ciclo de renderizado de React para garantizar fluidez:

```typescript
import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (serviceCode: string, position: { x: number; y: number }) => void;
  resetCanvas: () => void;
  setInitialGraph: (nodes: Node[], edges: Edge[]) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({ edges: addEdge({ ...connection, animated: true }, get().edges) }),
  addNode: (serviceCode, position) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'awsServiceNode',
      position,
      data: { serviceCode, config: {} }
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  resetCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null }),
  setInitialGraph: (nodes, edges) => set({ nodes, edges, selectedNodeId: null })
}));
```

---

## 7. Diseño del Nodo Personalizado de React Flow (`AwsServiceNode`)

El componente `features/canvas/components/nodes/AwsServiceNode.tsx` renderiza los servicios de AWS con sus respectivos Handles de entrada/salida:

```tsx
import { Handle, Position, NodeProps } from '@xyflow/react';

export function AwsServiceNode({ data, selected }: NodeProps) {
  return (
    <div className={`p-3 rounded-lg border bg-slate-900 shadow-md min-w-[140px] transition-all ${
      selected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700'
    }`}>
      {/* Handle de Entrada (Target) */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />

      <div className="flex items-center space-x-2">
        <img src={data.iconUrl || '/icons/aws/default.svg'} alt={data.name} className="w-8 h-8" />
        <div>
          <p className="text-xs font-bold text-slate-100">{data.name || data.serviceCode}</p>
          <span className="text-[10px] text-slate-400">{data.category || 'AWS Service'}</span>
        </div>
      </div>

      {/* Handle de Salida (Source) */}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
    </div>
  );
}
```

---

## 8. Configuración de Estilos y Tema (Tailwind CSS)

Definición de `apps/web/tailwind.config.js`:

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
          card: '#1E293B'
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
