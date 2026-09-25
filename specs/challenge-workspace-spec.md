# Especificación Técnica: Layout del Workspace del Desafío (Fase 5 - Hito 5.3)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura visual, componentes modulares, interacción Drag & Drop HTML5/React Flow, ergonomía en 3 paneles, cajón de pistas progresivas con penalización, barra de herramientas flotante del canvas y ensamblado del **Workspace del Desafío** (`ChallengePage.tsx` y subsistema `features/challenge`), correspondiente a la **Tarea 5.3** de la **Fase 5** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El desarrollo se rige por las directivas de UI/UX ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), el catálogo de componentes de React Flow ([`specs/react-flow-components-spec.md`](file:///c:/workspace/aws/aws-game/specs/react-flow-components-spec.md)), el store de canvas atómico ([`specs/canvas-store-spec.md`](file:///c:/workspace/aws/aws-game/specs/canvas-store-spec.md)), las mecánicas de juego ([`docs/10-game-mechanics.md`](file:///c:/workspace/aws/aws-game/docs/10-game-mechanics.md)) y los contratos de backend ([`specs/catalog-challenges-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/catalog-challenges-module-spec.md) y [`specs/hints-evaluation-module-spec.md`](file:///c:/workspace/aws/aws-game/specs/hints-evaluation-module-spec.md)).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       LAYOUT DEL WORKSPACE DEL DESAFÍO (features/challenge)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [← Catálogo]  Arquitectura Web Resiliente  [Intermedio] [Builder]   [⏱ 04:35] [💡 1/3]  [🚀 Enviar (4)]  │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                            WorkspaceHeader.tsx                                              │
├───────────────────────────────┬─────────────────────────────────────────────┬───────────────────────────────┤
│ PANEL IZQUIERDO (320px/360px) │ PANEL CENTRAL (Lienzo Flexible)             │ PANEL DERECHO (320px)         │
│                               │                                             │ (Desplegable / Drawer)        │
│ [ Contexto ] [ Servicios AWS] │ ┌─────────────────────────────────────────┐ │ ┌───────────────────────────┐ │
│ ───────────────────────────── │ │  ArchitectureCanvas.tsx                 │ │ │ HintDrawer.tsx            │ │
│ • Tarjeta Caso de Uso         │ │  • Dot Grid (Fondo de Cuadrícula)       │ │ │ • Pistas Reveladas        │ │
│ • Requisitos de Arquitectura  │ │  • Drop Zone (Drag & Drop desde paleta) │ │ │ • Botón Desbloquear       │ │
│ • Restricciones Técnicas      │ │  • React Flow Viewport (Pan & Zoom)     │ │ │   (-5 pts)                │ │
│ ───────────────────────────── │ │                                         │ │ • Diálogo de Confirmación   │ │
│ • Paleta de Componentes       │ │  [+] [-] [⤢ Fit] | [🗑 Reiniciar Lienzo]│ │ │   de Penalización (RN-07) │ │
│   - Tarjetas Draggable        │ │  (Floating CanvasToolbar.tsx)           │ │ └───────────────────────────┘ │
│   - Badges (Máx. 2, Disp: 1)  │ └─────────────────────────────────────────┘ │                               │
│   - Agrupadas por Categoría   │                                             │                               │
│ (ProblemContextPanel &        │                                             │                               │
│  ServicePalette)              │                                             │                               │
└───────────────────────────────┴─────────────────────────────────────────────┴───────────────────────────────┘
```

### Objetivos Clave:
1. **Ensamblado Ergonómico en 3 Paneles (`ChallengePage.tsx`):**
   * Estructura responsiva de pantalla completa sin scroll vertical global del navegador, con altura confinada `h-[calc(100vh-4rem)]` (descontando el header global persistente de 64px).
   * Paneles laterales colapsables/redimensionables para garantizar máxima superficie de trabajo para el canvas visual en monitores estándar ($\ge 1280 \times 720$ px).
2. **Barra Superior del Workspace (`WorkspaceHeader.tsx`):**
   * Retorno ágil al catálogo con conservación de contexto (`/catalog`).
   * Título del desafío, badges semánticos de dificultad (`easy`, `intermediate`, `hard`, `integrator`), modo de juego (`builder`, `fixArchitecture`) y XP base en juego.
   * Contador de pistas utilizadas vs. totales (`Pistas: 1/3`).
   * Cronómetro de sesión / tiempo transcurrido (en formato `MM:SS`) como elemento motivacional de gamificación (**RNF-08**).
   * Botón principal **"Enviar solución"** destacado en `aws-orange` (`bg-amber-500 hover:bg-amber-400 active:scale-95`), dinámicamente habilitado cuando el canvas contiene al menos un nodo (`hasComponents()`).
3. **Panel Lateral Izquierdo Paginado (`ProblemContextPanel.tsx` & `ServicePalette.tsx`):**
   * Selector por pestañas fluidas: **"Contexto & Requisitos"** y **"Paleta de Servicios"**.
   * Pestaña 1: Caso de uso descriptivo, requerimientos técnicos esperados y restricciones declarativas.
   * Pestaña 2: Catálogo de servicios AWS permitidos en el desafío (**RN-03**), agrupados por categoría (*Compute, Database, Networking, Storage*), con visualización del límite `maxInstances` (**RN-04**) y recuento reactivo de instancias instanciadas / disponibles.
   * Soporte Drag & Drop nativo HTML5 (`dataTransfer.setData('application/awsquest-service', ...)`) para arrastrar tarjetas hacia el canvas.
4. **Lienzo Central de Arquitectura (`ArchitectureCanvas.tsx` & `CanvasToolbar.tsx`):**
   * Contenedor de `@xyflow/react` v12 con `Background` (cuadrícula punteada *Dot Grid* con color adaptativo a Dark/Light mode), `Controls` minimalistas y `MiniMap` colapsable.
   * Zona receptora de eventos (`onDragOver`, `onDrop`) que proyecta las coordenadas del puntero de pantalla a coordenadas del lienzo usando `screenToFlowPosition` de React Flow, invocando `addNode(service, position)`.
   * Barra de herramientas flotante (`CanvasToolbar.tsx`) que incluye controles de zoom, ajuste a pantalla (*Fit View*) y el botón de peligro **"Reiniciar Canvas"** con diálogo de confirmación (**RN-11 / CU-06**).
5. **Cajón de Pistas Progresivas (`HintDrawer.tsx`):**
   * Panel lateral colapsable derecho con soporte de apertura/cierre rápido vía botón o atajo de teclado.
   * Lista cronológica y secuencial de pistas (**RN-06**): visualización del texto de pistas ya reveladas y penalización acumulada.
   * Botón de desbloqueo para la siguiente pista con badge de costo (ej. `-5 pts`, `-10 pts`) y modal o diálogo de advertencia de penalización (**RN-07**).
6. **Manejo de Estados de Carga y Errores:**
   * Skeletons animados durante la carga del desafío.
   * Pantalla de error amigable cuando el ID es inválido o el desafío está bloqueado (**RN-01**).
7. **Suite de Pruebas Unitarias Rigurosa (Vitest + React Testing Library):**
   * Cobertura exhaustiva de interacciones: navegación, cambio de tabs, arrastre de servicios, botón de envío condicional, apertura del drawer de pistas y reseteo del canvas.

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en el Layout del Workspace |
| :--- | :--- | :--- |
| **RF-02** | Visualización de Casos de Negocio | `ProblemContextPanel` exhibe el caso práctico real, necesidades del cliente y objetivos del diseño. |
| **RF-03** | Paleta de Servicios AWS | `ServicePalette` renderiza la lista filtrada de servicios autorizados para el desafío activo. |
| **RF-04 / RN-04** | Límites de Instanciación | `ServicePalette` deshabilita el arrastre de una tarjeta cuando se instanció el número máximo de réplicas permitidas. |
| **RF-06** | Lienzo React Flow y Dot Grid | `ArchitectureCanvas` integra el canvas infinito, cuadrícula punteada sutil y controles de navegación. |
| **RF-11 / RN-06** | Pistas Progresivas Secuenciales | `HintDrawer` presenta las pistas desbloqueadas e impide saltarse el orden prefijado (1, 2, 3...). |
| **RF-12 / RN-07** | Penalización de Puntuación | Diálogo de confirmación antes de descontar puntos en el puntaje final del usuario. |
| **RF-13 / RN-12** | Envío Explícito de Solución | El botón "Enviar solución" en `WorkspaceHeader` se habilita sólo cuando hay componentes en el canvas. |
| **RF-10 / RN-11** | Reinicio y Reintentos (CU-06) | Botón "Reiniciar Canvas" en `CanvasToolbar` restaura el lienzo al estado inicial (`resetCanvas`). |
| **RNF-01** | Fluidez y Ergonomía (60 FPS) | Conexión directa de React Flow con `useCanvasStore` sin ciclos de re-render en paneles laterales. |
| **RNF-04** | Soporte Dual de Tema | Variables de Tailwind `dark:` y `light:` aplicadas a headers, drawers, toolbars y dot grid. |
| **RNF-05** | Iconografía y Badges | Iconos SVG oficiales de AWS en la paleta y símbolos de `lucide-react`. |
| **UI/UX §3.3** | Espacio de Trabajo en 3 Paneles | Layout de alta densidad visual con paneles izquierdo y derecho colapsables y canvas central dominante. |

---

## 3. Arquitectura y Árbol de Componentes del Workspace

```text
apps/web/src/features/challenge/
├── components/
│   ├── WorkspaceHeader.tsx             # Barra superior: título, badges, timer, pistas, botón de envío
│   ├── ProblemContextPanel.tsx         # Panel izquierdo Tab 1: descripción del problema, requisitos, restricciones
│   ├── ServicePalette.tsx              # Panel izquierdo Tab 2: lista arrastrable de servicios AWS por categoría
│   ├── ServicePaletteItemCard.tsx      # Tarjeta individual arrastrable con drag events y contador de instancias
│   ├── ArchitectureCanvas.tsx          # Lienzo central de React Flow con ReactFlowProvider y eventos Drag & Drop
│   ├── CanvasToolbar.tsx               # Barra de herramientas flotante: zoom, fit view, reiniciar canvas
│   ├── HintDrawer.tsx                  # Cajón lateral derecho colapsable de pistas secuenciales
│   ├── HintUnlockModal.tsx             # Diálogo modal de confirmación de penalización de puntos (-X pts)
│   ├── ResetCanvasModal.tsx            # Diálogo modal de confirmación para reiniciar el lienzo
│   └── ChallengeWorkspaceSkeleton.tsx  # Estado de carga esqueleto del workspace completo
├── pages/
│   └── ChallengePage.tsx               # Página raíz del desafío: coordina layout en 3 paneles y estado del workspace
└── types/
    └── challenge.types.ts              # Modelos de datos del desafío, pistas y contexto del workspace
```

---

## 4. Modelos de Tipos del Workspace (`challenge.types.ts`)

Ubicación: `apps/web/src/features/challenge/types/challenge.types.ts`

```typescript
import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';
import { SemanticGraphDto, ServicePaletteItem } from '../../canvas/types/canvas.types';

/**
 * Pista individual revelada o disponible en el desafío.
 */
export interface ChallengeHint {
  orderIndex: number;
  text?: string | null;
  penaltyPoints: number;
  isUnlocked: boolean;
}

/**
 * Resumen de pistas consumido por el workspace.
 */
export interface ChallengeHintsSummary {
  totalHints: number;
  unlockedCount: number;
  hints: ChallengeHint[];
}

/**
 * Requisito o restricción técnica declarativa para la UI de contexto.
 */
export interface ArchitectureRequirement {
  id: string;
  type: 'required_service' | 'connection' | 'anti_pattern' | 'instance_limit';
  title: string;
  description: string;
}

/**
 * Modelo completo del detalle del desafío para el Workspace.
 * Mapeado desde ChallengeDetailResponseDto del backend.
 */
export interface ChallengeDetail {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  allowedServices: ServicePaletteItem[];
  hintsSummary: ChallengeHintsSummary;
  lastAttemptGraph?: SemanticGraphDto | null;
  requirements?: ArchitectureRequirement[];
}
```

---

## 5. Especificación de Componentes

### 5.1. Barra Superior del Workspace (`WorkspaceHeader.tsx`)

#### Responsabilidades:
1. Navegación de retorno al catálogo mediante botón `[← Volver]`.
2. Muestra del título del desafío con tooltip o texto completo.
3. Badges semánticos:
   * **Dificultad:** Fácil (verde), Intermedio (ámbar), Difícil (naranja), Integrador (púrpura).
   * **Modo:** `Builder` o `Reparar`.
   * **Recompensa:** `+{baseXP} XP`.
4. **Cronómetro de Sesión (`SessionTimer`):**
   * Contador incremental de tiempo (`00:00`) activado al montar el workspace, formateado en `MM:SS`.
5. **Contador de Pistas:**
   * Botón/badge interactivo `[💡 Pistas: X/Y]` que abre el `HintDrawer`.
6. **Botón Principal "Enviar solución":**
   * Color dominante `bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold`.
   * Estado deshabilitado (`disabled`, opacidad 50%, cursor `not-allowed`) cuando no hay componentes en el canvas (`hasComponents() === false`).
   * Indicador visual de cantidad de componentes actuales en el lienzo (ej. `Enviar solución (3)`).
   * Al hacer clic, dispara la acción `onSubmit()` (preparada para la Fase 6).

---

### 5.2. Panel de Contexto y Paleta de Servicios (`ProblemContextPanel.tsx` & `ServicePalette.tsx`)

#### Responsabilidades:
1. **Tabs de Navegación en el Panel Izquierdo:**
   * Tab 1: **"Requisitos"** (icono `FileText`).
   * Tab 2: **"Servicios AWS"** (icono `Layers` o `Boxes`).
2. **Tab 1: Contenido de Requisitos y Caso:**
   * Resumen del problema arquitectónico empresarial.
   * Bloque de requisitos esenciales (ej. *"Tolerancia a fallos con Multi-AZ"*, *"Balanceador de carga frontal"*).
   * Bloque de advertencias o restricciones (ej. *"No exponer la base de datos a Internet"*).
3. **Tab 2: Paleta de Servicios AWS (`ServicePalette.tsx`):**
   * Agrupamiento automático por categoría:
     * **Compute:** EC2, Lambda, ECS, Auto Scaling.
     * **Database:** RDS, DynamoDB, ElastiCache.
     * **Networking:** ALB, CloudFront, API Gateway, Route 53, VPC.
     * **Storage:** S3, EFS.
     * **Integration:** SQS, SNS, EventBridge.
   * Filtro rápido de búsqueda por texto para localizar servicios rápidamente.
4. **Tarjeta de Servicio Arrastrable (`ServicePaletteItemCard.tsx`):**
   * Renderizado de icono oficial AWS, nombre del servicio y badge de instancias restantes:
     * Si `maxInstances` está definido: `Instancias: N / Max`.
     * Si se alcanza el límite: tarjeta opacada (`opacity-50 grayscale`), borde tenue, cursor `not-allowed`, atributo `draggable={false}` y aviso `Límite alcanzado (RN-04)`.
   * Evento `onDragStart`:
     ```typescript
     const handleDragStart = (e: React.DragEvent) => {
       if (!canAdd) {
         e.preventDefault();
         return;
       }
       e.dataTransfer.setData('application/awsquest-service', JSON.stringify(service));
       e.dataTransfer.effectAllowed = 'copy';
     };
     ```

---

### 5.3. Lienzo de Arquitectura y Toolbar (`ArchitectureCanvas.tsx` & `CanvasToolbar.tsx`)

#### Responsabilidades:
1. **Contenedor React Flow (`@xyflow/react` v12):**
   * Envoltorio obligatorio con `<ReactFlowProvider>` para permitir el uso seguro de `useReactFlow()` y utilidades de coordenadas.
   * Registro inmutable de tipos: `nodeTypes={nodeTypes}` y `edgeTypes={edgeTypes}` importados de `canvasElementTypes.ts`.
   * Enlace bidireccional estricto con `useCanvasStore`:
     * `nodes={nodes}`
     * `edges={edges}`
     * `onNodesChange={onNodesChange}`
     * `onEdgesChange={onEdgesChange}`
     * `onConnect={onConnect}`
2. **Fondo de Cuadrícula (`Background`):**
   * Variante `BackgroundVariant.Dots`.
   * Tamaño de cuadrícula: `gap={16}` o `gap={20}`, tamaño de punto `size={1.5}`.
   * Color de puntos adaptativo: `#cbd5e1` (slate-300) en Light Mode y `#334155` (slate-700) en Dark Mode.
3. **Manejo del Drop Drag & Drop:**
   * `onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}`.
   * `onDrop`:
     ```typescript
     const onDrop = (event: React.DragEvent) => {
       event.preventDefault();
       const rawData = event.dataTransfer.getData('application/awsquest-service');
       if (!rawData) return;
       
       const service: ServicePaletteItem = JSON.parse(rawData);
       const reactFlowBounds = canvasWrapperRef.current?.getBoundingClientRect();
       if (!reactFlowBounds) return;

       // Proyectar coordenadas del puntero a coordenadas internas de React Flow
       const position = screenToFlowPosition({
         x: event.clientX,
         y: event.clientY,
       });

       addNode(service, position);
     };
     ```
4. **Barra de Herramientas Flotante (`CanvasToolbar.tsx`):**
   * Posicionada de forma fija en la esquina inferior izquierda del canvas (`absolute bottom-4 left-4 z-10`).
   * Botón `Zoom In` (`+`), `Zoom Out` (`-`) y `Fit View` (`⤢`).
   * Botón **"Reiniciar Canvas"** con icono `RotateCcw` y estilo de advertencia ámbar/rojo. Al pulsar, abre `ResetCanvasModal`.

---

### 5.4. Diálogos Modales Auxiliares

1. **`ResetCanvasModal.tsx` (Confirmación de Reinicio - RN-11):**
   * Alerta al usuario de que se perderán los cambios actuales no guardados.
   * Acciones: *"Cancelar"* y *"Confirmar Reinicio"* (invoca `resetCanvas()` de `useCanvasStore`).
2. **`HintUnlockModal.tsx` (Advertencia de Penalización - RN-07):**
   * Notifica el costo explícito en puntos de la pista (ej. *"Esta pista descontará 5 puntos de tu nota final"*).
   * Acciones: *"Mantener bloqueada"* y *"Desbloquear Pista (-5 pts)"*.

---

### 5.5. Cajón Lateral de Pistas (`HintDrawer.tsx`)

#### Responsabilidades:
1. Panel colapsable posicionado en el extremo derecho del workspace.
2. Cabecera con título, indicador de pistas usadas (ej. `1 de 3 pistas reveladas`) y botón de cierre `✕`.
3. Listado vertical de tarjetas de pistas:
   * **Pista Desbloqueada:** Fondo `bg-surface-elevated`, borde sutil, texto explicativo completo de la pista y badge `Penalización: -X pts`.
   * **Pista Siguiente Bloqueada:** Indicador de pista disponible, botón de acción `Desbloquear Pista (-X pts)` que invoca `onUnlockHintRequested()`.
   * **Pistas Posteriores Bloqueadas:** Bloqueadas secuencialmente (**RN-06**), con icono de candado y leyenda *"Completa la pista anterior para habilitar esta pista"*.
4. Contador total acumulado de penalización actual.

---

### 5.6. Ensamblado Raíz: `ChallengePage.tsx`

#### Responsabilidades:
1. Obtención del parámetro de ruta `useParams<{ id: string }>()`.
2. Consumo de datos mock/reales del desafío mediante hook o mock provisional del hito 5.3 (preparado para la conexión definitiva con `useChallenge(id)` en el hito 5.4).
3. Sincronización con `useCanvasStore`:
   * Al montar un desafío con éxito, invoca `loadSemanticGraph(challenge.lastAttemptGraph, challenge.allowedServices)` y `setAllowedServices(challenge.allowedServices)`.
4. Renderizado del layout responsivo:
   * Header superior sticky.
   * Grid o flexbox horizontal con panel izquierdo colapsable (toggle con botón chevron), lienzo central expansible y drawer de pistas colateral.

---

## 6. Accesibilidad (a11y) y Atajos de Teclado

1. **Atajos de Teclado del Workspace:**
   * `Escape`: Cierra modales abiertos (`ResetCanvasModal`, `HintUnlockModal`) o cierra el `HintDrawer`.
   * `Delete` / `Backspace`: Elimina el nodo o arista seleccionado en el canvas (controlado nativamente por React Flow / `useCanvasStore`).
   * `F` o `Space + Drag`: Ajuste de vista o paneo del lienzo.
2. **Atributos ARIA:**
   * `aria-label` en botones del header, toolbar y botones de pistas.
   * `aria-expanded` en el panel colapsable y en el cajón de pistas.
   * `role="dialog"` y `aria-modal="true"` en los modales de confirmación.

---

## 7. Plan de Pruebas Unitarias (Vitest + Testing Library)

Se diseñarán pruebas unitarias exhaustivas en `apps/web/src/features/challenge/components/__tests__/`:

1. **`WorkspaceHeader.test.tsx`:**
   * Debe mostrar el título del desafío, badges de dificultad, modo y XP.
   * El botón "Enviar solución" debe estar deshabilitado cuando el canvas esté vacío (`hasComponents === false`).
   * El botón "Enviar solución" debe habilitarse cuando haya al menos un nodo en el canvas.
   * Debe llamar al callback de apertura del cajón de pistas al pulsar el botón de pistas.
2. **`ServicePalette.test.tsx` & `ServicePaletteItemCard.test.tsx`:**
   * Debe renderizar los servicios agrupados por categoría.
   * Debe mostrar el conteo de instancias disponibles según `maxInstances`.
   * Debe deshabilitar el arrastre y aplicar estilos bloqueados cuando se alcanza el límite máximo de instancias (**RN-04**).
   * Debe configurar correctamente el payload `dataTransfer` en el evento `dragstart`.
3. **`ArchitectureCanvas.test.tsx` & `CanvasToolbar.test.tsx`:**
   * Debe montar el lienzo de React Flow con nodos y aristas del store.
   * Debe procesar el drop de un servicio calculando las coordenadas mediante `screenToFlowPosition` y llamando a `addNode`.
   * Debe abrir el modal de confirmación al presionar "Reiniciar Canvas" y resetear el lienzo al confirmar (**RN-11**).
4. **`HintDrawer.test.tsx`:**
   * Debe renderizar la lista de pistas en orden secuencial.
   * Debe mostrar el texto de las pistas desbloqueadas.
   * Debe mostrar el botón de desbloqueo con la penalización correspondiente únicamente para la siguiente pista en cola (**RN-06**).
5. **`ChallengePage.test.tsx`:**
   * Debe renderizar el layout en 3 paneles y cargar los servicios en el store del canvas.

---

## 8. Criterios de Aceptación y Checklist de Verificación

- [ ] **Estructura y Modelos de Datos:**
  - [ ] Definidos `challenge.types.ts` con tipado coherente con backend DTOs.
- [ ] **Componente `WorkspaceHeader.tsx`:**
  - [ ] Botón de regreso al catálogo.
  - [ ] Título, badge de dificultad, modo y XP.
  - [ ] Timer de sesión en formato `MM:SS`.
  - [ ] Contador de pistas y botón "Enviar solución" condicionado a la existencia de componentes.
- [ ] **Componentes de Panel Lateral Izquierdo:**
  - [ ] Pestañas de "Requisitos" y "Servicios AWS".
  - [ ] `ServicePalette.tsx` con agrupación temática y filtrado.
  - [ ] `ServicePaletteItemCard.tsx` con control visual de `maxInstances` y eventos HTML5 Drag & Drop.
- [ ] **Lienzo Central `ArchitectureCanvas.tsx`:**
  - [ ] Contenedor `ReactFlowProvider` + `@xyflow/react` v12.
  - [ ] `Background` punteado (Dot Grid) adaptable al tema.
  - [ ] Receptor de drop que proyecta coordenadas y ejecuta `addNode`.
  - [ ] `CanvasToolbar.tsx` con zoom, fit view y diálogo de confirmación para reiniciar canvas.
- [ ] **Cajón de Pistas `HintDrawer.tsx`:**
  - [ ] Apertura y cierre lateral suave.
  - [ ] Pistas progresivas secuenciales con modal de confirmación de penalización de puntos.
- [ ] **Página Principal `ChallengePage.tsx`:**
  - [ ] Integración ergonómica en 3 paneles sin desbordamiento de ventana.
  - [ ] Inicialización del store con servicios permitidos y grafo previo si existiese.
- [ ] **Calidad y Verificación:**
  - [ ] 100% de tests unitarios pasando en Vitest.
  - [ ] Cero errores de compilación TypeScript (`tsc -b && vite build`).
