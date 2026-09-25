# Especificación Técnica: Serialización del Grafo y Mutación de Evaluación (Fase 6 - Hito 6.1)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura de serialización semántica, validación del lado del cliente, capa de servicios HTTP, mutación reactiva con TanStack Query v5, sincronización del progreso de gamificación y estrategia de pruebas unitarias para la **Serialización del Grafo y Mutación de Evaluación** (`features/evaluation`), correspondiente a la **Tarea 6.1** de la **Fase 6** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

La implementación conecta directamente el lienzo interactivo de React Flow estructurado en la Fase 5 ([`specs/canvas-store-spec.md`](file:///c:/workspace/aws/aws-game/specs/canvas-store-spec.md), [`specs/challenge-workspace-spec.md`](file:///c:/workspace/aws/aws-game/specs/challenge-workspace-spec.md)) con los endpoints del motor de evaluación del backend desarrollados en la Fase 3 ([`specs/hints-evaluation-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/hints-evaluation-module-spec.md), [`docs/08-api-spec.md`](file:///c:/workspace/aws/aws-game/docs/08-api-spec.md)), garantizando una evaluación atómica, determinista y de alto rendimiento.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                      FLUJO DE EVALUACIÓN Y SERIALIZACIÓN DEL GRAFO (features/evaluation)                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   ┌────────────────────────────────────────┐                ┌───────────────────────────────────────────────┐   │
│   │         ESTADO VISUAL DEL CANVAS       │                │      HOOK MUTATION: useEvaluateChallenge      │   │
│   │  (useCanvasStore / React Flow Nodes)   │                │                                               │   │
│   │  • Nodos: id, serviceCode, config      │                │  • Estado: isPending, isSuccess, isError      │   │
│   │  • Aristas: source, target, connType   │                │  • Invocación atómica a la API                │   │
│   │  • Coordenadas visuales (x, y)         │                │  • OnSuccess: Invalida 'catalog' y 'challenge'│   │
│   └───────────────────┬────────────────────┘                │  • OnSuccess: Actualiza XP y Level en Auth    │   │
│                       │                                     │  • OnSuccess: Resalta nodos con feedback      │   │
│                       │ Serialización Pura                  └───────────────────────▲───────────────────────┘   │
│                       ▼                                                             │                           │
│   ┌────────────────────────────────────────┐                                        │ Inyecta Payload Limpio    │
│   │     SERIALIZADOR: graphSerializer      │                                        │                           │
│   │  • serializeCanvasToSemanticGraph()    ├────────────────────────────────────────┘                           │
│   │  • createEvaluatePayload(graph, hints) │                                                                    │
│   │  • validateArchitectureForEvaluation() │                                                                    │
│   │  (Filtra coordenadas y metadatos UI)   │                                                                    │
│   └────────────────────────────────────────┘                                                                    │
│                                                                                     │ Consume Función HTTP      │
│                                                                                     ▼                           │
│                                                             ┌───────────────────────────────────────────────┐   │
│                                                             │       CAPA DE API: evaluationApi.ts           │   │
│                                                             │  • evaluateArchitecture(challengeId, payload) │   │
│                                                             │  • getChallengeAttempts(challengeId)          │   │
│                                                             └───────────────────────┬───────────────────────┘   │
│                                                                                     │ Inyecta Bearer JWT        │
│                                                                                     ▼                           │
│                                                             ┌───────────────────────────────────────────────┐   │
│                                                             │    CLIENTE HTTP (shared/api/httpClient.ts)    │   │
│                                                             └───────────────────────┬───────────────────────┘   │
│                                                                                     │ HTTPS / POST              │
│                                                                                     ▼                           │
│                                                             ┌───────────────────────────────────────────────┐   │
│                                                             │      BACKEND REST API (ChallengesController)  │   │
│                                                             │      POST /api/v1/challenges/{id}/evaluate   │   │
│                                                             └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Objetivos Clave:
1. **Tipado Estricto TypeScript (`features/evaluation/types/evaluation.types.ts`):**
   * Definir los contratos de request y response alineados con la API de evaluación en ASP.NET Core:
     - `EvaluateArchitectureRequestDto`: payload limpio que encapsula `graph: SemanticGraphDto` y `hintsUsed: number`.
     - `EvaluateArchitectureResponseDto`: resultado con `score`, `passed`, `isNewHighScore`, `earnedXP`, `currentUserXP`, `currentUserLevel`, `feedback` estructurado (`summary`, `items`) y `attemptId`.
     - `FeedbackItemDto`: diagnóstico individual tipado con `status` (`'pass' | 'fail' | 'warning' | 'info'`), `category` (`'serviceSelection' | 'connection' | 'availability' | 'security' | 'costOptimization' | 'performance' | 'operationalExcellence' | 'antiPattern' | 'hintPenalty' | 'architecturePattern' | 'configuration'`), `title`, `explanation`, `penaltyApplied` y `relatedComponentIds`.
     - `ChallengeAttemptHistoryDto`: histórico de auditoría con snapshots de grafos evaluados.
2. **Transformador y Serializador Semántico (`features/evaluation/utils/graphSerializer.ts`):**
   * Implementar funciones puras desacopladas de React:
     - `serializeCanvasToSemanticGraph(nodes, edges)`: transforma nodos y aristas de React Flow a `SemanticGraphDto`, suprimiendo posiciones `(x, y)`, anchos, altos, flags de selección y clases CSS.
     - `createEvaluateArchitecturePayload(nodes, edges, hintsUsed)`: genera el `EvaluateArchitectureRequestDto` consolidado.
     - `validateArchitectureForEvaluation(nodes, edges)`: validación de guardado previo (*fast-fail* en cliente) que comprueba que existan nodos, no haya conexiones huérfanas ni bucles reflexivos (`source === target`).
3. **Capa de Comunicación HTTP (`features/evaluation/api/evaluationApi.ts`):**
   * `evaluateArchitecture(challengeId, payload)`: ejecuta `POST /api/v1/challenges/{id}/evaluate` utilizando `httpClient` y retornando `EvaluateArchitectureResponseDto`.
   * `getChallengeAttempts(challengeId)`: ejecuta `GET /api/v1/challenges/{id}/attempts` retornando `ChallengeAttemptHistoryDto[]`.
4. **Query Keys Factory (`features/evaluation/hooks/evaluationQueryKeys.ts`):**
   * Fábrica estandarizada de claves para TanStack Query: `evaluationKeys.all`, `evaluationKeys.attempts(challengeId)`.
5. **Hook de Mutación Reactivo `useEvaluateChallenge` (`features/evaluation/hooks/useEvaluateChallenge.ts`):**
   * Encapsula la mutación de TanStack Query `useMutation`.
   * **Sincronización Automática de Gamificación:** En `onSuccess`, invoca `useAuthStore.getState().updateUser({ totalXP, level })` para refrescar instantáneamente el Header global y la barra de progreso de nivel.
   * **Invalidación Inteligente de Caché:** Invalida atómicamente `catalogKeys.units()` (para refrescar estados de completado y desbloqueo progresivo), `challengeKeys.detail(challengeId)` (para actualizar `highScore` y `lastAttemptGraph`) y `evaluationKeys.attempts(challengeId)`.
   * **Mapeo de Feedback Visual al Canvas:** Helper opcional para marcar los nodos y aristas con estados visuales (`pass`, `error`, `warning`) usando `useCanvasStore.setNodeVisualStatus` en base a los `relatedComponentIds` devueltos.
6. **Suite Integral de Pruebas Unitarias (Vitest + Testing Library):**
   * Pruebas para el serializador (`graphSerializer.test.ts`), capa de API (`evaluationApi.test.ts`) y hook de mutación (`useEvaluateChallenge.test.tsx`) con cobertura del 100% de casos nominales y de error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error).

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en la Serialización y Mutación de Evaluación |
| :--- | :--- | :--- |
| **RF-13** | Envío y Serialización Semántica | El frontend extrae el estado del lienzo y lo serializa a un grafo semántico agnóstico de coordenadas visuales de pantalla. |
| **RF-14 / RN-08** | Evaluación Determinista en Memoria | El backend procesa el grafo en memoria ($< 100$ ms) y devuelve la calificación cuantitativa inmediata. |
| **RF-15 / RN-02** | Criterio de Aprobación | Retorno de `score` $[0, 100]$ y flag `passed: true` si $\text{score} \ge 70$. |
| **RF-16 / RN-09** | Diagnóstico Pedagógico y Antipatrones | Recepción de feedback desglosado con explicaciones técnicas de buenas prácticas AWS y penalizaciones aplicadas. |
| **RF-17 / RN-10** | Gamificación y Anti-Refarming | El backend calcula el `earnedXP` deduciendo el récord anterior; el hook propaga `currentUserXP` y `currentUserLevel` al store global de usuario. |
| **RF-18** | Auditoría de Intentos | Cada evaluación genera un registro inmutable en base de datos accesible vía `GET /attempts`. |
| **RF-19 / RN-12** | Mapeo Cromático en el Canvas | Los `relatedComponentIds` del feedback se vinculan a los nodos del canvas para colorear aciertos (verde) o errores (rojo). |
| **RN-01** | Acceso Progresivo | Si el desafío estaba bloqueado por prerrequisitos, la mutación captura el error 403 `CHALLENGE_LOCKED`. |
| **RN-06 / RN-07** | Deducción de Pistas | El payload envía `hintsUsed` extraído del contexto del desafío para auditar la deducción de puntos. |
| **RN-11 / CU-05** | Preservación del Canvas | Tras evaluar, el lienzo no se limpia automáticamente, permitiendo al usuario corregir fallos sobre su arquitectura existente. |
| **RNF-01 / RNF-02** | Rendimiento y Fluidez | Serialización pura en $O(V + E) < 2$ ms y ciclo de evaluación completado en $< 2$ segundos. |
| **RNF-13** | Transaccionalidad | Persistencia ACID en backend con invalidación coherente de cachés TanStack Query en cliente. |

---

## 3. Especificación de Tipos de Dominio (`evaluation.types.ts`)

Ubicación: `apps/web/src/features/evaluation/types/evaluation.types.ts`

```typescript
import { SemanticGraphDto } from '../../canvas/types/canvas.types';

/**
 * Estado semántico de cada ítem de retroalimentación pedagógica.
 * Alineado con FeedbackItemStatus.cs en backend (serializado en camelCase).
 */
export type FeedbackItemStatus = 'pass' | 'fail' | 'warning' | 'info';

/**
 * Categorías de evaluación de arquitectura AWS según el Well-Architected Framework.
 * Alineado con FeedbackCategory.cs en backend (serializado en camelCase).
 */
export type FeedbackCategory =
  | 'serviceSelection'
  | 'connection'
  | 'architecturePattern'
  | 'availability'
  | 'security'
  | 'performance'
  | 'costOptimization'
  | 'hintPenalty'
  | 'configuration';

/**
 * Diagnóstico individual de acierto, error o advertencia generado por el motor de evaluación.
 * Alineado con FeedbackItem.cs.
 */
export interface FeedbackItemDto {
  status: FeedbackItemStatus;
  category: FeedbackCategory;
  title: string;
  explanation: string;
  penaltyApplied: number;
  relatedComponentIds: string[];
}

/**
 * Contenedor general de retroalimentación pedagógica.
 * Alineado con EvaluationFeedback.cs.
 */
export interface EvaluationFeedbackDto {
  summary: string;
  items: FeedbackItemDto[];
}

/**
 * DTO de solicitud enviado a POST /api/v1/challenges/{id}/evaluate.
 * Alineado con EvaluateArchitectureRequestDto.cs.
 */
export interface EvaluateArchitectureRequestDto {
  graph: SemanticGraphDto;
  hintsUsed: number;
}

/**
 * DTO de respuesta retornado por POST /api/v1/challenges/{id}/evaluate.
 * Alineado con EvaluateArchitectureResponseDto.cs.
 */
export interface EvaluateArchitectureResponseDto {
  score: number;
  passed: boolean;
  isNewHighScore: boolean;
  earnedXP: number;
  currentUserXP: number;
  currentUserLevel: number;
  feedback: EvaluationFeedbackDto;
  attemptId: string;
}

/**
 * DTO de auditoría histórica de un intento previo.
 * Alineado con ChallengeAttemptHistoryDto.cs devuelto por GET /api/v1/challenges/{id}/attempts.
 */
export interface ChallengeAttemptHistoryDto {
  id: string;
  score: number;
  passed: boolean;
  hintsUsed: number;
  createdAt: string;
  graphSubmitted: SemanticGraphDto;
}

/**
 * Resultado de validación rápida en cliente antes de enviar a evaluación.
 */
export interface ClientValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}
```

---

## 4. Transformador y Serializador Semántico (`graphSerializer.ts`)

Ubicación: `apps/web/src/features/evaluation/utils/graphSerializer.ts`

El módulo `graphSerializer.ts` proporciona utilidades puras e inmutables para convertir el estado visual de `@xyflow/react` en estructuras semánticas limpias, además de realizar validaciones tempranas en el cliente.

```typescript
import { AwsCanvasNode, AwsCanvasEdge, SemanticGraphDto, GraphComponentDto, GraphConnectionDto } from '../../canvas/types/canvas.types';
import { EvaluateArchitectureRequestDto, ClientValidationResult } from '../types/evaluation.types';

/**
 * Transforma los nodos y aristas visuales de React Flow a un grafo semántico
 * completamente agnóstico de coordenadas (x, y), dimensiones y clases de renderizado.
 */
export function serializeCanvasToSemanticGraph(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[]
): SemanticGraphDto {
  const components: GraphComponentDto[] = nodes.map((node) => ({
    id: node.id,
    serviceCode: node.data.serviceCode,
    label: node.data.name || null,
    config: {
      isMultiAz: node.data.config?.isMultiAz ?? null,
      autoScaling: node.data.config?.autoScaling ?? null,
      instanceCount: node.data.config?.instanceCount ?? 1,
      isPublic: node.data.config?.isPublic ?? null,
      subnetType: node.data.config?.subnetType ?? null,
      storageClass: node.data.config?.storageClass ?? null,
      customProperties: node.data.config?.customProperties
    }
  }));

  const connections: GraphConnectionDto[] = edges.map((edge) => ({
    fromComponentId: edge.source,
    toComponentId: edge.target,
    connectionType: edge.data?.connectionType ?? 'HTTP_HTTPS'
  }));

  return {
    components,
    connections
  };
}

/**
 * Crea el payload completo EvaluateArchitectureRequestDto listo para ser enviado a la API.
 */
export function createEvaluateArchitecturePayload(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[],
  hintsUsed: number = 0
): EvaluateArchitectureRequestDto {
  const graph = serializeCanvasToSemanticGraph(nodes, edges);
  return {
    graph,
    hintsUsed: Math.max(0, hintsUsed)
  };
}

/**
 * Valida rápidamente en el cliente la coherencia topológica antes de ejecutar la petición HTTP.
 * Previene llamadas innecesarias al backend con grafos vacíos o con aristas inválidas.
 */
export function validateArchitectureForEvaluation(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[]
): ClientValidationResult {
  if (!nodes || nodes.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Debes colocar al menos un servicio en el canvas antes de evaluar tu arquitectura.'
    };
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const edge of edges) {
    if (!edge.source || !edge.target) {
      return {
        isValid: false,
        errorMessage: 'Existe una conexión incompleta en el diseño arquitectónico.'
      };
    }

    if (edge.source === edge.target) {
      return {
        isValid: false,
        errorMessage: 'Un componente de arquitectura no puede conectarse a sí mismo.'
      };
    }

    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      return {
        isValid: false,
        errorMessage: 'Existe una conexión hacia un nodo que ya no se encuentra en el canvas.'
      };
    }
  }

  return {
    isValid: true,
    errorMessage: null
  };
}
```

---

## 5. Capa de Servicios HTTP (`evaluationApi.ts`)

Ubicación: `apps/web/src/features/evaluation/api/evaluationApi.ts`

```typescript
import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  ChallengeAttemptHistoryDto
} from '../types/evaluation.types';

/**
 * Envía una solución arquitectónica para su evaluación pedagógica en memoria.
 * Endpoint: POST /api/v1/challenges/{challengeId}/evaluate
 * 
 * @param challengeId Identificador único del desafío (UUID).
 * @param payload Grafo semántico y contador de pistas consumidas.
 * @returns Promesa con los resultados cuantitativos y cualitativos de la evaluación.
 */
export async function evaluateArchitecture(
  challengeId: string,
  payload: EvaluateArchitectureRequestDto
): Promise<EvaluateArchitectureResponseDto> {
  const response = await httpClient.post<ApiResponse<EvaluateArchitectureResponseDto>>(
    `/api/v1/challenges/${challengeId}/evaluate`,
    payload
  );
  return response.data.data;
}

/**
 * Obtiene el historial cronológico de intentos realizados por el usuario en el desafío.
 * Endpoint: GET /api/v1/challenges/{challengeId}/attempts
 * 
 * @param challengeId Identificador único del desafío (UUID).
 * @returns Lista histórica de intentos ordenados de forma descendente por fecha.
 */
export async function getChallengeAttempts(
  challengeId: string
): Promise<ChallengeAttemptHistoryDto[]> {
  const response = await httpClient.get<ApiResponse<ChallengeAttemptHistoryDto[]>>(
    `/api/v1/challenges/${challengeId}/attempts`
  );
  return response.data.data;
}
```

---

## 6. Fábrica de Claves de Consulta (`evaluationQueryKeys.ts`)

Ubicación: `apps/web/src/features/evaluation/hooks/evaluationQueryKeys.ts`

```typescript
/**
 * Fábrica estandarizada de Query Keys para el módulo de evaluación.
 * Permite invalidaciones atómicas y precisas tras nuevos intentos.
 */
export const evaluationKeys = {
  all: ['evaluation'] as const,
  attemptsRoot: () => [...evaluationKeys.all, 'attempts'] as const,
  attempts: (challengeId: string) => [...evaluationKeys.attemptsRoot(), challengeId] as const
};
```

---

## 7. Hook de Mutación Reactivo (`useEvaluateChallenge.ts`)

Ubicación: `apps/web/src/features/evaluation/hooks/useEvaluateChallenge.ts`

```typescript
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { evaluateArchitecture } from '../api/evaluationApi';
import { evaluationKeys } from './evaluationQueryKeys';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  FeedbackItemDto
} from '../types/evaluation.types';
import { challengeKeys } from '../../challenge/hooks/challengeQueryKeys';
import { catalogKeys } from '../../catalog/hooks/catalogQueryKeys';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useCanvasStore } from '../../canvas/stores/useCanvasStore';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

export interface UseEvaluateChallengeOptions {
  onSuccess?: (data: EvaluateArchitectureResponseDto) => void;
  onError?: (error: ApiHttpError) => void;
  autoApplyVisualFeedback?: boolean;
}

/**
 * Hook reactivo para evaluar una arquitectura contra el motor de reglas del backend.
 * Sincroniza automáticamente la gamificación (XP y nivel) en Zustand, actualiza
 * el feedback cromático en los nodos del canvas e invalida las cachés relevantes.
 * 
 * @param challengeId Identificador del desafío activo.
 * @param options Callbacks y opciones de comportamiento.
 */
export function useEvaluateChallenge(
  challengeId: string,
  options?: UseEvaluateChallengeOptions
) {
  const queryClient = useQueryClient();
  const autoApplyFeedback = options?.autoApplyVisualFeedback ?? true;

  return useMutation<EvaluateArchitectureResponseDto, ApiHttpError, EvaluateArchitectureRequestDto>({
    mutationFn: (payload: EvaluateArchitectureRequestDto) =>
      evaluateArchitecture(challengeId, payload),

    onSuccess: (data: EvaluateArchitectureResponseDto) => {
      // 1. Sincronizar automáticamente XP y Nivel en el store global de autenticación (RN-10)
      if (data.currentUserXP !== undefined && data.currentUserLevel !== undefined) {
        useAuthStore.getState().updateUser({
          totalXP: data.currentUserXP,
          level: data.currentUserLevel
        });
      }

      // 2. Aplicar feedback visual cromático a los nodos y aristas del canvas si está habilitado (RN-12)
      if (autoApplyFeedback && data.feedback?.items) {
        applyFeedbackToCanvas(data.feedback.items);
      }

      // 3. Invalidar consultas de catálogo para reflejar nuevos puntajes y estados completados (RN-02)
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });

      // 4. Invalidar detalle del desafío para refrescar HighScore y última arquitectura (CU-02)
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(challengeId) });

      // 5. Invalidar el historial de intentos para la pestaña de auditoría (CU-05)
      queryClient.invalidateQueries({ queryKey: evaluationKeys.attempts(challengeId) });

      // 6. Ejecutar callback del llamador
      options?.onSuccess?.(data);
    },

    onError: (error: ApiHttpError) => {
      options?.onError?.(error);
    }
  });
}

/**
 * Función auxiliar para colorear los nodos en el canvas en función de los diagnósticos pedagógicos.
 */
export function applyFeedbackToCanvas(feedbackItems: FeedbackItemDto[]): void {
  const canvasStore = useCanvasStore.getState();
  
  // Reiniciar estados visuales previos
  canvasStore.resetVisualStatuses();

  // Mapear de forma prioritaria: Errores (Fail) > Advertencias (Warning) > Aciertos (Pass)
  feedbackItems.forEach((item) => {
    if (!item.relatedComponentIds || item.relatedComponentIds.length === 0) return;

    let nodeStatus: 'pass' | 'error' | 'warning' | 'default' = 'default';
    if (item.status === 'fail') nodeStatus = 'error';
    else if (item.status === 'warning') nodeStatus = 'warning';
    else if (item.status === 'pass') nodeStatus = 'pass';

    if (nodeStatus !== 'default') {
      item.relatedComponentIds.forEach((componentId) => {
        canvasStore.setNodeVisualStatus(componentId, nodeStatus, item.explanation);
      });
    }
  });
}
```

---

## 8. Estrategia y Diseño de Pruebas Unitarias (Vitest)

### 8.1. Pruebas del Serializador (`graphSerializer.test.ts`)

Ubicación: `apps/web/src/features/evaluation/utils/__tests__/graphSerializer.test.ts`

* **Casos de Prueba:**
  1. `serializeCanvasToSemanticGraph`: Transforma nodos y aristas de React Flow a `SemanticGraphDto` suprimiendo propiedades `position`, `type`, `selected`, `width`, `height`.
  2. `serializeCanvasToSemanticGraph`: Conserva intactas las propiedades técnicas de `config` (`isMultiAz`, `autoScaling`, `instanceCount`, etc.).
  3. `createEvaluateArchitecturePayload`: Empaqueta correctamente el grafo y el contador de pistas (`hintsUsed`), forzando valores mínimos de 0 para enteros negativos.
  4. `validateArchitectureForEvaluation`: Falla si el array de nodos está vacío con mensaje descriptivo.
  5. `validateArchitectureForEvaluation`: Falla si existe un enlace reflexivo (`source === target`).
  6. `validateArchitectureForEvaluation`: Falla si una arista hace referencia a un nodo inexistente.
  7. `validateArchitectureForEvaluation`: Pasa satisfactoriamente ante una topología válida con 3 nodos conectados en cascada.

### 8.2. Pruebas de la Capa de API (`evaluationApi.test.ts`)

Ubicación: `apps/web/src/features/evaluation/api/__tests__/evaluationApi.test.ts`

* **Casos de Prueba:**
  1. `evaluateArchitecture`: Realiza `POST /api/v1/challenges/{id}/evaluate` con el payload exacto y extrae `response.data.data`.
  2. `evaluateArchitecture`: Propaga excepciones `ApiHttpError` cuando el servidor responde 400 Bad Request (`INVALID_GRAPH_PAYLOAD`) o 403 Forbidden (`CHALLENGE_LOCKED`).
  3. `getChallengeAttempts`: Realiza `GET /api/v1/challenges/{id}/attempts` y retorna la lista de intentos tipada.

### 8.3. Pruebas del Hook de Mutación (`useEvaluateChallenge.test.tsx`)

Ubicación: `apps/web/src/features/evaluation/hooks/__tests__/useEvaluateChallenge.test.tsx`

* **Casos de Prueba:**
  1. Ejecuta la mutación exitosamente y retorna el resultado de evaluación (`Score: 95`, `Passed: true`).
  2. Invoca `useAuthStore.updateUser` actualizando `totalXP` y `level` tras la evaluación.
  3. Invalida las query keys correspondientes (`catalogKeys.units`, `challengeKeys.detail`, `evaluationKeys.attempts`).
  4. Invoca `applyFeedbackToCanvas` marcando los nodos identificados en `relatedComponentIds` con estado `error` o `pass`.
  5. Ejecuta el callback `onError` ante un error HTTP de la API sin modificar el progreso de gamificación.

---

## 9. Matriz de Trazabilidad y Validación de Cumplimiento

| Archivo / Componente | Requisito Técnico | Método de Verificación |
| :--- | :--- | :--- |
| `evaluation.types.ts` | Modelado estricto de DTOs camelCase | `tsc --noEmit` & Vitest |
| `graphSerializer.ts` | Serialización pura agnóstica de coordenadas y validación | Pruebas unitarias en `graphSerializer.test.ts` |
| `evaluationApi.ts` | Consumo tipado con Bearer JWT de `POST /evaluate` y `GET /attempts` | Pruebas unitarias en `evaluationApi.test.ts` |
| `evaluationQueryKeys.ts` | Fábrica jerárquica de claves de caché | Pruebas unitarias en `useEvaluateChallenge.test.tsx` |
| `useEvaluateChallenge.ts` | Mutación TanStack Query + Sincronización Zustand + Visual Feedback | Pruebas unitarias en `useEvaluateChallenge.test.tsx` |

---

## 10. Conclusión y Siguiente Paso

Con la formalización de esta especificación técnica para la **Tarea 6.1 (Serialización del Grafo y Mutación de Evaluación)**, quedan definidos con total rigor los contratos, la transformación inmutable de datos, la gestión de mutaciones y la sincronización en tiempo real del progreso del jugador.

El siguiente paso una vez aprobada e implementada esta especificación será la **Tarea 6.2: Modal de Evaluación y Resultados (`EvaluationModal.tsx`, `ScoreGauge.tsx`, `FeedbackList.tsx`)**.
