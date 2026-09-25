# Especificación Técnica: Historial de Intentos en Workspace (Fase 6 - Hito 6.4)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura frontend, contratos de datos, diseño de componentes, flujos de interacción, diseño visual (UI/UX), criterios de accesibilidad (a11y WCAG 2.1 AA) y estrategia de pruebas automatizadas para el **Historial de Intentos en el Workspace de Desafíos**, correspondiente a la **Tarea 6.4** de la **Fase 6: Flujo de Evaluación, Feedback y Gamificación** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

### 1.1. Propósito y Valor Pedagógico
En el aprendizaje de arquitectura en la nube mediante prueba y error, el estudiante necesita auditar sus intentos pasados, entender cómo evolucionaron sus soluciones, comparar calificaciones obtenidas y poder **restaurar un diseño previo en el lienzo interactivo** para corregirlo o refinarlo sin tener que diagramarlo desde cero (**RF-16, RF-18, RN-09, RN-11, CU-05**).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           HISTORIAL DE INTENTOS EN EL WORKSPACE (CU-05, RF-16, RN-11)                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   PANEL LATERAL IZQUIERDO (ProblemContextPanel)                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ [ Servicios ]   [ Requisitos ]   [ Historial (3) ] ★ NUEVA PESTAÑA DEDICADA                             │   │
│   ├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                                                         │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │ Intento #3 (Más reciente)                       Score: 95/100 [ APROBADO ]                        │  │   │
│   │  │ Hace 2 minutos • 1 pista usada • 3 componentes • 2 conexiones                                     │  │   │
│   │  │ [ ↺ Cargar en Canvas ]                                                                            │  │   │
│   │  └───────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                                                         │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │ Intento #2                                      Score: 45/100 [ FALLADO ]                         │  │   │
│   │  │ Hace 15 minutos • 1 pista usada • 2 componentes • 1 conexión                                      │  │   │
│   │  │ [ ↺ Cargar en Canvas ]                                                                            │  │   │
│   │  └───────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                                                         │   │
│   │  ┌───────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│   │  │ Intento #1                                      Score: 0/100  [ FALLADO ]                         │  │   │
│   │  │ Hace 30 minutos • 0 pistas • 1 componente • 0 conexiones                                          │  │   │
│   │  │ [ ↺ Cargar en Canvas ]                                                                            │  │   │
│   │  └───────────────────────────────────────────────────────────────────────────────────────────────────┘  │   │
│   │                                                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                            │                                                                    │
│                                            ▼ Acción: Click "Cargar en Canvas"                                   │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                       CANVAS INTERACTIVO (React Flow)                                   │   │
│   │  • useCanvasStore.loadSemanticGraph(attempt.graphSubmitted, allowedServices)                            │   │
│   │  • Nodos y conexiones restaurados con posiciones e inspectores sincronizados                            │   │
│   │  • Notificación flotante de confirmación (Toast): "Intento #3 cargado exitosamente en el lienzo"        │   │
│   └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación Técnica en Frontend |
| :--- | :--- | :--- |
| **RF-16** | Ciclo de Reintento y Aprendizaje | Permite al usuario regresar a cualquier arquitectura evaluada previamente para iterar sobre ella y corregir fallos señalados en la retroalimentación. |
| **RF-18** | Registro de Progreso del Usuario | Muestra la evolución cronológica de envíos realizados para el desafío activo. |
| **RN-09** | Conservación del Puntaje Máximo | Cada intento mantiene su propia nota histórica sin alterar el *High Score* global registrado en el catálogo si un reintento obtiene menor calificación. |
| **RN-11** | Auditoría Completa de Intentos | Cada registro de intento contiene la instantánea inmutable del grafo semántico evaluado (`graphSubmitted`), nota obtenida, pistas usadas y fecha de envío. |
| **CU-05** | Caso de Uso: Evaluar y Consultar Intentos | Consumo de `GET /api/v1/challenges/{id}/attempts` mediante React Query con invalidación automática tras una nueva evaluación. |
| **RNF-01 / RNF-04** | Rendimiento y UX | Transiciones fluidas entre pestañas, soporte para Dark/Light Mode, renderizado reactivo a 60 FPS y carga asíncrona no bloqueante del canvas. |
| **RNF-06** | Retroalimentación Inmediata | Sincronización en tiempo real: al completarse un envío exitoso o fallido en `useEvaluateChallenge`, la lista de intentos se actualiza de inmediato sin recargar la página. |

---

## 3. Contratos de Datos y Tipado TypeScript

### 3.1. DTO de Intento Histórico (`ChallengeAttemptHistoryDto`)
Alineado con el backend (`AwsQuest.Application.Dtos.Evaluation.ChallengeAttemptHistoryDto`):

```typescript
// apps/web/src/features/evaluation/types/evaluation.types.ts

import { SemanticGraphDto } from '../../canvas/types/canvas.types';

export interface ChallengeAttemptHistoryDto {
  /** Identificador único del intento (UUID) */
  id: string;
  /** Calificación numérica obtenida (0 a 100) */
  score: number;
  /** Indica si la solución alcanzó el umbral mínimo de aprobación (>= 70) */
  passed: boolean;
  /** Cantidad acumulada de pistas pedagógicas consumidas al momento del envío */
  hintsUsed: number;
  /** Timestamp ISO-8601 de creación del intento en el servidor */
  createdAt: string;
  /** Instantánea completa del grafo semántico evaluado */
  graphSubmitted: SemanticGraphDto;
}
```

### 3.2. Contrato de API en Frontend (`evaluationApi.ts`)
```typescript
// apps/web/src/features/evaluation/api/evaluationApi.ts

/**
 * Obtiene el historial cronológico de intentos realizados por el usuario en el desafío.
 * Endpoint: GET /api/v1/challenges/{challengeId}/attempts
 */
export async function getChallengeAttempts(
  challengeId: string
): Promise<ChallengeAttemptHistoryDto[]> {
  const response = await httpClient.get<ApiResponse<ChallengeAttemptHistoryDto[]>>(
    `/challenges/${challengeId}/attempts`
  );
  return response.data.data;
}
```

---

## 4. Arquitectura de Estado y Hook Reactivo (`useChallengeAttempts`)

### 4.1. Hook de Consulta con TanStack Query (`useChallengeAttempts.ts`)
Ubicación: `apps/web/src/features/evaluation/hooks/useChallengeAttempts.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { getChallengeAttempts } from '../api/evaluationApi';
import { evaluationKeys } from './evaluationQueryKeys';
import { ChallengeAttemptHistoryDto } from '../types/evaluation.types';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

export interface UseChallengeAttemptsResult {
  attempts: ChallengeAttemptHistoryDto[];
  isLoading: boolean;
  isError: boolean;
  error: ApiHttpError | null;
  refetch: () => void;
  attemptsCount: number;
  bestScore: number;
}

/**
 * Hook reactivo para consultar y mantener sincronizado el historial de intentos de un desafío.
 * 
 * @param challengeId Identificador único del desafío (UUID).
 */
export function useChallengeAttempts(challengeId?: string): UseChallengeAttemptsResult {
  const query = useQuery<ChallengeAttemptHistoryDto[], ApiHttpError>({
    queryKey: evaluationKeys.attempts(challengeId ?? ''),
    queryFn: () => getChallengeAttempts(challengeId ?? ''),
    enabled: Boolean(challengeId),
    staleTime: 1000 * 60 * 2, // 2 minutos de stale time
  });

  const attempts = query.data ?? [];
  const bestScore = attempts.reduce((max, curr) => Math.max(max, curr.score), 0);

  return {
    attempts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    attemptsCount: attempts.length,
    bestScore
  };
}
```

### 4.2. Sincronización Automática e Invalidación de Query Keys
El hook `useEvaluateChallenge.ts` ya contiene la invalidación de la clave:
```typescript
queryClient.invalidateQueries({ queryKey: evaluationKeys.attempts(challengeId) });
```
Esto garantiza que, tras cada llamada a `POST /api/v1/challenges/{id}/evaluate`, la lista de intentos se refresca inmediatamente en segundo plano sin intervención manual.

---

## 5. Especificación de Componentes de Interfaz de Usuario

### 5.1. Actualización de `ProblemContextPanel.tsx`
Ubicación: `apps/web/src/features/challenge/components/ProblemContextPanel.tsx`

Se extiende el panel lateral izquierdo para soportar **3 pestañas de navegación**:
1. **`services` (Servicios):** Paleta de servicios AWS permitidos y distractores.
2. **`requirements` (Requisitos):** Enunciado del caso de negocio y restricciones técnicas.
3. **`history` (Historial):** Nueva pestaña con listado de intentos previos y contador badge (`attemptsCount`).

```typescript
export type ContextPanelTab = 'services' | 'requirements' | 'history';

interface ProblemContextPanelProps {
  challengeId?: string;
  description: string;
  requirements?: ArchitectureRequirement[];
  allowedServices: ServicePaletteItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRestoreAttempt?: (attempt: ChallengeAttemptHistoryDto) => void;
}
```

#### Comportamiento en Modo Colapsado (`isCollapsed = true`):
* Muestra los 3 iconos en columna vertical:
  - `Boxes` (Servicios)
  - `FileText` (Requisitos)
  - `History` (Historial) con un punto indicador (*dot*) si existen intentos previos.
* Al hacer clic en cualquiera de los iconos colapsados, se descolapsa automáticamente el panel y se activa la pestaña seleccionada.

---

### 5.2. Componente de Lista de Intentos (`AttemptHistoryList.tsx`)
Ubicación: `apps/web/src/features/evaluation/components/AttemptHistoryList.tsx`

```typescript
export interface AttemptHistoryListProps {
  challengeId: string;
  allowedServices: ServicePaletteItem[];
  onRestoreAttempt: (attempt: ChallengeAttemptHistoryDto) => void;
}
```

* **Responsabilidades:**
  1. Invoca `useChallengeAttempts(challengeId)`.
  2. Gestiona los 4 estados posibles:
     - **Cargando:** Renderiza `AttemptHistorySkeleton`.
     - **Error:** Renderiza mensaje con botón "Reintentar conexión".
     - **Vacío (`attempts.length === 0`):** Renderiza `AttemptHistoryEmptyState`.
     - **Con Datos:** Renderiza la cabecera resumen (Total de intentos, Mejor Puntaje) y la lista de tarjetas `AttemptHistoryCard` ordenadas descendentemente por fecha.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESUMEN DE ACTIVIDAD                                                        │
│ 3 envíos realizados                 Mejor récord: 95/100 (Aprobado)         │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Tarjeta Intento #3 (Más reciente) ]                                       │
│ [ Tarjeta Intento #2 ]                                                      │
│ [ Tarjeta Intento #1 ]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.3. Tarjeta Individual de Intento (`AttemptHistoryCard.tsx`)
Ubicación: `apps/web/src/features/evaluation/components/AttemptHistoryCard.tsx`

```typescript
export interface AttemptHistoryCardProps {
  attempt: ChallengeAttemptHistoryDto;
  attemptNumber: number; // Ej. 1, 2, 3...
  isLatest: boolean;
  onRestore: (attempt: ChallengeAttemptHistoryDto) => void;
}
```

* **Elementos Visuales:**
  1. **Cabecera de la Tarjeta:**
     - Número correlativo: `Intento #{attemptNumber}`.
     - Badge de "Más reciente" (`bg-amber-500/10 text-amber-600 border border-amber-500/20`) si `isLatest === true`.
     - Badge de Resultado:
       - Si `passed === true`: `Aprobado` (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`).
       - Si `passed === false`: `No Aprobado` (`bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`).
     - Nota numérica con tipografía monoespaciada en negrita: `{score}/100`.
  2. **Metadatos y Resumen del Grafo:**
     - Fecha relativa formateada con `Intl.RelativeTimeFormat` o función utilitaria (`hace 5 min`, `hace 2 horas`, `ayer`).
     - Tooltip con fecha exacta ISO (`20 de septiembre de 2026, 20:30:15`).
     - Indicador de pistas: `💡 {hintsUsed} pista(s) usada(s)` (o `Sin pistas`).
     - Resumen del grafo evaluado: `🧩 {componentsCount} servicios • 🔗 {connectionsCount} conexiones`.
  3. **Botón de Acción "Cargar en Canvas":**
     - Botón secundario con icono `RotateCcw` o `UploadCloud`:
       > `[ ↺ Cargar en Canvas ]`
     - Al hacer clic, invoca `onRestore(attempt)`.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Intento #3  [ Más reciente ]                        95/100  [ Aprobado ]    │
│ ─────────────────────────────────────────────────────────────────────────── │
│ 🕒 Hace 3 minutos  •  💡 1 pista  •  🧩 3 servicios  •  🔗 2 conexiones     │
│                                                                             │
│ [ ↺ Cargar arquitectura en Canvas ]                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.4. Estado Vacío de Intentos (`AttemptHistoryEmptyState.tsx`)
Ubicación: `apps/web/src/features/evaluation/components/AttemptHistoryEmptyState.tsx`

* **Contenido:**
  - Icono ilustrativo: `History` / `Inbox` con color neutro atenuado.
  - Título: *"Sin intentos previos"*.
  - Explicación: *"Aún no has enviado ninguna solución para evaluar. Diseña tu arquitectura en el lienzo y presiona 'Enviar solución' en la barra superior."*.
  - Sugerencia motivacional: *"Tus intentos pasados y puntuaciones se registrarán aquí para que puedas consultar tu evolución."*.

---

### 5.5. Skeleton de Carga (`AttemptHistorySkeleton.tsx`)
Ubicación: `apps/web/src/features/evaluation/components/AttemptHistorySkeleton.tsx`

* **Contenido:**
  - 3 tarjetas con animación de pulso (*shimmer*) replicando la estructura de `AttemptHistoryCard` (cabecera, metadatos, botón de acción).

---

### 5.6. Diálogo de Confirmación para Restaurar (`RestoreAttemptModal.tsx`)
Ubicación: `apps/web/src/features/evaluation/components/RestoreAttemptModal.tsx`

Para evitar pérdidas accidentales de cambios no evaluados que el usuario tenga actualmente en el canvas:

```typescript
export interface RestoreAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  attemptNumber: number;
  attemptScore: number;
  currentNodesCount: number;
}
```

* **Lógica de Activación:**
  - Si el canvas actual tiene `nodes.length > 0`, se abre este modal advirtiendo:
    > *"¿Cargar el Intento #{attemptNumber}? Se reemplazará la arquitectura actual del lienzo ({currentNodesCount} nodos) con el diseño de este intento ({attemptScore}/100 pts)."*
  - Botón "Cancelar" (cierra modal sin cambios).
  - Botón "Reemplazar y Cargar" (ejecuta la restauración).
  - Si el canvas está vacío (`nodes.length === 0`), la restauración se ejecuta inmediatamente sin requerir confirmación modal.

---

## 6. Flujo de Integración en `ChallengePage.tsx`

### 6.1. Integración de la Restauración con `useCanvasStore`
En `ChallengePage.tsx`:

```typescript
// Manejar la restauración de un intento histórico en el lienzo
const handleRestoreAttempt = (attempt: ChallengeAttemptHistoryDto) => {
  const currentNodes = useCanvasStore.getState().nodes;
  
  const executeRestore = () => {
    // 1. Cargar el grafo guardado en el canvas store
    loadSemanticGraph(attempt.graphSubmitted, allowedServices);
    
    // 2. Limpiar estados visuales de error/feedback previo
    useCanvasStore.getState().resetVisualStatuses();
    
    // 3. Notificación informativa al usuario
    setFeedbackNotice(`Intento cargado en el lienzo (${attempt.score}/100 pts).`);
  };

  if (currentNodes.length > 0) {
    setAttemptToRestore({ attempt, callback: executeRestore });
    setIsRestoreModalOpen(true);
  } else {
    executeRestore();
  }
};
```

---

## 7. Diseño Visual y Accesibilidad (WCAG 2.1 AA)

### 7.1. Estilos y Clases Tailwind CSS
* **Pestaña Activa en `ProblemContextPanel`:**
  - Activa: `bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold`
  - Inactiva: `text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800`
* **Badges de Puntuación:**
  - Aprobado ($\ge 70$): `bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20`
  - Desaprobado ($< 70$): `bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20`
* **Botón Cargar en Canvas:**
  - `bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors`

### 7.2. Criterios de Accesibilidad:
- Pestañas con atributos ARIA: `role="tab"`, `aria-selected="true|false"`, `aria-controls="tabpanel-history"`.
- Panel de contenido: `role="tabpanel"`, `id="tabpanel-history"`, `aria-labelledby="tab-history"`.
- Botones de acción con `aria-label="Cargar intento número {N} con calificación {score} en el lienzo"`.
- Contraste de colores $\ge 4.5:1$ en modos claro y oscuro.
- Soporte para navegación completa por teclado (Tab, Enter, Espacio, Escape).

---

## 8. Plan de Pruebas Automatizadas (Vitest + React Testing Library)

### 8.1. Pruebas Unitarias del Hook (`useChallengeAttempts.test.tsx`)
Ubicación: `apps/web/src/features/evaluation/hooks/__tests__/useChallengeAttempts.test.tsx`
* Debe consultar `getChallengeAttempts` con el `challengeId` proporcionado.
* Debe calcular correctamente `attemptsCount` y `bestScore`.
* Debe manejar estados de carga (`isLoading`) y errores de red (`isError`).

### 8.2. Pruebas de Componentes
1. **`AttemptHistoryList.test.tsx`:**
   * Renderizado del estado de carga (skeleton).
   * Renderizado del estado vacío cuando la lista de intentos está vacía.
   * Renderizado de la lista ordenada de intentos con sus respectivas tarjetas.
   * Disparo del callback `onRestoreAttempt` al pulsar el botón de una tarjeta.
2. **`AttemptHistoryCard.test.tsx`:**
   * Despliegue correcto de nota, badge aprobado/fallado, pistas utilizadas y componentes.
   * Formateo de fecha relativa.
   * Disparo del evento de restauración al hacer clic en el botón.
3. **`RestoreAttemptModal.test.tsx`:**
   * Apertura del modal con advertencia de sobreescritura de nodos.
   * Ejecución de `onConfirm` al aceptar y `onClose` al cancelar o presionar `Escape`.
4. **`ProblemContextPanel.test.tsx`:**
   * Renderizado de las 3 pestañas (`Servicios`, `Requisitos`, `Historial`).
   * Cambio de pestaña al hacer clic en `Historial`.
   * Despliegue del contador de intentos en la pestaña.

---

## 9. Criterios de Aceptación y Checklist de Finalización

- [ ] La pestaña **"Historial"** se encuentra integrada en `ProblemContextPanel` con icono representativo y badge contador de intentos.
- [ ] Al consultar un desafío, `GET /api/v1/challenges/{id}/attempts` se ejecuta a través del hook `useChallengeAttempts`.
- [ ] Cada intento muestra su calificación numérica (0-100), estado (Aprobado/No Aprobado), fecha relativa, pistas usadas y resumen de componentes/conexiones.
- [ ] El botón *"Cargar en Canvas"* restaura fielmente los nodos, configuraciones y conexiones del intento en `useCanvasStore`.
- [ ] Si el lienzo actual contiene nodos, se solicita confirmación al usuario mediante `RestoreAttemptModal` antes de sobreescribir el diseño.
- [ ] Si el usuario no tiene intentos registrados, se despliega `AttemptHistoryEmptyState` con mensaje pedagógico orientador.
- [ ] Al enviar una nueva solución para evaluación, la lista de intentos se actualiza reactivamente al instante tras la respuesta del backend.
- [ ] Todas las pruebas unitarias y de componentes pasan al 100% en Vitest sin regresiones.
