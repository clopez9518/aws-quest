# Especificación Técnica: Integración de Hooks del Desafío (Fase 5 - Hito 5.4)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura de consumo de datos, capa de servicios HTTP, hooks de TanStack Query v5, gestión de estados de carga/error, sincronización bidireccional reactiva con `useCanvasStore` y estrategia de pruebas unitarias para la **Integración de Hooks del Desafío** (`features/challenge`), correspondiente a la **Tarea 5.4** de la **Fase 5** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El desarrollo se alinea rigurosamente con los contratos de API REST ([`docs/08-api-spec.md`](file:///c:/workspace/aws/aws-game/docs/08-api-spec.md)), el diseño de interfaces ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), los endpoints implementados en el backend ([`specs/catalog-challenges-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/catalog-challenges-module-spec.md) y [`specs/hints-evaluation-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/hints-evaluation-module-spec.md)), y el workspace visual en 3 paneles ([`specs/challenge-workspace-spec.md`](file:///c:/workspace/aws/aws-game/specs/challenge-workspace-spec.md)).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      INTEGRACIÓN DE HOOKS Y CONSUMO DE API (features/challenge)                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                       VISTA: ChallengePage.tsx                                      │   │
│   │  • useChallenge(id): Consulta detalle, inicializa servicios en canvas y carga último grafo          │   │
│   │  • useUnlockHint(): Mutación reactiva con actualización optimista/invalidation de pistas y progreso │   │
│   │  • Skeletons y Estados de Error (ChallengeNotFound / ChallengeLocked / Error genérico)              │   │
│   └───────────────────────────────────┬─────────────────────────────────┬───────────────────────────────┘   │
│                                       │ Consume Hooks                   │ Consume Hooks                     │
│                                       ▼                                 ▼                                   │
│   ┌──────────────────────────────────────────────────┐ ┌────────────────────────────────────────────────┐   │
│   │ QUERY HOOK: useChallenge(challengeId)            │ │ MUTATION HOOK: useUnlockHint()                 │   │
│   │ • Key: ['challenge', 'detail', challengeId]      │ │ • Mutation: unlockNextHint(challengeId)        │   │
│   │ • Invocación: challengeApi.getChallengeDetail    │ │ • Invalida caché de 'challenge' y 'catalog'    │   │
│   │ • staleTime: 5 min, gcTime: 10 min               │ │ • Sincroniza pistas desbloqueadas              │   │
│   └─────────────────────────┬────────────────────────┘ └────────────────────────┬───────────────────────┘   │
│                             │                                                   │                           │
│                             └─────────────────────┬─────────────────────────────┘                           │
│                                                   │ Invocan Funciones HTTP                                  │
│                                                   ▼                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                CAPA DE SERVICIO API (challengeApi.ts)                               │   │
│   │  • getChallengeDetail(id)      ──► GET  /api/v1/challenges/{id}                                     │   │
│   │  • unlockNextHint(challengeId) ──► POST /api/v1/challenges/{id}/hints/unlock                     │   │
│   └───────────────────────────────────────────────┬─────────────────────────────────────────────────────┘   │
│                                                   │ Inyecta Bearer JWT                                      │
│                                                   ▼                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                CLIENTE HTTP (shared/api/httpClient.ts)                              │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Objetivos Clave:
1. **Tipado Estricto TypeScript (`features/challenge/types/`):**
   * Sincronizar fielmente los modelos frontend con las respuestas JSON y envelopes del backend:
     - `ChallengeDetailResponseDto`: metadata del desafío, servicios autorizados (`ChallengeAllowedServiceDto`), resumen de pistas (`HintsSummaryDto`), grafo previo (`SemanticGraphDto`).
     - `UnlockHintResponseDto`: pista recién desbloqueada (`UnlockedHintDto`), contador total y penalización acumulada.
2. **Capa de Comunicación de API (`features/challenge/api/challengeApi.ts`):**
   * `getChallengeDetail(challengeId: string)`: Realiza `GET /api/v1/challenges/{id}` mediante `httpClient`.
   * `unlockNextHint(challengeId: string)`: Realiza `POST /api/v1/challenges/{id}/hints/unlock` mediante `httpClient`.
3. **Query Keys Factory (`challengeQueryKeys.ts`):**
   * Jerarquía predecible y extensible para invalidaciones atómicas: `challengeKeys.detail(id)`.
4. **Hook de Consulta `useChallenge(challengeId)`:**
   * Encapsula la consulta con TanStack Query v5, proveyendo `challenge`, `isLoading`, `isError`, `error`, `refetch`.
   * Manejo transparente de políticas de bloqueo: detección de errores `CHALLENGE_LOCKED` (403) y `CHALLENGE_NOT_FOUND` (404).
5. **Hook de Mutación `useUnlockHint()`:**
   * Ejecuta el desbloqueo secuencial con TanStack Query Mutation.
   * Al completarse con éxito, actualiza la caché local del desafío (`setQueryData` / `invalidateQueries`) e invalida la lista de catálogo para mantener coherentes los contadores de pistas del usuario.
6. **Integración con `ChallengePage.tsx` y `useCanvasStore`:**
   * Al recibir datos frescos del desafío, invoca `setAllowedServices` y `loadSemanticGraph` en el store atómico de Zustand.
   * Despliegue de esqueletos visuales durante la carga (`ChallengeWorkspaceSkeleton.tsx`) y pantalla dedicada de error con botón de retorno al catálogo ante bloqueos o recursos inexistentes.
7. **Suite de Pruebas Unitarias Rigurosa (Vitest + Testing Library):**
   * Pruebas aisladas para `challengeApi.ts`, `useChallenge.test.tsx` y `useUnlockHint.test.tsx` con mocks de `httpClient` y `QueryClientProvider`.

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en la Integración de Hooks |
| :--- | :--- | :--- |
| **RF-02** | Inicialización del Desafío | `useChallenge(id)` recupera los servicios autorizados, requisitos y grafo del intento previo. |
| **RF-11 / RN-06** | Pistas Secuenciales | `useUnlockHint()` consume `POST /hints/unlock` garantizando que no se puedan saltar pistas. |
| **RF-12 / RN-07** | Penalización de Puntuación | La API persiste el consumo de la pista y actualiza `unlockedHints` y `hintsUsed`. |
| **RN-01** | Acceso Condicional y Bloqueo | Manejo de respuesta HTTP 403 `CHALLENGE_LOCKED` si el usuario intenta acceder a un desafío no desbloqueado. |
| **RN-03** | Restricción del Catálogo | `allowedServices` del backend inicializa el store `setAllowedServices()` para validar inserciones. |
| **RN-11 / CU-02** | Restauración del Estado Previo | `lastAttemptGraph` inicializa el lienzo si el usuario ya tenía un diseño en curso. |
| **RNF-01** | Rendimiento y Caché | `staleTime: 5 min` para evitar re-consultas innecesarias al cambiar entre tabs del navegador. |
| **RNF-06** | Feedback Visual de Carga | Skeleton layout animado durante la consulta HTTP inicial. |

---

## 3. Especificación de Tipos de Dominio (`challenge.types.ts`)

Ubicación: `apps/web/src/features/challenge/types/challenge.types.ts`

```typescript
import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';
import { SemanticGraphDto, ServicePaletteItem } from '../../canvas/types/canvas.types';

/**
 * Pista desbloqueada devuelta por la API.
 */
export interface UnlockedHintDto {
  orderIndex: number;
  text: string;
  penaltyApplied: number;
}

/**
 * Resumen de pistas sanitizado por el backend (anti-cheat).
 */
export interface HintsSummaryDto {
  totalHints: number;
  unlockedCount: number;
  unlockedHints: UnlockedHintDto[];
}

/**
 * DTO de servicio autorizado proveniente del backend.
 */
export interface ChallengeAllowedServiceDto {
  code: string;
  name: string;
  category: string;
  shortDescription?: string | null;
  iconUrl: string;
  maxInstances?: number | null;
  isDistractor: boolean;
}

/**
 * Respuesta canónica del backend para GET /api/v1/challenges/{id}.
 */
export interface ChallengeDetailResponseDto {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  allowedServices: ChallengeAllowedServiceDto[];
  hintsSummary: HintsSummaryDto;
  lastAttemptGraph?: SemanticGraphDto | null;
}

/**
 * Respuesta canónica del backend para POST /api/v1/challenges/{id}/hints/unlock.
 */
export interface UnlockHintResponseDto {
  unlockedHint: UnlockedHintDto;
  totalHintsUnlocked: number;
  totalPenaltyAccumulated: number;
}

/**
 * Requisito declarativo derivado para la interfaz de usuario.
 */
export interface ArchitectureRequirement {
  id: string;
  type: 'required_service' | 'connection' | 'anti_pattern' | 'instance_limit';
  title: string;
  description: string;
}

/**
 * Modelo adaptado para el consumo de componentes en el Workspace.
 */
export interface ChallengeWorkspaceModel {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  allowedServices: ServicePaletteItem[];
  hintsSummary: HintsSummaryDto;
  lastAttemptGraph?: SemanticGraphDto | null;
  requirements: ArchitectureRequirement[];
}
```

---

## 4. Capa de Servicios de API (`challengeApi.ts`)

Ubicación: `apps/web/src/features/challenge/api/challengeApi.ts`

```typescript
import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import { ChallengeDetailResponseDto, UnlockHintResponseDto } from '../types/challenge.types';

/**
 * Consulta la información completa y contexto del desafío por su identificador único.
 */
export async function getChallengeDetail(challengeId: string): Promise<ChallengeDetailResponseDto> {
  const response = await httpClient.get<ApiResponse<ChallengeDetailResponseDto>>(
    `/challenges/${challengeId}`
  );
  return response.data.data;
}

/**
 * Desbloquea la siguiente pista disponible en orden secuencial para el desafío.
 */
export async function unlockNextHint(challengeId: string): Promise<UnlockHintResponseDto> {
  const response = await httpClient.post<ApiResponse<UnlockHintResponseDto>>(
    `/challenges/${challengeId}/hints/unlock`
  );
  return response.data.data;
}
```

---

## 5. Hooks de TanStack Query (`features/challenge/hooks/`)

### 5.1. Query Keys Factory (`challengeQueryKeys.ts`)

Ubicación: `apps/web/src/features/challenge/hooks/challengeQueryKeys.ts`

```typescript
export const challengeKeys = {
  all: ['challenge'] as const,
  details: () => [...challengeKeys.all, 'detail'] as const,
  detail: (id: string) => [...challengeKeys.details(), id] as const,
  attempts: (id: string) => [...challengeKeys.all, 'attempts', id] as const,
};
```

---

### 5.2. Hook de Consulta `useChallenge.ts`

Ubicación: `apps/web/src/features/challenge/hooks/useChallenge.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { challengeKeys } from './challengeQueryKeys';
import { getChallengeDetail } from '../api/challengeApi';
import { ChallengeDetailResponseDto } from '../types/challenge.types';

export function useChallenge(challengeId: string | undefined) {
  return useQuery<ChallengeDetailResponseDto, Error>({
    queryKey: challengeKeys.detail(challengeId ?? ''),
    queryFn: () => getChallengeDetail(challengeId!),
    enabled: Boolean(challengeId && challengeId.trim().length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché fresca
    gcTime: 1000 * 60 * 15,   // 15 minutos en memoria
    retry: (failureCount, error: any) => {
      // No reintentar si es 404 (No encontrado) o 403 (Bloqueado)
      if (error?.status === 404 || error?.status === 403) return false;
      return failureCount < 2;
    }
  });
}
```

---

### 5.3. Hook de Mutación `useUnlockHint.ts`

Ubicación: `apps/web/src/features/challenge/hooks/useUnlockHint.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeKeys } from './challengeQueryKeys';
import { catalogKeys } from '../../catalog/hooks/catalogQueryKeys';
import { unlockNextHint } from '../api/challengeApi';
import { ChallengeDetailResponseDto, UnlockHintResponseDto } from '../types/challenge.types';

export function useUnlockHint(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation<UnlockHintResponseDto, Error, void>({
    mutationFn: () => unlockNextHint(challengeId),
    onSuccess: (data) => {
      // 1. Actualización atómica en la caché del desafío actual
      queryClient.setQueryData<ChallengeDetailResponseDto>(
        challengeKeys.detail(challengeId),
        (old) => {
          if (!old) return old;

          const exists = old.hintsSummary.unlockedHints.some(
            (h) => h.orderIndex === data.unlockedHint.orderIndex
          );

          const updatedUnlockedHints = exists
            ? old.hintsSummary.unlockedHints
            : [...old.hintsSummary.unlockedHints, data.unlockedHint].sort(
                (a, b) => a.orderIndex - b.orderIndex
              );

          return {
            ...old,
            hintsSummary: {
              ...old.hintsSummary,
              unlockedCount: data.totalHintsUnlocked,
              unlockedHints: updatedUnlockedHints
            }
          };
        }
      );

      // 2. Invalidar caché del catálogo para sincronizar contadores de pistas
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });
    }
  });
}
```

---

## 6. Adaptador e Integración en `ChallengePage.tsx`

### 6.1. Adaptación de Modelo y Requisitos Automáticos:
El backend entrega `ChallengeDetailResponseDto`. Para enriquecer la experiencia visual:
* Se mapean `allowedServices` a `ServicePaletteItem[]`.
* Se construye la lista secuencial de pistas combinando las pistas ya desbloqueadas (`unlockedHints`) con marcadores de pistas bloqueadas hasta completar `hintsSummary.totalHints`.
* Se generan requerimientos visuales derivados de la dificultad y modo del caso.

### 6.2. Estados de Carga y Manejo de Errores:
* **`ChallengeWorkspaceSkeleton.tsx`:** Esqueleto animado que reproduce la cabecera, el panel izquierdo y el marco del canvas mientras se descarga el payload HTTP.
* **`ChallengeErrorState.tsx`:** Estado de error amigable:
  - Si `error` contiene `CHALLENGE_LOCKED` (403): Muestra candado con el mensaje pedagógico (ej. *"Debes completar el desafío anterior para acceder"*).
  - Si `error` contiene `CHALLENGE_NOT_FOUND` (404): Muestra advertencia de recurso no encontrado.
  - Botón de retorno al catálogo `/catalog`.

---

## 7. Plan de Pruebas Unitarias (Vitest + Testing Library)

Se implementarán 3 suites de pruebas completas en `apps/web/src/features/challenge/`:

1. **`api/__tests__/challengeApi.test.ts`:**
   * Debe invocar `httpClient.get('/challenges/{id}')` y devolver la respuesta desempaquetada.
   * Debe invocar `httpClient.post('/challenges/{id}/hints/unlock')` y devolver la pista desbloqueada.
2. **`hooks/__tests__/useChallenge.test.tsx`:**
   * Debe retornar los datos del desafío cuando la consulta HTTP es exitosa.
   * Debe manejar errores 404 y 403 sin reintentos innecesarios.
   * No debe ejecutar la consulta si el `challengeId` es nulo o vacío.
3. **`hooks/__tests__/useUnlockHint.test.tsx`:**
   * Debe ejecutar la mutación de desbloqueo exitosamente.
   * Debe actualizar la caché de `challengeKeys.detail(id)` con la nueva pista revelada.
   * Debe invalidar `catalogKeys.units()`.
4. **`pages/__tests__/ChallengePage.test.tsx` (Actualización):**
   * Debe renderizar el skeleton en estado `isLoading`.
   * Debe inicializar el store `useCanvasStore` con los `allowedServices` y `lastAttemptGraph` devueltos por `useChallenge`.
   * Debe mostrar el estado de error cuando el hook falla.

---

## 8. Criterios de Aceptación y Checklist de Verificación

- [ ] **Modelos de Tipos:**
  - [ ] `ChallengeDetailResponseDto`, `UnlockHintResponseDto`, `HintsSummaryDto`, `UnlockedHintDto` definidos en `challenge.types.ts`.
- [ ] **Servicio de API (`challengeApi.ts`):**
  - [ ] Implementadas funciones `getChallengeDetail` y `unlockNextHint`.
- [ ] **Hooks de TanStack Query:**
  - [ ] `challengeQueryKeys.ts` con fábrica de claves.
  - [ ] `useChallenge.ts` con políticas de reintento y caché.
  - [ ] `useUnlockHint.ts` con actualización optimista de caché e invalidación cruzada de catálogo.
- [ ] **Integración en Componentes:**
  - [ ] `ChallengePage.tsx` conectado a `useChallenge` y `useUnlockHint`.
  - [ ] `ChallengeWorkspaceSkeleton.tsx` y `ChallengeErrorState.tsx` implementados y probados.
- [ ] **Calidad y Cobertura:**
  - [ ] 100% de tests unitarios aprobados en Vitest.
  - [ ] `tsc -b && vite build` completado con Exit Code 0.
