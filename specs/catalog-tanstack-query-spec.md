# Especificación Técnica: Integración de TanStack Query y Feature de Catálogo (Fase 4 - Hito 4.4)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura, tipado estricto, capa de comunicación HTTP, hooks reactivos de TanStack Query v5, componentes de interfaz de usuario y estrategia de testing para el **Módulo de Catálogo y Configuración de Sistema** en la aplicación web (**`apps/web`**), correspondiente a la **Tarea 4.4** de la **Fase 4** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)), en estricto cumplimiento con el contrato de API REST ([`docs/08-api-spec.md`](file:///c:/workspace/aws/aws-game/docs/08-api-spec.md)), el diseño UI/UX ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), el módulo backend de catálogo ([`specs/catalog-challenges-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/catalog-challenges-module-spec.md)) y los componentes base previamente estructurados ([`specs/routing-global-layout-spec.md`](file:///c:/workspace/aws/aws-game/specs/routing-global-layout-spec.md), [`specs/theme-provider-spec.md`](file:///c:/workspace/aws/aws-game/specs/theme-provider-spec.md)).

### Objetivos Clave:
1. **Tipado Estricto TypeScript (`features/catalog/types/`):** Modelar fielmente los DTOs canónicos devueltos por el backend ASP.NET Core (`UnitResponseDto`, `CatalogChallengeDto`, `ChallengeProgressSummaryDto`, `SystemConfigResponseDto`, `UpdateSystemConfigRequestDto`) y sus enums serializados en camelCase (`DifficultyLevel`, `ChallengeMode`, `ProgressStatus`, `AccessMode`).
2. **Capa de Comunicación de API (`features/catalog/api/`):** Implementar funciones tipadas (`catalogApi.ts`, `systemConfigApi.ts`) que consuman los endpoints `GET /api/v1/units`, `GET /api/v1/system/config` y `PATCH /api/v1/system/config` a través de la instancia configurada de `httpClient`.
3. **Gestión Reactiva del Estado con TanStack Query v5 (`features/catalog/hooks/`):**
   * Definir un catálogo estructurado de claves de caché (*Query Keys Factory*).
   * Implementar hook `useUnits()` con estrategias óptimas de caché (`staleTime`, `gcTime`), reintento ante fallos y actualización en segundo plano.
   * Implementar hook `useSystemConfig()` para consultar la política de acceso y mutar la configuración global con invalidación atómica de la caché de unidades.
4. **Experiencia de Usuario y Componentes Visuales del Catálogo (`features/catalog/components/` & `pages/`):**
   * **`AccessModeToggle.tsx`:** Selector interactivo y explicativo para alternar entre **Modo Libre (Open Access)** y **Modo Progresivo** (**RN-01**).
   * **`ChallengeCard.tsx`:** Tarjeta visual de desafío con badges semánticos de dificultad (Fácil, Intermedio, Difícil, Integrador), recompensa en XP, indicador de estado (*Bloqueado con motivo de bloqueo / No iniciado / Completado con High Score y estrellas*) y acción navegable a `/challenges/:id`.
   * **`UnitAccordion.tsx`:** Sección colapsable por unidad temática con indicador de avance acumulado (ej. "2/3 Desafíos completados"), barra de progreso porcentual y grid responsivo de desafíos.
   * **`CatalogSkeleton.tsx` & `CatalogErrorState.tsx`:** Estados de carga animados (*Skeleton*) y de error con reintento asistido.
   * **`CatalogPage.tsx`:** Vista principal enriquecida con métricas globales, selector de política y listado dinámico de unidades.
5. **Soporte Dual de Tema (Dark / Light Mode):** Cumplimiento riguroso de las clases de Tailwind y diseño de alto contraste para ambos temas (`dark:` / `light:`).
6. **Cobertura Integral de Pruebas Unitarias y de Componentes (Vitest + Testing Library):** Validar el 100% de los flujos de renderizado, estados de carga, errores, mutación de política de acceso y navegación.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE TANSTACK QUERY Y CATÁLOGO (apps/web)                  │
│                                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                 VISTA: CatalogPage.tsx                              │   │
│   │  ├── Header con Estadísticas Globales                                               │   │
│   │  ├── Selector de Política: AccessModeToggle.tsx (OpenAccess vs Progressive)        │   │
│   │  ├── Esqueleto / Error: CatalogSkeleton.tsx / CatalogErrorState.tsx                │   │
│   │  └── Listado Jerárquico: UnitAccordion.tsx                                          │   │
│   │       └── Tarjetas de Desafío: ChallengeCard.tsx (Bloqueado/Completado/XP)          │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                              │ Consume Hooks Reactivos                      │
│                                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           HOOKS DE TANSTACK QUERY (hooks/)                          │   │
│   │  ├── useUnits(): useQuery(queryKey: ['catalog', 'units'], queryFn: getUnitsCatalog) │   │
│   │  └── useSystemConfig(): useQuery(...) & useMutation(patchConfig -> invalida 'units')│   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                              │ Invoca Funciones HTTP                        │
│                                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                 CAPA DE API (api/)                                  │   │
│   │  ├── catalogApi.ts: getUnitsCatalog()        -> GET   /api/v1/units                 │   │
│   │  └── systemConfigApi.ts: getSystemConfig()   -> GET   /api/v1/system/config         │   │
│   │                          updateSystemConfig()-> PATCH /api/v1/system/config         │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                              │ Inyecta Bearer JWT + Interceptores           │
│                                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         CLIENTE HTTP BASE (shared/api/httpClient.ts)                │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                              │ HTTPS / JSON                                 │
│                                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                    BACKEND API REST (UnitsController / SystemConfigController)      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en el Feature de Catálogo |
| :--- | :--- | :--- |
| **RF-01** | Visualización del Catálogo | Listado jerárquico de unidades y desafíos con badges de dificultad, modo, XP base y estado del usuario. |
| **RF-02** | Selección de Desafíos | Navegación protegida hacia `/challenges/:id` habilitada únicamente en desafíos desbloqueados. |
| **RN-01** | Accesibilidad Configurable | Comportamiento condicional según la política `AccessMode` (`openAccess`: todos desbloqueados; `progressive`: bloqueo por prerrequisito y umbral de XP). |
| **RN-02** | Criterio de Aprobación | Un desafío se muestra con badge de *Completado* si el usuario obtuvo $\ge 70$ puntos en su récord histórico (`highScore`). |
| **RN-10** | Gamificación y XP | Exhibición visual de la recompensa en XP base (`baseXP`) y el puntaje máximo obtenido (`highScore`). |
| **RNF-04** | Diseño Adaptable | Disposición responsiva fluida (acordeones a pantalla completa, grid de tarjetas 1/2/3 columnas según breakpoint). |
| **RNF-06** | Feedback Visual Inmediato | Transiciones de expansión de acordeones, spinners en mutación de política y skeletons de carga sin parpadeo. |
| **CU-01** | Visualizar Catálogo | Flujo de consulta con enriquecimiento automático del progreso del usuario activo (invitado o registrado). |
| **CU-07** | Configurar Política Global | Modificación dinámica de la política de acceso mediante `AccessModeToggle` con invalidación inmediata de caché. |

---

## 3. Tipos TypeScript y Modelos de Datos

### 3.1. Tipos de Catálogo (`apps/web/src/features/catalog/types/catalog.types.ts`)

```typescript
/**
 * Niveles de dificultad del desafío.
 */
export type DifficultyLevel = 'easy' | 'intermediate' | 'hard' | 'integrator';

/**
 * Modalidad de resolución del desafío.
 */
export type ChallengeMode = 'builder' | 'fixArchitecture';

/**
 * Estado de progreso del usuario en un desafío específico.
 */
export type ProgressStatus = 'notStarted' | 'inProgress' | 'completed';

/**
 * Resumen del progreso y mejor puntuación del usuario en un desafío.
 */
export interface ChallengeProgressSummaryDto {
  status: ProgressStatus;
  highScore: number;
  hintsUsed: number;
  completedAt?: string | null;
}

/**
 * DTO de desafío en la vista de catálogo.
 */
export interface CatalogChallengeDto {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  requiredXP: number;
  orderIndex: number;
  isLocked: boolean;
  lockReason?: string | null;
  userProgress?: ChallengeProgressSummaryDto | null;
}

/**
 * DTO de unidad temática con sus desafíos ordenados.
 */
export interface UnitResponseDto {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  challenges: CatalogChallengeDto[];
}
```

### 3.2. Tipos de Configuración del Sistema (`apps/web/src/features/catalog/types/systemConfig.types.ts`)

```typescript
/**
 * Modos de acceso global al contenido educativo.
 */
export type AccessMode = 'openAccess' | 'progressive';

/**
 * DTO de respuesta con la configuración activa del sistema.
 */
export interface SystemConfigResponseDto {
  accessMode: AccessMode;
  updatedAt: string;
}

/**
 * DTO de petición para actualizar la política global de acceso.
 */
export interface UpdateSystemConfigRequestDto {
  accessMode: AccessMode;
}
```

---

## 4. Capa de Servicios y Endpoints HTTP (`features/catalog/api/`)

### 4.1. Servicio de Catálogo (`apps/web/src/features/catalog/api/catalogApi.ts`)

```typescript
import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import { UnitResponseDto } from '../types/catalog.types';

/**
 * Obtiene el catálogo completo de unidades y desafíos con el progreso del usuario activo.
 */
export async function getUnitsCatalog(): Promise<UnitResponseDto[]> {
  const response = await httpClient.get<ApiResponse<UnitResponseDto[]>>('/units');
  return response.data.data;
}
```

### 4.2. Servicio de Configuración del Sistema (`apps/web/src/features/catalog/api/systemConfigApi.ts`)

```typescript
import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import { AccessMode, SystemConfigResponseDto, UpdateSystemConfigRequestDto } from '../types/systemConfig.types';

/**
 * Consulta la política global de acceso activa en el sistema.
 */
export async function getSystemConfig(): Promise<SystemConfigResponseDto> {
  const response = await httpClient.get<ApiResponse<SystemConfigResponseDto>>('/system/config');
  return response.data.data;
}

/**
 * Actualiza la política global de acceso (Modo Libre vs. Progresivo).
 */
export async function updateSystemConfig(accessMode: AccessMode): Promise<SystemConfigResponseDto> {
  const payload: UpdateSystemConfigRequestDto = { accessMode };
  const response = await httpClient.patch<ApiResponse<SystemConfigResponseDto>>('/system/config', payload);
  return response.data.data;
}
```

---

## 5. Hooks de TanStack Query (`features/catalog/hooks/`)

### 5.1. Query Keys Factory (`apps/web/src/features/catalog/hooks/catalogQueryKeys.ts`)

```typescript
export const catalogKeys = {
  all: ['catalog'] as const,
  units: () => [...catalogKeys.all, 'units'] as const,
};

export const systemConfigKeys = {
  all: ['systemConfig'] as const,
  config: () => [...systemConfigKeys.all, 'current'] as const,
};
```

### 5.2. Hook de Unidades (`apps/web/src/features/catalog/hooks/useUnits.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { catalogKeys } from './catalogQueryKeys';
import { getUnitsCatalog } from '../api/catalogApi';
import { UnitResponseDto } from '../types/catalog.types';

export function useUnits() {
  return useQuery<UnitResponseDto[], Error>({
    queryKey: catalogKeys.units(),
    queryFn: getUnitsCatalog,
    staleTime: 1000 * 60 * 2, // 2 minutos de datos frescos
  });
}
```

### 5.3. Hook de Configuración del Sistema (`apps/web/src/features/catalog/hooks/useSystemConfig.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigKeys, catalogKeys } from './catalogQueryKeys';
import { getSystemConfig, updateSystemConfig } from '../api/systemConfigApi';
import { AccessMode, SystemConfigResponseDto } from '../types/systemConfig.types';

export function useSystemConfig() {
  const queryClient = useQueryClient();

  const configQuery = useQuery<SystemConfigResponseDto, Error>({
    queryKey: systemConfigKeys.config(),
    queryFn: getSystemConfig,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (mode: AccessMode) => updateSystemConfig(mode),
    onSuccess: (newConfig) => {
      // Actualiza la caché de la configuración del sistema
      queryClient.setQueryData(systemConfigKeys.config(), newConfig);
      // Invalida el catálogo de unidades para recalcular el bloqueo de desafíos según la nueva política
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });
    },
  });

  return {
    config: configQuery.data,
    accessMode: configQuery.data?.accessMode ?? 'openAccess',
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    updateAccessMode: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
```

---

## 6. Componentes de UI y Experiencia de Usuario (`features/catalog/components/`)

### 6.1. Selector de Política de Acceso (`AccessModeToggle.tsx`)
* **Propósito:** Permitir alternar de forma intuitiva entre **Modo Libre** y **Modo Progresivo** (**RN-01 / CU-07**).
* **Diseño y Estados:**
  * Componente pill interactivo con dos opciones:
    * *Modo Libre (Open Access):* Icono `Unlock` o `Sparkles`, indicando "Todos los desafíos desbloqueados".
    * *Modo Progresivo (Progressive):* Icono `Lock` o `TrendingUp`, indicando "Desbloqueo secuencial por prerrequisito y XP".
  * Animación de transición y spinner sutil durante la mutación (`isUpdating`).
  * Tooltip o subtítulo explicativo de la política activa.

### 6.2. Tarjeta de Desafío (`ChallengeCard.tsx`)
* **Propósito:** Renderizar cada desafío individual dentro de la unidad temática con su metadata pedagógica.
* **Propiedades (`ChallengeCardProps`):**
  * `challenge: CatalogChallengeDto`
* **Elementos Visuales:**
  * **Badge de Dificultad:**
    * `easy`: Verde esmeralda (`bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400`).
    * `intermediate`: Ámbar (`bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400`).
    * `hard`: Naranja AWS (`bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400`).
    * `integrator`: Púrpura (`bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400`).
  * **Modalidad:** Badge sutil de texto (ej. `Builder` o `Reparar`).
  * **Recompensa en XP:** `+100 XP` con icono de rayo `Zap` en dorado.
  * **Estado de Bloqueo (`isLocked = true`):**
    * Tarjeta con opacidad reducida (`opacity-75 dark:opacity-60 bg-slate-100/60 dark:bg-slate-900/40`).
    * Icono de candado `Lock` prominente.
    * Mensaje descriptivo de la razón de bloqueo (`lockReason`, ej. *"Requiere completar 'Servidor Web con Alta Disponibilidad'"*).
    * Botón deshabilitado con cursor `not-allowed`.
  * **Estado de Completado (`userProgress?.status === 'completed'`):**
    * Badge de éxito con icono `CheckCircle2` o `Award`.
    * Medalla con mejor puntuación histórica (*"Récord: 95/100"*).
    * Indicador de pistas usadas (`hintsUsed`).
  * **Acción de Inicio / Reintento:**
    * Enlace `Link` a `/challenges/:id` con botón interactivo: *"Iniciar Desafío"* (si no iniciado) o *"Mejorar Puntaje"* (si completado).

### 6.3. Acordeón de Unidad Temática (`UnitAccordion.tsx`)
* **Propósito:** Agrupar desafíos por temática pedagógica y mostrar el progreso acumulado en la unidad.
* **Propiedades (`UnitAccordionProps`):**
  * `unit: UnitResponseDto`
  * `defaultExpanded?: boolean`
* **Elementos Visuales:**
  * Cabecera expandible con icono de chevron animado (`ChevronDown`).
  * Título de la unidad con número de orden (ej. *Unidad 1: Cómputo y Escalabilidad*).
  * Descripción formativa de los conceptos cubiertos (EC2, ALB, Auto Scaling).
  * **Progreso de la Unidad:**
    * Contador textual de desafíos completados (ej. `2 de 4 completados`).
    * Mini barra de progreso porcentual (`bg-slate-200 dark:bg-slate-950` con relleno `from-amber-500 to-amber-400`).
    * Badge de unidad 100% dominada cuando todos los desafíos estén completados.
  * **Grid Responsivo:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6`.

### 6.4. Esqueleto de Carga Animado (`CatalogSkeleton.tsx`)
* Renderiza 2 unidades con placeholders pulsantes (`animate-pulse`) simulando cabeceras, barras de progreso y grids de 3 tarjetas de desafío para evitar saltos de layout (*Cumulative Layout Shift*).

### 6.5. Estado de Error (`CatalogErrorState.tsx`)
* Vista de error amigable en caso de falla de red o error de servidor con icono `AlertTriangle`, mensaje descriptivo y botón con icono `RefreshCw` para reintentar la consulta (`refetch`).

### 6.6. Pantalla Principal de Catálogo (`CatalogPage.tsx`)
* Integración armónica de los componentes:
  * Cabecera con título de la arena, descripción del Well-Architected Framework y resumen global (Total de desafíos, completados, XP acumulada).
  * `AccessModeToggle` alineado en la cabecera.
  * Renderizado condicional:
    * `isLoading` $\rightarrow$ `<CatalogSkeleton />`
    * `isError` $\rightarrow$ `<CatalogErrorState onRetry={refetch} />`
    * `data` $\rightarrow$ Listado mapeado de `<UnitAccordion key={unit.id} unit={unit} />`

---

## 7. Diseño Visual, Tokens de Estilo y Soporte Dark / Light Mode

| Elemento Visual | Modo Claro (Light Mode) | Modo Oscuro (Dark Mode) |
| :--- | :--- | :--- |
| **Contenedor de Acordeón** | `bg-white border-slate-200 shadow-sm` | `bg-slate-900/70 border-slate-800 shadow-lg` |
| **Cabecera de Acordeón (Hover)** | `hover:bg-slate-50 text-slate-900` | `hover:bg-slate-800/60 text-slate-100` |
| **Tarjeta de Desafío (Default)** | `bg-white border-slate-200 hover:border-amber-400 hover:shadow-md` | `bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:shadow-amber-500/5` |
| **Tarjeta de Desafío (Bloqueada)** | `bg-slate-100/70 border-slate-200 text-slate-400` | `bg-slate-950/50 border-slate-800/80 text-slate-500` |
| **Badge de Récord / High Score** | `bg-emerald-50 border-emerald-200 text-emerald-700` | `bg-emerald-500/10 border-emerald-500/30 text-emerald-400` |
| **Selector de Modo (Pill)** | `bg-slate-100 border-slate-200` | `bg-slate-900 border-slate-800` |
| **Botón de Acción Desafío** | `bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950` | `bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20` |

---

## 8. Plan de Pruebas Unitarias y de Componentes

### 8.1. Pruebas de Servicios HTTP (`catalogApi.test.ts` & `systemConfigApi.test.ts`)
* `getUnitsCatalog`: Verificar llamada a `GET /units` y retorno correcto del arreglo de unidades.
* `getSystemConfig`: Verificar llamada a `GET /system/config` y retorno del objeto de configuración.
* `updateSystemConfig`: Verificar llamada a `PATCH /system/config` con el payload de `AccessMode` esperado.

### 8.2. Pruebas de Hooks Reactivos (`useUnits.test.tsx` & `useSystemConfig.test.tsx`)
* `useUnits`: Validar estados `isLoading`, `isSuccess`, retorno de datos y manejo de error con `QueryClientProvider`.
* `useSystemConfig`: Validar obtención de la configuración actual, ejecución de la mutación y la invalidación de la query de unidades `catalogKeys.units()`.

### 8.3. Pruebas de Componentes Visuales
* **`AccessModeToggle.test.tsx`:**
  * Renderizado del modo activo (`openAccess` o `progressive`).
  * Invocación del callback / mutación al alternar el modo.
  * Visualización de spinner o estado deshabilitado durante la mutación.
* **`ChallengeCard.test.tsx`:**
  * Renderizado de desafío desbloqueado con badge de dificultad, XP base y botón con enlace a `/challenges/:id`.
  * Renderizado de desafío bloqueado con icono `Lock`, motivo de bloqueo (`lockReason`) y botón deshabilitado.
  * Renderizado de desafío completado con `highScore`, badge de completado y pistas usadas.
* **`UnitAccordion.test.tsx`:**
  * Renderizado de título, descripción y cálculo correcto del progreso (ej. "2 de 3 completados").
  * Interacción de colapsar / expandir al hacer clic en la cabecera.
* **`CatalogPage.test.tsx`:**
  * Renderizado del esqueleto `CatalogSkeleton` mientras `isLoading` es `true`.
  * Renderizado del componente `CatalogErrorState` y botón de reintento cuando `isError` es `true`.
  * Renderizado completo de las unidades y tarjetas al cargar datos exitosamente.

---

## 9. Criterios de Aceptación y Checklist de Verificación

- [ ] **Tipos TypeScript (`types/`):** Modelos `UnitResponseDto`, `CatalogChallengeDto`, `SystemConfigResponseDto`, `AccessMode`, `DifficultyLevel` exportados y alineados con el backend.
- [ ] **Servicios HTTP (`api/`):** `catalogApi.ts` y `systemConfigApi.ts` integrados con `httpClient`.
- [ ] **Hooks TanStack Query (`hooks/`):** `useUnits` y `useSystemConfig` con query keys factory e invalidación automática de caché al cambiar política.
- [ ] **Componentes de Catálogo (`components/`):** `AccessModeToggle`, `ChallengeCard`, `UnitAccordion`, `CatalogSkeleton` y `CatalogErrorState` completamente implementados con soporte Dark y Light.
- [ ] **Página Principal (`pages/CatalogPage.tsx`):** Integrada con React Router, métricas de avance y lista de unidades reactiva.
- [ ] **Pruebas Unitarias:** 100% de las suites de prueba de catálogo aprobadas en Vitest.
- [ ] **Build y Tipos:** Compilación limpia con `npm run build --workspace=@aws-quest/web` sin errores de TypeScript.
