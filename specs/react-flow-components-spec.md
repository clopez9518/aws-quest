# Especificación Técnica: Componentes Personalizados de React Flow (Fase 5 - Hito 5.2)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura visual, estructura de componentes, gestión de estados interactivos, directivas de accesibilidad, integración con `@xyflow/react` v12 y estrategia de pruebas para los **Componentes Personalizados de React Flow** en la aplicación web (**`apps/web`**), correspondiente a la **Tarea 5.2** de la **Fase 5** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)), en estricto cumplimiento con el diseño UI/UX ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), las mecánicas de juego ([`docs/10-game-mechanics.md`](file:///c:/workspace/aws/aws-game/docs/10-game-mechanics.md)), la arquitectura de frontend ([`docs/09-frontend-bootstrap.md`](file:///c:/workspace/aws/aws-game/docs/09-frontend-bootstrap.md)) y el store de canvas aislado previamente implementado ([`specs/canvas-store-spec.md`](file:///c:/workspace/aws/aws-game/specs/canvas-store-spec.md)).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 COMPONENTES PERSONALIZADOS DE REACT FLOW (features/canvas)                  │
│                                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ NODO DE SERVICIO: AwsServiceNode.tsx (type: 'awsServiceNode')                       │   │
│   │                                                                                     │   │
│   │                      (T) Handle Entrada (Target - Top)                              │   │
│   │   ┌─────────────────────────────────────────────────────────────────────────────┐   │   │
│   │   │ [Icono SVG]  Amazon EC2                                       [✕ Borrar]    │   │   │
│   │   │              Compute • [2 Instancias] [Multi-AZ]                            │   │   │
│   │   │ ─────────────────────────────────────────────────────────────────────────   │   │   │
│   │   │ ℹ Mensaje de Estado / Diagnóstico (Pass / Error / Warning)                  │   │   │
│   │   └─────────────────────────────────────────────────────────────────────────────┘   │   │
│   │                      (S) Handle Salida (Source - Bottom)                            │   │
│   └──────────────────────────────────────────┬──────────────────────────────────────────┘   │
│                                              │ Conexión Bezier Animada                      │
│                                              ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ CONEXIÓN VISUAL: CustomConnectionEdge.tsx (type: 'customConnectionEdge')            │   │
│   │                                                                                     │   │
│   │         Nodo Origen ─────────────[ HTTP / HTTPS  ✕ ]─────────────► Nodo Destino     │   │
│   │                                                                                     │   │
│   │  • Trazado SVG Curvo Bezier (getBezierPath)                                         │   │
│   │  • Animación de Tráfico de Red (stroke-dashoffset continuo a 60 FPS)                │   │
│   │  • Etiqueta Semántica Central (EdgeLabelRenderer)                                   │   │
│   │  • Botón Flotante de Eliminación Rápida [✕]                                         │   │
│   │  • Marcador de Flecha Direccional (MarkerType.ArrowClosed)                          │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Objetivos Clave:
1. **Construcción de `AwsServiceNode.tsx` (`features/canvas/components/nodes/`):**
   * Renderizado de alta definición del icono oficial de AWS SVG (con fallback resiliente a `/icons/aws/default.svg`).
   * Despliegue de tipografía semántica (nombre del servicio, badge de categoría temática).
   * Handles interactivos de conexión (`Position.Top` como Target, `Position.Bottom` como Source) con micro-animaciones de hover.
   * Visualización reactiva de parámetros arquitectónicos configurados (`isMultiAz`, `autoScaling`, recuento de instancias).
   * Botón de eliminación rápida contextual en el nodo con confirmación o eliminación inmediata coordinada con `useCanvasStore`.
   * Soporte integral de estados visuales: `default`, `hover`, `selected` (halo luminoso en `aws-orange`), `pass` (esmeralda), `error` (rojo pulsante) y `warning` (ámbar).
2. **Construcción de `CustomConnectionEdge.tsx` (`features/canvas/components/edges/`):**
   * Generación de curva suave mediante `getBezierPath` de `@xyflow/react`.
   * Animación fluida de flujo de datos simulando transferencia activa de paquetes de red a 60 FPS (**RNF-01**).
   * Integración de `EdgeLabelRenderer` para posicionar en el punto medio ($X, Y$) un badge semántico del tipo de conexión (`HTTP_HTTPS`, `DATABASE`, `ASYNC_QUEUE`, `INTERNAL_VPC`, `STORAGE`, `SECURITY_GROUP`).
   * Botón interactivo flotante de eliminación `✕` en la arista, accesible tanto por puntero como por teclado.
   * Estados visuales sincronizados con la evaluación (`default`, `selected`, `pass`, `error`).
3. **Mapeo Centralizado de Tipos (`nodeTypes` & `edgeTypes`):**
   * Exportar diccionarios inmutables para consumo directo en el lienzo `ArchitectureCanvas.tsx` de React Flow.
4. **Diseño Adaptable y Soporte Dual de Tema (Dark Mode & Light Mode):**
   * Cumplimiento estricto del Design System ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)): fondos `bg-surface-elevated`, bordes `border-subtle`, contrastes $\ge 4.5:1$ (WCAG AA).
5. **Suite de Pruebas Unitarias de Componentes (Vitest + Testing Library):**
   * Cobertura completa del renderizado, Handles, badges de configuración, estados visuales e interacción con `useCanvasStore`.

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en Componentes de React Flow |
| :--- | :--- | :--- |
| **RF-05** | Nodos de Servicios AWS | `AwsServiceNode` exhibe icono oficial, nombre técnico, categoría y estado de instanciación. |
| **RF-07** | Conexiones entre Componentes | `CustomConnectionEdge` dibuja enlaces dirigidos con flechas, badges de tipo y animación de paquetes. |
| **RF-08** | Configuración de Parámetros | `AwsServiceNode` muestra badges dinámicos cuando `isMultiAz`, `autoScaling` o réplicas están activos. |
| **RF-09 / RN-09** | Eliminación de Nodos y Aristas | Botón de eliminación directa en nodo y arista (`removeNode` y `removeEdge`) en cascada. |
| **RN-05** | Coherencia de Enlaces | Los Handles indican visualmente la dirección de flujo (Top para recepción / Bottom para emisión). |
| **RNF-01** | Rendimiento a 60 FPS | Animaciones CSS puras (`@keyframes`) aceleradas por GPU sin re-renderizados continuos de React. |
| **RNF-04** | Soporte Dual de Tema | Clases Tailwind con variantes `dark:` y `light:` en nodos, etiquetas de aristas y botones. |
| **RNF-05** | Iconografía Limpia | Iconos vectoriales oficiales en `/public/icons/aws/` y símbolos consistentes de `lucide-react`. |
| **RNF-06** | Feedback Visual Inmediato | Resaltado visual en verde esmeralda (`pass`), rojo (`error`) y ámbar (`warning`) tras la evaluación. |
| **UI/UX §4.1** | Diseño de Nodo AWS | Disposición tipo tarjeta con handles circulares, halo luminoso al seleccionarse y badges técnicos. |
| **UI/UX §4.2** | Líneas de Conexión SVG | Trazado bezier suave, puntos luminosos de tráfico y botón `X` en el centro de la arista. |

---

## 3. Especificación Detallada de `AwsServiceNode.tsx`

### 3.1. Ubicación y Firma del Componente
* **Ruta del Archivo:** `apps/web/src/features/canvas/components/nodes/AwsServiceNode.tsx`
* **Props:** `NodeProps<AwsCanvasNode>` (proveído por `@xyflow/react` v12).

### 3.2. Estructura de Handles de Conexión
Para garantizar conexiones naturales acordes a la dirección arquitectónica:
1. **Handle de Entrada (Target):**
   * `type="target"`
   * `position={Position.Top}`
   * `id="target-top"`
   * **Estilos:** Círculo de $12\times12$ px, fondo `bg-amber-500`, borde `border-2 border-slate-900 dark:border-slate-950`, con animación de escala en hover (`hover:scale-125 transition-transform`).
2. **Handle de Salida (Source):**
   * `type="source"`
   * `position={Position.Bottom}`
   * `id="source-bottom"`
   * **Estilos:** Círculo de $12\times12$ px idéntico para mantener coherencia visual.

### 3.3. Estados Visuales del Nodo

| Estado Visual (`visualStatus` / `selected`) | Clases de Borde y Fondo (Dark Mode) | Clases de Borde y Fondo (Light Mode) | Efecto Visual Adicional |
| :--- | :--- | :--- | :--- |
| **Default** | `bg-slate-900/90 border-slate-700/80` | `bg-white border-slate-200 shadow-sm` | Elevación sutil `shadow-md`. |
| **Hover** | `hover:border-slate-500 hover:shadow-lg` | `hover:border-slate-400 hover:shadow-md` | Micro-escalado `scale-[1.01]`. |
| **Selected** | `border-amber-500 ring-2 ring-amber-500/40 shadow-amber-500/10` | `border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10` | Halo luminoso (*glow ring*) y botón de borrado visible. |
| **Pass (Aprobado)** | `border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/20` | `border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50` | Badge de check verde con mensaje de acierto. |
| **Error (Fallo / SPOF)** | `border-red-500 ring-2 ring-red-500/40 bg-red-950/20` | `border-red-500 ring-2 ring-red-500/30 bg-red-50/50` | Pulso visual sutil y mensaje explicativo del fallo. |
| **Warning (Alerta)** | `border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/20` | `border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50` | Indicador ámbar de optimización sugerida. |

### 3.4. Anatomía del Contenido del Nodo

```text
┌─────────────────────────────────────────────────────────────┐
│ (T) Handle: Target (Top)                                    │
│                                                             │
│ ┌─────────┐ Amazon EC2                           [✕ Borrar] │
│ │ [SVG]   │ Compute                                         │
│ └─────────┘                                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Multi-AZ]  [Auto Scaling]  [x2 Instancias]             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ (S) Handle: Source (Bottom)                                 │
└─────────────────────────────────────────────────────────────┘
```

1. **Fila Superior:**
   * **Contenedor del Icono:** Contenedor cuadrado de $36\times36$ px con bordes redondeados (`rounded-lg bg-slate-800/60 dark:bg-slate-950/60 p-1.5 flex items-center justify-center`).
   * **Icono SVG:** Imagen vectorial `<img src={data.iconUrl} />` con `onError` fallback automático a `/icons/aws/default.svg`.
   * **Información del Servicio:**
     * Nombre: `text-xs font-bold text-slate-100 dark:text-slate-100 line-clamp-1`.
     * Categoría: `text-[10px] font-medium text-slate-400 uppercase tracking-wider`.
   * **Botón de Borrado Rápido:**
     * Botón con icono `Trash2` o `X` de `lucide-react`.
     * Se muestra con opacidad reducida en reposo y destaca al hacer hover o cuando el nodo está seleccionado.
     * Al hacer clic, ejecuta `e.stopPropagation()` e invoca `removeNode(id)` en `useCanvasStore`.
2. **Fila de Configuración Técnica (Badges Condicionales):**
   * Despliega badges compactos tipo píldora cuando las propiedades técnicas están activas:
     * Si `data.config.isMultiAz === true`: Badge verde/azul `Multi-AZ` con icono `ShieldCheck`.
     * Si `data.config.autoScaling === true`: Badge azul/cian `ASG` o `Auto Scaling` con icono `TrendingUp`.
     * Si `data.config.instanceCount && data.config.instanceCount > 1`: Badge ámbar `x{instanceCount} inst.`
     * Si `data.config.isPublic === true`: Badge `Público` con icono `Globe`.
3. **Banner Inferior de Estado / Diagnóstico (Fase 6):**
   * Si `data.statusMessage` existe y `data.visualStatus !== 'default'`:
     * Franja informativa compacta (`text-[10px] p-1 rounded bg-slate-800/80 border`) con icono contextual (`CheckCircle2` para pass, `AlertTriangle` para error).

---

## 4. Especificación Detallada de `CustomConnectionEdge.tsx`

### 4.1. Ubicación y Firma del Componente
* **Ruta del Archivo:** `apps/web/src/features/canvas/components/edges/CustomConnectionEdge.tsx`
* **Props:** `EdgeProps<AwsCanvasEdge>` (proveído por `@xyflow/react` v12).

### 4.2. Geometría y Trazado SVG
* Utiliza `getBezierPath` de `@xyflow/react`:
  ```typescript
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  ```
* Renderiza el trazado SVG con dos capas:
  1. **Capa Invisible de Interacción (Hitbox):** Un trazado transparente de grosor amplio (`strokeWidth={20} stroke="transparent"`) para permitir clic, hover y selección precisos sin frustración del usuario.
  2. **Capa Visual Visible:** Trazado bezier estilizado con animación de flujo de paquetes.

### 4.3. Animación de Tráfico de Datos (60 FPS)
* La línea de conexión incorpora `strokeDasharray="5, 5"` y la clase CSS `animate-edge-flow` o keyframes SVG nativos:
  ```css
  @keyframes edgeFlow {
    from {
      stroke-dashoffset: 20;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  .animate-edge-flow {
    animation: edgeFlow 1s linear infinite;
  }
  ```
* Si `data.animated === false`, el trazado se renderiza estático continuo.

### 4.4. Etiqueta Semántica Central y Botón de Eliminación (`EdgeLabelRenderer`)
A través de `EdgeLabelRenderer` de `@xyflow/react`, se proyecta un contenedor HTML posicionado exactamente en `labelX` y `labelY`:

```tsx
<EdgeLabelRenderer>
  <div
    style={{
      position: 'absolute',
      transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      pointerEvents: 'all'
    }}
    className="nodrag nopan flex items-center gap-1 p-1 rounded-full bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700 shadow-md transition-all group"
  >
    {/* Badge del Tipo de Conexión */}
    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full text-slate-300">
      {formatConnectionType(data?.connectionType)}
    </span>

    {/* Botón de Eliminación Rápida */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        removeEdge(id);
      }}
      className="p-1 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
      title="Eliminar conexión"
      aria-label="Eliminar conexión"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
</EdgeLabelRenderer>
```

### 4.5. Mapeo Semántico de Conexiones (`formatConnectionType`)

| `ConnectionType` | Texto Formateado | Icono Representativo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| `HTTP_HTTPS` | `HTTP / HTTPS` | `Globe` | Azul / Slate |
| `DATABASE` | `Database` | `Database` | Esmeralda |
| `ASYNC_QUEUE` | `Async Queue` | `Layers` | Púrpura |
| `INTERNAL_VPC` | `Internal VPC` | `Shield` | Cian |
| `STORAGE` | `Storage` | `HardDrive` | Ámbar |
| `SECURITY_GROUP` | `Security Group`| `Lock` | Rojo / Naranja |

### 4.6. Marcadores Direccionales (`MarkerType.ArrowClosed`)
* Cada arista renderiza una flecha orientada en su extremo final indicando el flujo del tráfico de datos (ej. `ALB` $\rightarrow$ `EC2` $\rightarrow$ `RDS`).
* El color del marcador (`markerEnd`) se sincroniza dinámicamente con el estado visual de la arista (`selected`: `aws-orange`, `pass`: `emerald-500`, `error`: `red-500`, `default`: `slate-500`).

---

## 5. Mapeo Centralizado de Tipos de React Flow (`nodeTypes` & `edgeTypes`)

Para garantizar que React Flow reconozca los componentes personalizados de manera inmutable y evitar re-instanciaciones dentro de los componentes funcionales, se crea el archivo de definición:

* **Archivo:** `apps/web/src/features/canvas/components/canvasElementTypes.ts`

```typescript
import { NodeTypes, EdgeTypes } from '@xyflow/react';
import { AwsServiceNode } from './nodes/AwsServiceNode';
import { CustomConnectionEdge } from './edges/CustomConnectionEdge';

/**
 * Catálogo inmutable de tipos de nodos personalizados para React Flow.
 */
export const nodeTypes: NodeTypes = {
  awsServiceNode: AwsServiceNode
};

/**
 * Catálogo inmutable de tipos de aristas personalizadas para React Flow.
 */
export const edgeTypes: EdgeTypes = {
  customConnectionEdge: CustomConnectionEdge
};
```

---

## 6. Accesibilidad (a11y) e Interacciones por Teclado

1. **Navegación por Teclado:**
   * Nodos seleccionables mediante tabulación o clic con borde de enfoque visible (`focus-visible:ring-2 focus-visible:ring-amber-500`).
   * Botón de eliminación con soporte de tecla `Enter` y `Space`.
   * Atributos `aria-label` descriptivos (ej. `aria-label="Servicio Amazon EC2, categoría Compute, 2 instancias"`).
2. **Contraste de Color (WCAG 2.1 AA):**
   * Ratios de contraste $\ge 4.5:1$ en todos los estados tanto en Dark Mode como en Light Mode.
3. **Control de Eventos:**
   * Uso sistemático de `e.stopPropagation()` en botones interactivos internos para evitar conflictos con el paneo o selección de React Flow.
   * Clases `nodrag nopan` en botones y badges interactivos para prevenir arrastre accidental mientras se hace clic en una acción.

---

## 7. Plan de Pruebas Unitarias de Componentes (Vitest + Testing Library)

Se diseñarán dos suites de pruebas unitarias exhaustivas:
1. `apps/web/src/features/canvas/components/nodes/__tests__/AwsServiceNode.test.tsx`
2. `apps/web/src/features/canvas/components/edges/__tests__/CustomConnectionEdge.test.tsx`

### 7.1. Matriz de Pruebas para `AwsServiceNode.test.tsx`:
* **Renderizado Nominal:**
  * Debe renderizar el nombre del servicio, icono SVG y categoría correctamente.
  * Debe utilizar la imagen de fallback `/icons/aws/default.svg` si la imagen original dispara evento `error`.
* **Renderizado de Handles:**
  * Debe contener un Handle tipo `target` en la posición superior (`Position.Top`) con ID `target-top`.
  * Debe contener un Handle tipo `source` en la posición inferior (`Position.Bottom`) con ID `source-bottom`.
* **Badges de Configuración Técnica:**
  * Debe renderizar badge `Multi-AZ` cuando `config.isMultiAz = true`.
  * Debe renderizar badge `Auto Scaling` cuando `config.autoScaling = true`.
  * Debe renderizar recuento de instancias cuando `config.instanceCount > 1`.
  * No debe renderizar badges cuando las opciones técnicas no están habilitadas.
* **Estados Visuales (Default, Selected, Pass, Error):**
  * Debe aplicar clases de selección en `aws-orange` cuando `selected = true`.
  * Debe aplicar clases de borde rojo y mensaje cuando `data.visualStatus = 'error'`.
  * Debe aplicar clases de borde verde cuando `data.visualStatus = 'pass'`.
* **Interacción de Eliminación:**
  * Debe invocar `removeNode(id)` de `useCanvasStore` al hacer clic en el botón de eliminación.

### 7.2. Matriz de Pruebas para `CustomConnectionEdge.test.tsx`:
* **Renderizado de Trazado Bezier:**
  * Debe renderizar un elemento `<path>` SVG con las coordenadas bezier calculadas por `getBezierPath`.
  * Debe incluir animación de flujo de datos (`stroke-dashoffset`) cuando `animated = true`.
* **Etiqueta y Tipo de Conexión:**
  * Debe renderizar el texto correspondiente al `connectionType` (`HTTP / HTTPS`, `Database`, etc.).
* **Botón de Eliminación de Arista:**
  * Debe invocar `removeEdge(id)` de `useCanvasStore` al hacer clic en el botón de eliminar.
* **Estados Visuales:**
  * Debe cambiar los estilos de color del trazado y marcador al estar seleccionada o en estado de error/pass.

---

## 8. Criterios de Aceptación y Checklist de Verificación

- [ ] **Componente `AwsServiceNode.tsx`:**
  - [ ] Implementado en `features/canvas/components/nodes/AwsServiceNode.tsx`.
  - [ ] Renderizado de icono oficial AWS, nombre, categoría y handles top/bottom.
  - [ ] Badges reactivos para `isMultiAz`, `autoScaling` e `instanceCount`.
  - [ ] Botón de eliminación rápida integrado con `useCanvasStore.removeNode`.
  - [ ] Soporte completo de temas Dark y Light y estados visuales (`default`, `selected`, `pass`, `error`, `warning`).
- [ ] **Componente `CustomConnectionEdge.tsx`:**
  - [ ] Implementado en `features/canvas/components/edges/CustomConnectionEdge.tsx`.
  - [ ] Trazado SVG curvo bezier con animación fluida de tráfico (`strokeDasharray`).
  - [ ] `EdgeLabelRenderer` con badge de tipo de conexión y botón flotante de eliminación `removeEdge`.
  - [ ] Marcador de flecha direccional en el extremo destino.
- [ ] **Catálogo Inmutable de Tipos:**
  - [ ] Exportación de `nodeTypes` y `edgeTypes` en `canvasElementTypes.ts`.
- [ ] **Pruebas Unitarias:**
  - [ ] 100% de los tests unitarios aprobados en Vitest (`AwsServiceNode.test.tsx` y `CustomConnectionEdge.test.tsx`).
- [ ] **Compilación TypeScript:**
  - [ ] Cero errores de compilación con `npm run build --workspace=@aws-quest/web`.
