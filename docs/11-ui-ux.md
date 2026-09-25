# Especificación de Diseño y Experiencia de Usuario (UI/UX) - AWS Architecture Quest

## 1. Introducción y Principios de Diseño

Este documento establece las directrices visuales, diseño de pantallas, componentes interactivos, navegación, estados de feedback, accesibilidad y soporte de temas (**Dark Mode / Light Mode**) para la plataforma **AWS Architecture Quest**.

### 1.1. Principios de Experiencia de Usuario (UX)
1. **Abstracción Pedagógica:** El usuario debe concentrarse en el razonamiento arquitectónico (flujo de datos, alta disponibilidad, seguridad, costo) sin la sobrecarga visual o de configuración detallada de la consola de AWS.
2. **Entorno no Punitivo y Formativo:** La interfaz incentiva a experimentar libremente. El feedback destaca aciertos en verde y explica errores en rojo/ámbar de forma constructiva, sin tiempos de espera ni penalizaciones destructivas.
3. **Fluidez Interactiva a 60 FPS:** Las interacciones de arrastrar, soltar, conectar y zoom en el canvas deben responder en menos de 50 ms para una sensación táctil y precisa.
4. **Soporte Dual de Tema (Dark Mode & Light Mode):** Detección automática de la preferencia del sistema operativo (`prefers-color-scheme`) con selector manual (*Theme Toggle*) persistente.

---

## 2. Design System y Guía de Estilos

### 2.1. Paleta de Colores (Soporte Dark Mode y Light Mode)

| Token Semántico | Dark Mode | Light Mode | Propósito / Uso |
| :--- | :--- | :--- | :--- |
| **`bg-canvas`** | `#0B0F19` (Slate 950) | `#F8FAFC` (Slate 50) | Fondo principal del área de trabajo / Canvas. |
| **`bg-surface`** | `#111827` (Gray 900) | `#FFFFFF` (White) | Paneles laterales, tarjetas y modales. |
| **`bg-surface-elevated`** | `#1F2937` (Gray 800) | `#F1F5F9` (Slate 100) | Nodos en canvas, acordeones y botones secundarios. |
| **`border-subtle`** | `#374151` (Gray 700) | `#E2E8F0` (Slate 200) | Líneas divisorias y bordes de tarjetas. |
| **`text-primary`** | `#F9FAFB` (Gray 50) | `#0F172A` (Slate 900) | Títulos y texto principal. |
| **`text-secondary`** | `#9CA3AF` (Gray 400) | `#64748B` (Slate 500) | Descripciones, pistas y metadatos. |
| **`aws-orange`** | `#FF9900` | `#D97706` | Acento principal, llamados a la acción y selección de nodos. |
| **`aws-squid`** | `#232F3E` | `#1E293B` | Encabezados de paneles y marcas de contraste. |
| **`status-pass`** | `#10B981` (Emerald 500) | `#059669` (Emerald 600) | Desafío completado, feedback positivo y nota $\ge 70$. |
| **`status-error`** | `#EF4444` (Red 500) | `#DC2626` (Red 600) | Errores de validación, SPOF y conexiones inválidas. |
| **`status-warning`** | `#F59E0B` (Amber 500) | `#D97706` (Amber 600) | Alerta de penalización de pistas y servicios distractores. |
| **`status-info`** | `#3B82F6` (Blue 500) | `#2563EB` (Blue 600) | Información conceptual y badges de categoría. |

### 2.2. Tipografía e Iconografía
* **Tipografía Primaria:** `Inter` o `Geist Sans` (sans-serif) para máxima legibilidad en interfaces técnicas.
* **Escala Tipográfica:**
  * **Headings:** `text-2xl font-bold` (Títulos de página), `text-lg font-semibold` (Títulos de desafío y paneles).
  * **Body:** `text-sm font-normal` (Textos de contexto y requisitos), `text-xs font-medium` (Nodos de servicio y etiquetas).
  * **Metrics / Score:** `text-4xl font-extrabold` (Puntuación en modal de evaluación).
* **Iconografía de Servicios AWS:** Iconos vectoriales SVG oficiales simplificados y optimizados para fondos oscuros y claros.
* **Iconografía de Interfaz:** `lucide-react` (iconos outline uniformes: `Play`, `CheckCircle`, `AlertTriangle`, `Lock`, `Sun`, `Moon`, `ZoomIn`, `Trash2`).

---

## 3. Layouts y Flujos de Pantallas Principales

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR GLOBAL: Logo AWS Quest │ Nivel 3 (445 XP) [████░░░] │ [☀️/🌙] │ [Invitado / Perfil]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ WORKSPACE HEADER: Desafío: Alta Disponibilidad │ Intermedio │ Pistas: 1/3 │ [Enviar Solución]│
├───────────────────────────────┬────────────────────────────────────────┬───────────────┤
│ PANEL IZQUIERDO               │ CANVAS DE ARQUITECTURA (REACT FLOW)    │ PANEL DERECHO │
│ ┌───────────────────────────┐ │ ┌────────────────────────────────────┐ │ ┌───────────┐ │
│ │ Caso & Requisitos         │ │ │                                    │ │ │ PISTAS    │ │
│ │ - ALB para tráfico web    │ │ │         ┌─────────┐                │ │ │ Pista 1 ✓ │ │
│ │ - 2 instancias EC2        │ │ │         │ AWS_ALB │                │ │ │ Pista 2 🔒│ │
│ ├───────────────────────────┤ │ │         └────┬────┘                │ │ └───────────┘ │
│ │ Paleta de Servicios       │ │ │              │                     │ │               │
│ │ [AWS_ALB] [AWS_EC2]       │ │ │         ┌────▼────┐                │ │               │
│ │ [AWS_RDS] [AWS_S3]        │ │ │         │ AWS_EC2 │                │ │               │
│ └───────────────────────────┘ │ │ └──────────────────────────────────┘ │ │               │
└───────────────────────────────┴────────────────────────────────────────┴───────────────┘
```

### 3.1. Layout Global (`RootLayout`)
* **Header Persistente:**
  * **Logo:** *AWS Architecture Quest* con distintivo visual de AWS Orange.
  * **Progreso Global del Usuario:** Indicador de Nivel actual y barra de XP con progreso visual animado hacia el siguiente nivel.
  * **Selector de Tema:** Botón interactivo con iconos `Sun` / `Moon` para alternar entre Dark Mode y Light Mode.
  * **Badge de Sesión:** Muestra *"Invitado"* (con botón para *"Guardar progreso"*) o el nombre del usuario registrado.

---

### 3.2. Pantalla 1: Catálogo de Unidades y Desafíos (`CatalogPage`)
* **Selector de Modalidad:** Toggle visual en la cabecera para alternar entre **Modo Libre (Open Access)** y **Modo Progresivo** (**RN-01**).
* **Organización por Unidades Temáticas:** Secciones desplegables (Acordeones) agrupadas por temática (*Cómputo, Bases de Datos, Redes, Alta Disponibilidad*).
* **Tarjeta de Desafío (`ChallengeCard`):**
  * **Título y Dificultad:** Badge de color (*Verde: Fácil, Amarillo: Intermedio, Naranja: Difícil, Púrpura: Integrador*).
  * **Estado de Avance:**
    * *Bloqueado:* Icono de candado `Lock` en gris con tooltip explicativo del prerrequisito faltante.
    * *No Iniciado:* Botón *"Iniciar Desafío"*.
    * *Completado:* Badge verde con estrella y mejor puntuación histórica (*High Score: 95/100*).

---

### 3.3. Pantalla 2: Workspace del Desafío (`ChallengePage`)
El área de trabajo principal se divide en una estructura de tres paneles ergonómicos:

#### A. Barra Superior del Workspace (`WorkspaceHeader`)
* Botón de retorno al catálogo.
* Título del desafío y badge de dificultad.
* Contador de pistas reveladas (ej. `Pistas: 1/3`).
* **Botón Principal "Enviar solución":** Botón prominente en AWS Orange que se activa cuando hay componentes en el canvas. Al hacer clic, despliega un spinner de validación.

#### B. Panel Lateral Izquierdo (`ProblemContextPanel` & `ServicePalette`)
* **Pestaña 1: Contexto del Problema:** Resumen del caso de uso real, requisitos funcionales/técnicos y restricciones de arquitectura.
* **Pestaña 2: Paleta de Servicios AWS:**
  * Tarjetas compactas arrastrables (*Drag & Drop*) organizadas por categoría (*Compute, Database, Networking, Storage*).
  * Badges de límite de instancias (ej. `Máx. 2`), indicando visualmente cuántas instancias quedan disponibles.
  * Estado deshabilitado cuando se alcanza el límite máximo permitido (**RN-04**).

#### C. Panel Central (`ArchitectureCanvas`)
* Lienzo interactivo de React Flow con fondo de cuadrícula de puntos (*Dot Grid* adaptativo en oscuro/claro).
* **Barra de Herramientas del Canvas:** Botones flotantes para Zoom In, Zoom Out, Ajustar a pantalla (*Fit View*) y botón de peligro *"Reiniciar Canvas"* (**CU-06**).

#### D. Panel Lateral Derecho (`HintDrawer` - Pistas Progresivas)
* Desplegable colapsable que muestra las pistas disponibles de forma escalonada (**RN-06**).
* Para pistas bloqueadas, muestra un botón *"Desbloquear Pista (-5 pts)"* que solicita confirmación antes de descontar puntos (**RN-07**).

---

### 3.4. Pantalla 3: Modal de Evaluación y Resultados (`EvaluationModal`)

Desplegado tras presionar *"Enviar solución"* y procesar la arquitectura en el backend:

```text
┌─────────────────────────────────────────────────────────────┐
│                    RESULTADO DE LA EVALUACIÓN               │
│                                                             │
│                      ┌───────────────┐                      │
│                      │    95 / 100   │  (Medidor Radial)    │
│                      │  ¡COMPLETADO! │                      │
│                      └───────────────┘                      │
│                                                             │
│  ✓ Balanceador ALB correctamente configurado (Networking)   │
│  ✓ Instancias EC2 redundantes en 2 Zonas (Alta Disponibilidad)│
│  ✓ Base de datos RDS en Multi-AZ (Tolerancia a fallos)       │
│  ℹ -5 pts por uso de Pista 1                                │
│                                                             │
│  [  Reintentar Canvas (100 pts)  ]    [ Siguiente Desafío ] │
└─────────────────────────────────────────────────────────────┘
```

* **Medidor de Puntaje Radial:** Animación circular que se llena progresivamente hasta la nota alcanzada.
* **Badge de Resultado:**
  * $\ge 70$ pts: Verde esmeralda (*"¡Desafío Aprobado!"*) + animación de XP ganada.
  * $< 70$ pts: Ámbar/Rojo (*"No aprobado (Mínimo 70 pts)"*) con mensaje motivacional para reintentar.
* **Desglose de Ítems de Retroalimentación:** Lista de tarjetas con explicaciones conceptuales de AWS vinculadas a los aciertos y errores (**RF-15**).
* **Botones de Acción:**
  * *"Reintentar solución":* Cierra el modal y mantiene el canvas actual para que el usuario pueda corregir los fallos.
  * *"Siguiente Desafío":* Navega al próximo desafío disponible en la unidad.

---

### 3.5. Pantalla 4: Modal de Autenticación y Migración (`AuthModal`)
* Diálogo modal accesible desde el header para usuarios en Modo Invitado.
* **Mensaje de Valor:** *"Crea tu cuenta para conservar tus 445 XP y sincronizar tu avance en cualquier dispositivo"*.
* Opciones: Formulario directo (Email + Contraseña) o botón de un clic con *Google OAuth*.

---

## 4. Componentes del Canvas y Estados Visuales

### 4.1. Nodo de Servicio AWS (`AwsServiceNode`)

```text
┌──────────────────────────────────────┐
│ (T) Handle de Entrada (Target)       │
│ ┌──────┐ Amazon EC2                  │
│ │ [🖥️] │ Compute                      │
│ └──────┘ [ 2/2 Instancias ]          │
│ (S) Handle de Salida (Source)        │
└──────────────────────────────────────┘
```

* **Estados del Nodo:**
  * **Default:** Fondo `bg-surface-elevated`, borde `border-subtle`, sombra ligera.
  * **Hover:** Borde iluminado con elevación visual (`scale-[1.02]`).
  * **Selected:** Borde grueso en `aws-orange` con halo luminoso (*glow ring*).
  * **Error / Invalid Connection:** Borde temporal en `status-error` con animación de pulso rojo si se intenta una conexión no permitida.
* **Handles de Conexión:** Círculos interactivos en la parte superior e inferior que se agrandan al acercar el cursor con una línea de conexión.

### 4.2. Conexiones Visuales (`CustomConnectionEdge`)
* **Líneas SVG Curvas:** Trazado bezier suave entre nodos.
* **Estado Activo / Animado:** Puntos luminosos que se desplazan a lo largo de la línea simulando el flujo de tráfico.
* **Botón de Eliminación:** Al seleccionar la conexión, aparece un botón flotante `X` en el centro de la línea para eliminarla rápidamente.

---

## 5. Accesibilidad (a11y) y Diseño Responsivo

### 5.1. Pautas de Accesibilidad (WCAG 2.1 Nivel AA)
* **Contraste de Color:** Todos los pares de texto/fondo garantizan un ratio de contraste mínimo de `4.5:1` tanto en Dark Mode como en Light Mode.
* **Navegación por Teclado:**
  * Foco visible en todos los botones y controles (`ring-2 ring-aws-orange`).
  * Atajo `Delete` o `Backspace` para eliminar el nodo/conexión seleccionado.
  * Atajo `Escape` para cerrar modales, drawers o deseleccionar componentes.
* **Lectores de Pantalla:** Atributos `aria-label` descriptivos en todos los controles del canvas y botones de pistas.

### 5.2. Diseño Responsivo
* **Resolución Objetivo:** Optimizado para pantallas de escritorio y portátiles ($\ge 1280 \times 720$ px).
* **Comportamiento en Pantallas Medianas (1280px - 1440px):**
  * Los paneles laterales izquierdo y derecho son colapsables mediante pestañas laterales flotantes para maximizar el área visible del canvas.
* **Zoom y Paneo:** El canvas soporta arrastre del fondo (pan) y zoom con la rueda del ratón o gestos táctiles de trackpad.
