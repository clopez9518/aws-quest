# Especificación Técnica: Gamificación y Migración de Progreso (Fase 6 - Hito 6.3)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura frontend, contratos de datos, animaciones visuales, experiencia de usuario (UX/UI), accesibilidad (a11y) y estrategia de testing para el sistema de **Gamificación en Tiempo Real y Migración Transparente de Progreso**, correspondiente a la **Tarea 6.3** de la **Fase 6** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)).

El objetivo central de este hito es cerrar el ciclo de satisfacción intrínseca y retención del estudiante (Core Gameplay Loop):
1. **Feedback Visual de Progreso y Gamificación:** Reflejar inmediatamente la ganancia de experiencia ($\text{XP}$), la animación fluida en el `XpProgressBar` del Header global, el indicador flotante de ganancia (`+XP`) y la celebración de **Subida de Nivel (Level Up)** cuando el usuario supera el umbral de 150 XP acumulados (**RN-10**).
2. **Migración de Invitado a Cuenta Permanente (Guest Migration):** Proveer un flujo guiado y sin fricción mediante `AuthModal.tsx` y el banner de conversión `GuestProgressBanner.tsx` (en `EvaluationModal` y `WorkspaceHeader`), permitiendo que usuarios anónimos consoliden su historial de intentos, puntuaciones máximas (*High Scores*) y XP en una cuenta registrada permanente con contraseña sin perder ni un solo punto (**RN-13 / CU-08**).

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE GAMIFICACIÓN Y MIGRACIÓN DE PROGRESO (RN-10, RN-13, CU-08)                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                 │
│   [ Evaluación Exitosa ] ──> POST /api/v1/challenges/{id}/evaluate                                              │
│                                      │                                                                          │
│                                      ▼                                                                          │
│                       { earnedXP: 85, currentUserXP: 235, currentUserLevel: 2, isNewHighScore: true }          │
│                                      │                                                                          │
│         ┌────────────────────────────┴────────────────────────────┐                                             │
│         ▼                                                         ▼                                             │
│   ┌──────────────────────────────────────────┐              ┌──────────────────────────────────────────┐        │
│   │           HEADER GLOBAL / XP BAR         │              │            MODAL DE EVALUACIÓN           │        │
│   ├──────────────────────────────────────────┤              ├──────────────────────────────────────────┤        │
│   │ • Animación de incremento numérico       │              │ • Despliegue de Score y XP Ganada (+85)  │        │
│   │ • Pulso / Glow ámbar en barra de progreso│              │ • Si Usuario es Invitado (isGuest=true): │        │
│   │ • Badge flotante (+85 XP) con fade-out   │              │   ┌────────────────────────────────────┐ │        │
│   │ • Trigger de Modal "¡Subiste de Nivel!"  │              │   │  ★ Conserva tus 235 XP y récords   │ │        │
│   │   (LevelUpModal) si Level_new > Level_old│              │   │    [ Crear Cuenta Permanente ]     │ │        │
│   └──────────────────────────────────────────┘              │   └────────────────────────────────────┘ │        │
│                                                             └──────────────────────────────────────────┘        │
│                                                                           │                                     │
│                                                                           ▼ Click CTA                           │
│                                                             ┌──────────────────────────────────────────┐        │
│                                                             │                AUTH MODAL                │        │
│                                                             ├──────────────────────────────────────────┤        │
│                                                             │ • Formulario de registro (Name/Email/Pass│        │
│                                                             │ • Header 'Authorization: Bearer <guest>' │        │
│                                                             │ • Backend promueve usuario en BD         │        │
│                                                             │ • Transición fluida a cuenta permanente  │        │
│                                                             └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación Técnica en el Frontend |
| :--- | :--- | :--- |
| **RF-17** | Acumulación de XP | Tras evaluar una solución, el total de XP del usuario se actualiza en el store global (`useAuthStore`) y se refleja en toda la interfaz sin recargar la página. |
| **RF-18** | Visualización de Progreso | Barra de progreso con desglose de nivel actual, XP en el nivel actual ($0-149$) y XP requerida para el siguiente nivel ($150$). |
| **RF-19** | Registro de Usuario Invitado | Modal accesible para que el usuario anónimo cree credenciales (correo y contraseña) convirtiéndose en usuario registrado. |
| **RN-09** | Conservación del Puntaje Máximo | Si un reintento no supera el récord histórico, el High Score previo se preserva intacto. |
| **RN-10** | Fórmula de Nivel y Anti-Farmeo | $\text{Nivel} = 1 + \lfloor \frac{\text{TotalXP}}{150} \rfloor$. Solo se otorga XP por la diferencia neta positiva frente al récord previo: $\text{earnedXP} = \max(0, \text{Score}_{\text{nuevo}} - \text{HighScore}_{\text{anterior}})$. |
| **RN-13** | Migración Transparente | Al registrarse desde sesión anónima, el frontend adjunta el token JWT del invitado (`Authorization: Bearer <guestToken>`) en la llamada `POST /api/v1/auth/register`. La cuenta se promueve en la base de datos conservando intactos todos los registros de `UserProgress`, `ChallengeAttempt` y `TotalXP`. |
| **CU-08** | Caso de Uso: Migración de Cuenta | Interacción guiada: El usuario hace clic en el banner de retención o menú de usuario $\rightarrow$ ingresa sus datos $\rightarrow$ el backend valida y promueve la cuenta $\rightarrow$ el frontend actualiza el token, refresca el perfil y muestra notificación de éxito. |
| **RNF-04 / RNF-06** | UX y Rendimiento | Micro-animaciones a 60 FPS mediante CSS Transitions y Tailwind, con soporte dual para Dark y Light Mode y contraste $\ge 4.5:1$ (WCAG 2.1 AA). |

---

## 3. Arquitectura de Estado y Flujo de Datos

### 3.1. Estado de Gamificación en `useAuthStore`

El store `useAuthStore` (Zustand con persistencia en `localStorage`) almacena la entidad de usuario activa:

```typescript
export interface UserState {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  totalXP: number;
  level: number;
}
```

#### Eventos de Actualización de Gamificación:
1. **Mutación de Evaluación (`useEvaluateChallenge`):**
   * Al recibir `currentUserXP` y `currentUserLevel` del backend, se calcula si hubo subida de nivel:
     $$\Delta\text{Level} = \text{currentUserLevel} - \text{previousLevel} > 0$$
   * Se actualiza el estado de `useAuthStore`: `updateUser({ totalXP: data.currentUserXP, level: data.currentUserLevel })`.
   * Si $\Delta\text{Level} > 0$, se dispara el evento o estado global de celebración de nivel (`isLevelUpModalOpen = true`).
2. **Animación de Micro-Incremento en Header:**
   * `XpProgressBar` detecta el cambio en `totalXp` mediante un efecto reactivo (`useEffect` / `useRef` con el valor previo).
   * Si `totalXp > prevTotalXp`, activa una clase de pulso brillante (`animate-pulse-glow` / `scale-105`) durante 1.5 segundos y despliega una píldora flotante animada `+XX XP` con fade-out ascendente.

---

## 4. Especificación Detallada de Componentes

### 4.1. Barra de Experiencia Dinámica (`XpProgressBar.tsx`)

Ubicación: `apps/web/src/shared/components/XpProgressBar.tsx`

```typescript
export interface XpProgressBarProps {
  totalXp: number;
  showAnimation?: boolean;
  className?: string;
}
```

* **Comportamiento Visual:**
  - Desglose matemático mediante [`getXpProgress(totalXp)`](file:///c:/workspace/aws/aws-game/apps/web/src/shared/utils/gamification.ts):
    - $\text{level} = 1 + \lfloor \frac{\text{totalXp}}{150} \rfloor$
    - $\text{currentLevelXp} = \text{totalXp} \pmod{150}$
    - $\text{xpForNextLevel} = 150$
    - $\text{percentage} = \lfloor \frac{\text{currentLevelXp}}{150} \times 100 \rfloor$
  - **Indicador Flotante de Ganancia (`XpFloatingDelta`):**
    - Cuando `totalXp` aumenta respecto al valor renderizado previo, se despliega una píldora flotante sobre el badge: `+Δ XP` con animación `animate-bounce-float` (color ámbar dorado, sombra tenue y desvanecimiento tras 2 segundos).
  - **Efecto de Pulso:**
    - La barra interna de progreso utiliza una transición fluida `transition-all duration-700 ease-out` con sombra de neón `shadow-[0_0_12px_rgba(245,158,11,0.6)]`.

```text
       ┌────────────────────────────────────────────────────────┐
       │   [★ Nivel 2]  │  [===========>         ] 85/150 XP    │
       └───────────────────────▲────────────────────────────────┘
                               │
                        ( +85 XP Flotante )
```

---

### 4.2. Modal de Celebración de Nivel (`LevelUpModal.tsx`)

Ubicación: `apps/web/src/shared/components/LevelUpModal.tsx` o `apps/web/src/features/gamification/components/LevelUpModal.tsx`

```typescript
export interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp: number;
}
```

* **Diseño y Experiencia:**
  - Overlay modal centrado con fondo translúcido y desenfoque (*backdrop blur*).
  - Iconografía destacada: Corona/Trofeo (`Trophy` / `Crown`) con partículas radiales de luz (`Sparkles`) animadas.
  - Título enérgico: *"¡Subiste al Nivel {newLevel}!"*.
  - Subtítulo motivacional: *"Has alcanzado {totalXp} XP. Tu dominio de la nube AWS sigue creciendo."*.
  - Desbloqueos simbólicos / Medalla de Rango de Arquitecto (ej. Nivel 1: *Cloud Novice*, Nivel 2: *Cloud Practitioner Apprentice*, Nivel 3+: *Solutions Architect Builder*).
  - Botón de acción principal: *"¡Continuar construyendo!"* con estilo degradado AWS Orange y cierre inmediato.
  - Accesibilidad: `role="dialog"`, `aria-modal="true"`, tecla `Escape` y trampa de foco.

```text
┌─────────────────────────────────────────────────────────────┐
│                    ¡SUBISTE DE NIVEL!                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         ★ ★ ★                               │
│                       ┌───────┐                             │
│                       │   2   │   (Insignia Dorada)         │
│                       └───────┘                             │
│                                                             │
│                  ¡NIVEL 2 ALCANZADO!                        │
│           "Cloud Solutions Apprentice"                      │
│                                                             │
│       Has acumulado 235 XP diseñando arquitecturas          │
│       resilientes y optimizadas en AWS.                     │
│                                                             │
│             [ ¡Continuar construyendo! ➔ ]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3. Banner de Retención y Migración de Invitado (`GuestProgressBanner.tsx`)

Ubicación: `apps/web/src/features/auth/components/GuestProgressBanner.tsx`

```typescript
export interface GuestProgressBannerProps {
  onRegisterClick: () => void;
  totalXp?: number;
  compact?: boolean;
  className?: string;
}
```

* **Casos de Uso e Integración:**
  1. **Dentro de `EvaluationModal.tsx` (Resultado Exitoso de Desafío):**
     - Si `isGuest === true` y `earnedXP > 0` o `totalXP > 0`, se inserta una tarjeta de llamada a la acción (*CTA Banner*) debajo o adyacente a los resultados:
       > *"Estás jugando como invitado. Guarda tus {totalXP} XP y tu posición en el catálogo creando una cuenta gratuita."*
     - Botón directo: *"Crear cuenta y migrar XP"* que levanta `AuthModal` en pestaña de registro.
  2. **Dentro de `WorkspaceHeader.tsx` o `CatalogPage.tsx`:**
     - Variante compacta con badge informativo discreto y botón de acción rápido.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ℹ  Estás jugando como Invitado. Conserva tus 180 XP y récords históricos.   [ Guardar Progreso ] │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4. Modal de Autenticación y Migración (`AuthModal.tsx`)

Ubicación: `apps/web/src/features/auth/components/AuthModal.tsx`

* **Mejoras y Validación de Migración:**
  - **Pestaña de Registro (Modo Migración si `user?.isGuest === true`):**
    - Título contextualizado: *"Conserva tu progreso"* / *"Crea tu cuenta permanente"*.
    - Texto explicativo dinámico: *"Crea una cuenta permanente para sincronizar tus {user.totalXP} XP y récords históricos."*
    - Botón de envío: *"Crear Cuenta y Migrar XP"*.
  - **Pestaña de Inicio de Sesión (Login):**
    - Permite al usuario iniciar sesión en una cuenta existente (en caso de que ya tenga credenciales).
  - **Gestión de Respuestas y Errores:**
    - Mapeo de errores de backend con `ApiHttpError` (ej. "El correo electrónico ya se encuentra registrado", "La contraseña debe tener al menos 6 caracteres").
    - Estados de carga (*Loading state*) en el botón con deshabilitación de inputs durante el procesamiento.

---

### 4.5. Hook de Autenticación y Flujo de Migración (`useAuth.ts`)

Ubicación: `apps/web/src/features/auth/hooks/useAuth.ts`

* **Lógica de Mutación de Registro:**
  ```typescript
  const registerMutation = useMutation({
    mutationFn: (dto: RegisterRequestDto) => {
      // Si el usuario actual es invitado, enviamos su accessToken de invitado en el header Authorization
      const currentGuestToken = user?.isGuest ? accessToken : null;
      return authApi.register(dto, currentGuestToken);
    },
    onSuccess: (data) => {
      // 1. Guardar el nuevo token permanente y datos del usuario promovido
      setSession(data.accessToken, data.user);
      
      // 2. Invalidar todas las consultas de progreso y perfil
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      
      // 3. Notificación de éxito o feedback visual
    }
  });
  ```

---

## 5. Matriz de Estados y Casos de Prueba

| Escenario | Condición Inicial | Acción / Evento | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **Aumento de XP en el Mismo Nivel** | `TotalXP = 50` (Nivel 1) | Evaluación suma $+40$ XP | `TotalXP = 90` (Nivel 1, $60\%$). `XpProgressBar` anima de $33\%$ a $60\%$. Indicador flotante muestra `+40 XP`. No se abre modal de nivel. |
| **Subida de Nivel (Level Up)** | `TotalXP = 120` (Nivel 1) | Evaluación suma $+60$ XP | `TotalXP = 180` (Nivel 2, $20\%$). Barra se llena y reinicia en $20\%$. Se abre automáticamente `LevelUpModal` felicitando el Nivel 2. |
| **Reintento sin Superar Récord (Anti-farmeo)** | `HighScore = 80`, `TotalXP = 80` | Reintento obtiene nota de $75$ | `earnedXP = 0`, `TotalXP = 80`. No hay animación de XP sumada. Modal muestra badge informativo. |
| **Invitado con Progreso Ve Banner de Retención** | `isGuest = true`, `TotalXP = 95` | Finaliza evaluación con éxito | `EvaluationModal` despliega `GuestProgressBanner` con botón para guardar progreso. |
| **Migración Exitosa de Invitado a Registrado** | `isGuest = true`, `TotalXP = 180`, token anónimo | Completa formulario en `AuthModal` con email válido | Backend responde con nuevo JWT y `isGuest = false`, `TotalXP = 180`. Se actualiza `useAuthStore`. Banner desaparece. Menú muestra nombre registrado. |
| **Error en Migración (Email Duplicado)** | `isGuest = true` | Ingresa email ya existente en BD | `AuthModal` captura error 409 (`ApiHttpError`), muestra mensaje descriptivo en rojo sin perder datos del formulario. |
| **Usuario Registrado no ve Banners de Invitado** | `isGuest = false` | Finaliza evaluación con éxito | No se despliega banner de migración en `EvaluationModal` ni en `WorkspaceHeader`. |

---

## 6. Diseño Visual y Accesibilidad (WCAG 2.1 AA)

### 6.1. Paleta de Colores Semántica (Tailwind CSS)

* **XP & Gamificación:**
  - Barra de Progreso y Badges: `from-amber-500 to-amber-600` (Light) / `from-amber-400 to-amber-500` (Dark).
  - Sombra de neón: `shadow-[0_0_10px_rgba(245,158,11,0.4)]`.
  - Iconos: `text-amber-500 dark:text-amber-400`.
* **Banner de Invitado:**
  - Fondo: `bg-amber-500/10 dark:bg-amber-950/30`.
  - Borde: `border-amber-500/30 dark:border-amber-500/20`.
  - Texto: `text-amber-900 dark:text-amber-200`.
* **Subida de Nivel:**
  - Overlay: `bg-slate-950/80 backdrop-blur-md`.
  - Insignia: Gradiente dorado `from-yellow-400 via-amber-500 to-orange-500`.

### 6.2. Criterios de Accesibilidad:
- Roles ARIA: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.
- Modales: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, captura de foco y cierre con tecla `Escape`.
- Ratios de contraste $\ge 4.5:1$ en todos los estados y temas.

---

## 7. Plan de Testing Unitario y de Integración (Vitest)

Se diseñarán y verificarán las siguientes suites de pruebas:

1. **`XpProgressBar.test.tsx`:**
   * Renderizado correcto del nivel calculado y porcentajes de XP ($0$, $75$, $150$, $300$).
   * Disparo de animación y renderizado de la píldora flotante al cambiar la prop `totalXp`.
   * Atributos de accesibilidad `role="progressbar"` y `aria-valuenow`.
2. **`LevelUpModal.test.tsx`:**
   * Renderizado del nuevo nivel, título y resumen motivacional.
   * Ejecución de `onClose` al hacer clic en el botón de confirmación o presionar `Escape`.
   * Trampa de foco y bloqueo de scroll en el body.
3. **`GuestProgressBanner.test.tsx`:**
   * Renderizado del texto de advertencia con la cantidad exacta de XP del usuario.
   * Ejecución del callback `onRegisterClick` al presionar el botón de acción.
4. **`AuthModal.test.tsx`:**
   * Renderizado en modo registro y modo login.
   * Validación de campos requeridos y longitud mínima de contraseña.
   * Llamada a `register` con el token de invitado en el header.
   * Manejo visual de errores del servidor (`ApiHttpError`).
5. **`useAuth.test.tsx` (Flujo de Migración):**
   * Verificación de que `registerMutation` envía el token del invitado si `user.isGuest === true`.
   * Actualización del estado en `useAuthStore` con el nuevo usuario registrado (`isGuest: false`).
   * Invalidación de queries (`units`, `profile`).

---

## 8. Criterios de Aceptación y Checklist de Finalización

- [ ] La barra `XpProgressBar` en el header se actualiza automáticamente tras recibir el resultado de la evaluación.
- [ ] La micro-animación de incremento de XP y la píldora flotante `+XX XP` se activan fluidamente a 60 FPS.
- [ ] Cuando la evaluación produce un cambio de nivel ($\text{Level}_{\text{nuevo}} > \text{Level}_{\text{previo}}$), se despliega automáticamente el `LevelUpModal`.
- [ ] El `EvaluationModal` integra el `GuestProgressBanner` si el usuario es invitado, invitándolo a guardar sus XP.
- [ ] `AuthModal` permite crear una cuenta permanente y envía el token de invitado para migrar la cuenta en el backend.
- [ ] Tras la migración, la sesión se actualiza a `isGuest: false`, el banner desaparece y los datos de catálogo/perfil se mantienen intactos.
- [ ] La suite de pruebas de Vitest pasa al 100% sin advertencias ni regresiones.
