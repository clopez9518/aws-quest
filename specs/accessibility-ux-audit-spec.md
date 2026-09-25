# Especificación Técnica: Auditoría de Accesibilidad (a11y) y UX (Fase 7 - Hito 7.2)

## 1. Introducción y Objetivos

Esta especificación técnica establece los estándares de accesibilidad digital, directrices de diseño inclusivo, patrones de navegación por teclado, soporte cromático adaptable (**Dark Mode y Light Mode**), compatibilidad con tecnologías de asistencia y estrategias de testing automatizado de **Accesibilidad (a11y) y Experiencia de Usuario (UX)**, correspondiente a la **Tarea 7.2** de la **Fase 7: Testing E2E, Accesibilidad y Preparación para Release MVP** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El objetivo de esta especificación es garantizar que **AWS Architecture Quest** sea 100% accesible, utilizable y ergonómica para todos los perfiles de aprendices, cumpliendo estrictamente con las **Pautas de Accesibilidad para el Contenido Web (WCAG 2.1 Nivel AA)**, los principios de diseño de [`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md) y los Requisitos No Funcionales de calidad ([`docs/03-non-functional-requirements.md`](file:///c:/workspace/aws/aws-game/docs/03-non-functional-requirements.md)).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ESTRATEGIA DE ACCESIBILIDAD Y EXPERIENCIA DE USUARIO (WCAG 2.1 AA)                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   1. PERCEPTIBLE (Perceivable)          2. OPERABLE (Operable)            3. COMPRENSIBLE (Understandable)      │
│   • Contraste >= 4.5:1 (Dark/Light)     • Navegación 100% por Teclado     • Feedback Pedagógico Claro           │
│   • Iconos con etiquetas textuales      • Focus Trap en Todos los Modales • Mensajes de Error Descriptivos      │
│   • Jerarquía tipográfica semántica     • Atajos: Tab, Esc, Delete, Enter • Estados Vacíos e Instrucciones      │
│   • prefers-reduced-motion              • Sin trampas de foco en Canvas   • Prevención de Errores Destructivos  │
│                                                                                                                 │
│   4. ROBUSTO (Robust)                   5. AUTOMATIZACIÓN & TESTING       6. UX & ERGONOMÍA                     │
│   • Landmarks HTML5 y Roles WAI-ARIA    • @axe-core/playwright (E2E a11y) • Responsive (>= 1280x720 px)         │
│   • Live Regions (aria-live="polite")   • vitest-axe en Componentes       • Paneles Colapsables Ergonómicos     │
│   • Compatibilidad Multi-Navegador      • Tests de Recorrido por Teclado  • Feedback Inmediato (< 50 ms)        │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Criterios WCAG 2.1 Nivel AA Vinculados

| Requerimiento / Criterio WCAG | Principio / Descripción | Implementación en AWS Architecture Quest |
| :--- | :--- | :--- |
| **WCAG 1.4.3 (AA)** / **RNF-05** | Contraste Mínimo ($\ge 4.5:1$ texto normal, $\ge 3:1$ texto grande y componentes UI) | Verificación de ratios de contraste en toda la paleta de tokens semánticos tanto en Dark Mode como en Light Mode. |
| **WCAG 2.1.1 (A)** / **RNF-04** | Operabilidad Completa por Teclado | Capacidad de navegar, seleccionar, conectar y enviar arquitecturas sin necesidad de ratón. |
| **WCAG 2.1.2 (A)** | Sin Trampas de Foco de Teclado | El usuario puede salir libremente de cualquier panel, canvas o control usando `Tab` o `Shift+Tab`. |
| **WCAG 2.4.7 (AA)** | Foco Visible | Indicadores visuales de foco notorios (`ring-2 ring-amber-400 dark:ring-amber-500`) en todos los elementos interactivos. |
| **WCAG 2.4.3 (A)** | Orden de Enfoque Lógico | Secuencia de tabulación natural y predecible a través de la cabecera, paneles de contexto y modal de evaluación. |
| **WCAG 4.1.2 (A)** / **RNF-06** | Nombre, Función y Valor (ARIA Roles) | Asignación de roles semánticos (`role="dialog"`, `role="tablist"`, `role="tab"`, `role="progressbar"`, `aria-expanded`). |
| **WCAG 4.1.3 (AA)** | Mensajes de Estado (Live Regions) | Notificaciones de XP ganada, alertas de validación y toasts con `role="status"` o `aria-live="polite"`. |
| **WCAG 2.3.3 (AAA/AA)** | Reducción de Movimiento (`prefers-reduced-motion`) | Desactivación o simplificación de animaciones visuales (pulsos de XP, flotantes, partículas de aristas). |
| **WCAG 3.3.4 (AA)** | Prevención de Errores (Confirmaciones) | Modales de confirmación accesibles antes de acciones irreversibles (descontar puntos por pistas, reiniciar canvas, reemplazar lienzo). |
| **RNF-04 / RNF-10** | Responsive y Multi-Navegador | Adaptabilidad en resoluciones desde $1280 \times 720$ px sin superposición de paneles ni pérdida de controles en Chrome, Firefox, Edge y Safari. |

---

## 3. Auditoría de Contraste de Color y Soporte Dual (Dark / Light Mode)

### 3.1. Matriz de Contraste de Color por Token Semántico

Todos los pares de color de texto y fondo deben cumplir o superar el ratio de contraste mínimo de **4.5:1** (WCAG 2.1 Nivel AA para texto estándar) y **3.0:1** para componentes de interfaz de usuario y estados interactivos.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIZ DE CONTRASTES WCAG 2.1 AA (DARK MODE & LIGHT MODE)                       │
├────────────────────────┬──────────────────────┬──────────────────────┬──────────────┬──────────────────┤
│ Elemento / Token       │ Dark Mode (Fondo)    │ Light Mode (Fondo)   │ Ratio Mínimo │ Estado           │
├────────────────────────┼──────────────────────┼──────────────────────┼──────────────┼──────────────────┤
│ Texto Primario         │ #F8FAFC en #0B0F19   │ #0F172A en #FFFFFF   │ >= 14:1 (AA) │ Cumple con creces│
│ Texto Secundario       │ #94A3B8 en #0B0F19   │ #475569 en #FFFFFF   │ >= 5.2:1 (AA)│ Cumple AA        │
│ Acento AWS Orange      │ #F59E0B en #0B0F19   │ #D97706 en #FFFFFF   │ >= 4.8:1 (AA)│ Cumple AA        │
│ Feedback Pass (Verde)  │ #34D399 en #064E3B   │ #065F46 en #D1FAE5   │ >= 5.5:1 (AA)│ Cumple AA        │
│ Feedback Error (Rojo)  │ #F87171 en #450A0A   │ #991B1B en #FEE2E2   │ >= 5.8:1 (AA)│ Cumple AA        │
│ Feedback Warning (Ámb) │ #FBBF24 en #451A03   │ #92400E en #FEF3C7   │ >= 5.0:1 (AA)│ Cumple AA        │
│ Bordes de Control Foco │ #F59E0B Ring         │ #D97706 Ring         │ >= 3.2:1 (AA)│ Cumple AA        │
└────────────────────────┴──────────────────────┴──────────────────────┴──────────────┴──────────────────┘
```

### 3.2. Reglas de Contraste en Componentes Específicos
1. **Badges de Dificultad y Modo:**
   * *Fácil (Verde):* En modo claro, texto `#065F46` sobre fondo `#ECFDF5` (borde `#A7F3D0`). En modo oscuro, texto `#34D399` sobre fondo `rgba(16, 185, 129, 0.15)`.
   * *Intermedio (Ámbar):* En modo claro, texto `#92400E` sobre fondo `#FEF3C7`. En modo oscuro, texto `#FBBF24` sobre fondo `rgba(245, 158, 11, 0.15)`.
   * *Difícil (Naranja):* En modo claro, texto `#9A3412` sobre fondo `#FFEDD5`. En modo oscuro, texto `#FB923C` sobre fondo `rgba(249, 115, 22, 0.15)`.
   * *Integrador (Púrpura):* En modo claro, texto `#6B21A8` sobre fondo `#F3E8FF`. En modo oscuro, texto `#C084FC` sobre fondo `rgba(168, 85, 247, 0.15)`.
2. **Textos Deshabilitados y Placeholders:**
   * Textos deshabilitados en botones sin interacción deben mantener un contraste perceptible $\ge 3:1$ (`text-slate-400` en light, `text-slate-500` en dark) con atributo `aria-disabled="true"`.

---

## 4. Matriz de Accesibilidad Semántica y WAI-ARIA

### 4.1. Estructura de Landmarks y Regiones Semánticas

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ <header role="banner">                                                                                          │
│   ├── <nav aria-label="Navegación principal"> [Logo AWS Quest -> /catalog]                                      │
│   ├── <div role="status" aria-label="Progreso de nivel y experiencia"> [XpProgressBar]                         │
│   ├── <button aria-label="Cambiar a modo claro/oscuro"> [ThemeToggle]                                           │
│   └── <div aria-label="Estado de sesión"> [UserSessionMenu]                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ <main id="main-content" role="main">                                                                            │
│   ├── <div role="region" aria-label="Cabecera del desafío"> [WorkspaceHeader]                                   │
│   ├── <aside aria-label="Panel de Contexto y Herramientas"> [ProblemContextPanel]                               │
│   │     ├── <div role="tablist" aria-label="Secciones del panel lateral"> [Tabs: Servicios/Requisitos/Historial] │
│   │     └── <div role="tabpanel" id="panel-servicios" aria-labelledby="tab-servicios"> [ServicePalette]         │
│   ├── <section aria-label="Lienzo interactivo de diseño de arquitectura" role="region"> [ArchitectureCanvas]   │
│   └── <aside aria-label="Cajón de pistas progresivas" aria-hidden="true/false"> [HintDrawer]                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Especificación Detallada de Componentes ARIA

#### 4.2.1. `RootLayout` y Header Global
- **Skip Link:** Enlace accesible oculto que se visualiza al recibir foco (`sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl`) que apunta a `#main-content`.
- **`XpProgressBar`:**
  - `role="progressbar"`
  - `aria-valuenow={percentage}`
  - `aria-valuemin={0}`
  - `aria-valuemax={100}`
  - `aria-valuetext={`${currentLevelXp} de ${xpForNextLevel} XP para nivel ${level + 1}`}`
  - Píldora de delta animada con `role="status"` y `aria-live="polite"`.
- **`ThemeToggle`:**
  - `aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}`
  - `aria-pressed={isDark}`

#### 4.2.2. `CatalogPage` y Acordeones
- **`AccessModeToggle`:**
  - Contenedor con `role="radiogroup"` o `role="group"` y `aria-label="Selector de política de acceso al catálogo"`.
  - Botones con `role="radio"` y `aria-checked={isOpen}` / `aria-checked={!isOpen}`.
- **`UnitAccordion`:**
  - Cabecera con `<button aria-expanded={isExpanded} aria-controls={`unit-content-${unit.id}`} id={`unit-header-${unit.id}`}>`.
  - Contenedor de desafíos con `id={`unit-content-${unit.id}`} role="region" aria-labelledby={`unit-header-${unit.id}`}`.
- **`ChallengeCard`:**
  - Título con `<h4 id={`challenge-title-${challenge.id}`}>`.
  - Si está bloqueado: `aria-disabled="true"` con `aria-describedby={`lock-reason-${challenge.id}`}`.
  - Enlace de acción con texto accesible contextualizado: `aria-label={`${isCompleted ? 'Mejorar puntaje en' : 'Iniciar'} ${challenge.title}`}`.

#### 4.2.3. Workspace del Desafío (`ChallengePage`)
- **`ProblemContextPanel`:**
  - `<div role="tablist" aria-label="Secciones del panel contextual">`
  - `<button role="tab" aria-selected={activeTab === 'services'} aria-controls="panel-services" id="tab-services">`
  - `<div role="tabpanel" id="panel-services" aria-labelledby="tab-services">`
- **`ServicePalette`:**
  - Tarjetas de servicio con `role="button"` o `tabIndex={0}`.
  - Atributos descriptivos: `aria-label={`Arrastrar ${service.name}, categoría ${service.category}. ${remainingInstancesText}`}`.
  - Cuando se alcanza el límite: `aria-disabled="true"` con indicación sonora/textual.
- **`ArchitectureCanvas` (React Flow):**
  - Contenedor del lienzo con `role="region" aria-label="Lienzo de diseño de arquitectura AWS"`.
  - Nodos (`AwsServiceNode`): `role="group"`, `tabIndex={0}`, `aria-label={`Componente ${node.data.name} en la arquitectura. Estado: ${node.data.visualStatus}`}`.
  - Botón de eliminar en nodo: `aria-label={`Eliminar componente ${node.data.name} del canvas`}`.
  - Conexiones (`CustomConnectionEdge`): Botón de eliminar con `aria-label={`Eliminar conexión entre ${sourceName} y ${targetName}`}`.
- **`HintDrawer`:**
  - `<aside role="dialog" aria-modal="false" aria-label="Cajón de pistas progresivas">`
  - Botón de cierre: `aria-label="Cerrar panel de pistas"`.
  - Resumen de penalización con `role="status"`.

#### 4.2.4. Diálogos Modales Accesibles (WAI-ARIA Dialog Pattern)
Todos los modales (`EvaluationModal`, `HintUnlockModal`, `ResetCanvasModal`, `RestoreAttemptModal`, `LevelUpModal`, `AuthModal`) deben implementar el estándar estricto de **Accesibilidad para Diálogos**:
1. `role="dialog"` y `aria-modal="true"`.
2. `aria-labelledby="[modal-title-id]"` y `aria-describedby="[modal-desc-id]"`.
3. **Trampa de Foco (Focus Trap):** Al abrirse, el foco se coloca automáticamente en el primer elemento interactivo o botón principal; la navegación con `Tab` / `Shift+Tab` cicla exclusivamente dentro del diálogo.
4. **Cierre con Tecla `Escape`:** Presionar `Escape` cierra el modal inmediatamente.
5. **Retorno de Foco:** Al cerrarse el modal, el foco del navegador regresa con precisión al elemento que originó su apertura (ej. botón *"Enviar solución"*, botón *"Desbloquear pista"*, o botón *"Reiniciar"*).

---

## 5. Navegación Integral por Teclado y Control de Foco

### 5.1. Matriz de Atajos de Teclado y Comportamientos

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       MATRIZ DE OPERABILIDAD POR TECLADO                                        │
├────────────────────┬──────────────────────────────────────┬─────────────────────────────────────────────────────┤
│ Tecla / Atajo      │ Contexto                             │ Acción / Comportamiento Accesible                   │
├────────────────────┼──────────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `Tab`              │ Global                               │ Avanza al siguiente elemento interactivo enfocable. │
│ `Shift + Tab`      │ Global                               │ Retrocede al elemento interactivo anterior.         │
│ `Enter` / `Space`  │ Botones, Tabs, Acordeones, Links     │ Activa la acción o conmuta la pestaña/acordeón.     │
│ `Escape`           │ Modales, Drawers, Dropdowns          │ Cierra el diálogo/panel y restaura el foco previo.  │
│ `Delete` / `Bksp`  │ Nodo o Conexión seleccionada Canvas  │ Elimina el nodo/conexión seleccionado sin ratón.    │
│ `Arrow Keys`       │ Tabs, Radiogroups, Menús             │ Conmuta la selección entre opciones del grupo.      │
│ `Ctrl + Enter`     │ Workspace del Desafío                │ Atajo rápido para disparar "Enviar solución".       │
└────────────────────┴──────────────────────────────────────┴─────────────────────────────────────────────────────┘
```

### 5.2. Indicador Visual de Foco (*Focus Ring*)
Se prohíbe el uso de `outline: none` sin un reemplazo visual explícito. Todo elemento interactivo al recibir foco vía teclado (`:focus-visible`) debe mostrar:
```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
```

---

## 6. Preferencias de Movimiento y Animación (`prefers-reduced-motion`)

Para proteger a usuarios con sensibilidad vestibular o trastornos convulsivos, la aplicación debe responder a la directiva CSS `@media (prefers-reduced-motion: reduce)`.

### 6.1. Reglas de Desactivación de Animaciones
1. **Medidor Radial de Puntaje (`ScoreGauge`):** Desactivar la transición circular animada de 1.5s; pintar directamente el valor final.
2. **Píldora Flotante de XP (`XpProgressBar`):** Desactivar la animación `animate-bounce` o sustituirla por una aparición estática con opacidad sin saltos verticales.
3. **Flujo de Partículas en Conexiones (`CustomConnectionEdge`):** Desactivar `animated={true}` de React Flow cuando `prefers-reduced-motion` esté activo.
4. **Transiciones de Modales:** Reemplazar zoom dinámico (`zoom-in-95`) y desvanecimientos lentos por renderizado instantáneo sin escala.

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Estrategia de Testing Automatizado de Accesibilidad

### 7.1. Arquitectura de Suites de Prueba de Accesibilidad

```text
apps/web/
├── src/
│   └── test/
│       ├── a11y/
│       │   ├── colorContrast.test.ts          # Validación programática de tokens de contraste WCAG AA
│       │   ├── keyboardNavigation.test.tsx    # Pruebas de simulación de teclado en componentes con Vitest
│       │   └── ariaAttributes.test.tsx        # Validación de roles y atributos ARIA en componentes aislados
├── e2e/
│   ├── pom/                                   # Page Object Models con soporte a11y
│   └── specs/
│       ├── 07-a11y-wcag-axe-audit.spec.ts     # Escaneo automatizado con @axe-core/playwright (0 violaciones)
│       └── 08-a11y-keyboard-journey.spec.ts   # Flujo completo 100% operado por teclado (sin mouse)
```

### 7.2. Especificación de Pruebas con `@axe-core/playwright`

Se integrará `@axe-core/playwright` para escanear exhaustivamente las 4 vistas principales y todos los estados modales:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E2E Accesibilidad: Auditoría Automatizada WCAG 2.1 Nivel AA (RNF-05)', () => {
  test('la página de Catálogo debe cumplir 100% WCAG 2.1 AA en Dark y Light Mode', async ({ page }) => {
    await page.goto('/catalog');
    
    // Escaneo en Dark Mode
    const accessibilityScanDark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibilityScanDark.violations).toEqual([]);

    // Escaneo en Light Mode
    await page.getByTestId('theme-toggle-button').click();
    const accessibilityScanLight = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibilityScanLight.violations).toEqual([]);
  });

  test('el Workspace del Desafío y el Modal de Evaluación deben tener 0 violaciones de accesibilidad', async ({ page }) => {
    await page.goto('/catalog');
    const card = page.getByTestId('challenge-card').first();
    await card.getByRole('link').click();

    // Escanear Workspace
    const workspaceA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(workspaceA11y.violations).toEqual([]);

    // Abrir Modal de Evaluación y escanear diálogo
    await page.getByTestId('submit-solution-button').click();
    await page.getByTestId('evaluation-modal').waitFor({ state: 'visible' });

    const modalA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(modalA11y.violations).toEqual([]);
  });
});
```

### 7.3. Especificación de Prueba E2E: *Keyboard-Only User Journey*
Verifica que un usuario que utiliza exclusivamente el teclado puede:
1. Acceder al Skip Link e ir al contenido principal.
2. Navegar por el catálogo usando `Tab` y `Enter` para abrir un desafío.
3. Desplegar el drawer de pistas con `Enter` y cerrarlo con `Escape`.
4. Enviar la solución con el teclado (`Enter` o `Ctrl+Enter`).
5. Navegar por la lista de feedback del modal usando `Tab` y cerrarlo con `Escape`.

---

## 8. Checklist de Verificación Manual de UX y Ergonomía

- [ ] **Ergonomía de Paneles en Resoluciones $1280 \times 720$ px:**
  - El panel lateral izquierdo se puede colapsar/expandir sin recortar controles.
  - El canvas conserva al menos $600 \times 500$ px de área visible interactiva.
- [ ] **Feedback Inmediato de Estado:**
  - Spinners visuales y `aria-busy="true"` activos durante la mutación de evaluación.
  - Notificación no obstructiva tras restaurar un intento previo (`role="status"`).
- [ ] **Prevención de Pérdida de Datos:**
  - El botón *"Reiniciar Canvas"* solicita confirmación modal antes de limpiar.
  - El botón *"Cargar en Canvas"* desde el historial solicita confirmación si hay componentes en el lienzo.
- [ ] **Experiencia con Lector de Pantalla (NVDA / VoiceOver):**
  - Los modales anuncian su título al abrirse.
  - Las alertas de error de formulario anuncian el mensaje mediante `aria-live="assertive"` o `role="alert"`.

---

## 9. Criterios de Aceptación y Definición de Terminado (DoD)

1. **Cero Violaciones WCAG 2.1 AA:** Todas las vistas (`/catalog`, `/challenges/:id`, `EvaluationModal`, `AuthModal`, `RestoreAttemptModal`) superan el escaneo de `@axe-core/playwright` con 0 violaciones críticas, serias o moderadas.
2. **Contraste Verificado:** Todos los textos y componentes interactivos cumplen con el ratio $\ge 4.5:1$ en Dark Mode y Light Mode.
3. **Navegación 100% por Teclado:** Se verifica mediante prueba automatizada Playwright que el core gameplay loop puede completarse sin usar el mouse.
4. **Focus Trap & Retorno de Foco:** Todos los modales atrapan el foco mientras están abiertos y lo retornan al elemento activador al cerrarse.
5. **Soporte `prefers-reduced-motion`:** Las animaciones se atenúan o desactivan cuando el sistema lo requiere.
6. **Sin Regresiones:** El 100% de las 350 pruebas previas (129 unitarias backend + 25 integración backend + 190 unitarias frontend + 6 E2E) continúan ejecutándose con resultado exitoso.
