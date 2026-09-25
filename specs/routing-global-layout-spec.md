# Especificación Técnica: Configuración de Enrutamiento y Layout Global (Fase 4 - Hito 4.2)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura, diseño de componentes visuales, sistema de navegación con React Router, layout global persistente con cabecera de gamificación (Nivel, barra de progreso XP, control de sesión de usuario/invitado) y páginas de autenticación para la aplicación web (**`apps/web`**), correspondiente a la **Tarea 4.2** de la **Fase 4** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)), en estricto cumplimiento con el diseño UI/UX ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), la arquitectura de frontend ([`docs/09-frontend-bootstrap.md`](file:///c:/workspace/aws/aws-game/docs/09-frontend-bootstrap.md)), las reglas de gamificación de backend ([`apps/api/src/AwsQuest.Domain/Engine/Models/GameScoringRules.cs`](file:///c:/workspace/aws/aws-game/apps/api/src/AwsQuest.Domain/Engine/Models/GameScoringRules.cs)) y la especificación previa del cliente HTTP ([`specs/http-client-auth-spec.md`](file:///c:/workspace/aws/aws-game/specs/http-client-auth-spec.md)).

### Objetivos Clave:
1. **Configuración de Enrutamiento Declarativo (`routes/index.tsx`):** Implementar la jerarquía de rutas SPA utilizando `createBrowserRouter` de React Router DOM v7, con redirecciones limpias (`/` $\rightarrow$ `/catalog`), rutas protegidas/contextuales (`/catalog`, `/challenges/:id`, `/login`, `/register`), página 404 (*Not Found*) y captura global de fallos de renderizado (*Error Boundary*).
2. **Layout Global Persistente con Header de Gamificación (`RootLayout.tsx`):** Construir la estructura visual persistente que envuelve a toda la aplicación, proveyendo un Header fijo con:
   * **Branding AWS Quest:** Logotipo oficial estilizado con distintivo AWS Orange y navegación a `/catalog`.
   * **Indicador de Nivel y Barra de Progreso XP (`UserLevelBadge`, `XpProgressBar`):** Representación visual reactiva del progreso de experiencia del usuario sincronizada con `useAuthStore` y la fórmula matemática oficial de nivel (`Nivel = 1 + floor(TotalXP / 150)` - **RN-10**).
   * **Badge y Menú de Sesión (`UserSessionMenu`):**
     * En **Modo Invitado (`isGuest = true`)**: Muestra un badge visual de *"Modo Invitado"* y un botón de llamado a la acción *"Guardar progreso"* que abre el modal de registro con migración (**RN-13 / CU-08**).
     * En **Usuario Registrado (`isGuest = false`)**: Muestra el nombre, avatar, email y un menú desplegable con botón de *"Cerrar sesión"*.
3. **Modal de Autenticación y Migración Rápida (`features/auth/components/AuthModal.tsx`):** Diálogo interactivo accesible desde cualquier vista para usuarios en Modo Invitado, permitiendo registrarse o iniciar sesión sin perder el contexto de juego ni su progreso acumulado (**CU-08**).
4. **Páginas Dedicadas de Autenticación (`LoginPage.tsx` y `RegisterPage.tsx`):** Vistas completas con validación de inputs, feedback visual de errores estructurados (`ApiHttpError`), indicadores de carga y avisos explícitos de migración de datos.
5. **Utilidades de Gamificación Puras (`shared/utils/gamification.ts`):** Módulo desacoplado para el cálculo de nivel, XP requerida y porcentaje de avance hacia el siguiente nivel.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   ARQUITECTURA DE ENRUTAMIENTO Y LAYOUT GLOBAL              │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         App.tsx (Root Provider)                     │   │
│   │       (QueryClientProvider + RouterProvider + useGuestSession)      │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      routes/index.tsx (Router)                      │   │
│   │  - ErrorBoundary: RootErrorBoundary.tsx                             │   │
│   │  - RootLayout (Path: '/')                                           │   │
│   │    ├── Index Redirect ──► /catalog                                  │   │
│   │    ├── Route: /catalog          ──► CatalogPage.tsx                 │   │
│   │    ├── Route: /challenges/:id   ──► ChallengePage.tsx               │   │
│   │    ├── Route: /login            ──► LoginPage.tsx                   │   │
│   │    ├── Route: /register         ──► RegisterPage.tsx                │   │
│   │    └── Route: *                 ──► NotFoundPage.tsx                │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   RootLayout.tsx (Layout Principal)                 │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                       HEADER PERSISTENTE                      │  │   │
│   │  │  [Logo AWS Quest]  │  [Nivel & Barra XP]  │  [Badge Invitado /]│  │   │
│   │  │  (Link /catalog)   │  (gamification.ts)   │  [Menú Registrado]│  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                       <Outlet /> (Páginas)                    │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │               AuthModal.tsx (Modal de Migración CU-08)         │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos, Reglas de Negocio y Trazabilidad

| Requisito / Regla | Concepto | Aplicación en Enrutamiento y Layout |
| :--- | :--- | :--- |
| **RF-01** | Visualización del Catálogo | Ruta principal `/catalog` accesible para explorar unidades y desafíos. |
| **RF-20** | Modo Invitado y Registro sin Fricción | Indicador visual permanente en el Header sobre el estado de invitado y CTA de registro. |
| **RN-01** | Accesibilidad Configurable | La navegación permite acceso directo al catálogo y desafíos según la política activa. |
| **RN-10** | XP y Niveles sin Refarmeo | Barra de XP en cabecera calculada con la constante `150 XP/Nivel` de `GameScoringRules.cs`. |
| **RN-13** | Migración Atómica de Progreso | Al registrarse desde `AuthModal` o `RegisterPage`, se transfiere el progreso acumulado en el backend. |
| **CU-01** | Explorar Catálogo | Redirección por defecto de `/` a `/catalog` al entrar a la aplicación. |
| **CU-08** | Registrarse / Iniciar Sesión | Interfaz de `AuthModal`, `LoginPage` y `RegisterPage` con navegación fluida. |
| **RNF-04** | Diseño Adaptable y Responsivo | Header y páginas colapsables y adaptables en pantallas de $\ge 1280 \times 720$ px y móviles. |
| **RNF-05** | Iconografía Limpia | Uso consistente de `lucide-react` (`Cloud`, `Award`, `User`, `LogOut`, `Lock`, `ShieldCheck`, etc.). |
| **RNF-06** | Feedback Visual | Estados de hover, focus visible (`ring-2 ring-amber-400`) y animaciones en barra de XP. |

---

## 3. Fórmulas de Gamificación y Utilidad (`shared/utils/gamification.ts`)

Alineado 100% con las reglas de negocio de backend ([`GameScoringRules.cs`](file:///c:/workspace/aws/aws-game/apps/api/src/AwsQuest.Domain/Engine/Models/GameScoringRules.cs)):
* **Constante:** `XP_PER_LEVEL = 150`
* **Nivel:** $\text{Nivel} = 1 + \lfloor \frac{\text{TotalXP}}{150} \rfloor$
* **XP en el Nivel Actual:** $\text{CurrentLevelXP} = \text{TotalXP} \pmod{150}$
* **Porcentaje de Progreso hacia el Siguiente Nivel:** $\text{ProgressPercentage} = \lfloor \frac{\text{CurrentLevelXP}}{150} \times 100 \rfloor$

### Código de la Utilidad (`apps/web/src/shared/utils/gamification.ts`):

```typescript
export const XP_PER_LEVEL = 150;

export interface XpProgress {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percentage: number;
  totalXp: number;
}

/**
 * Calcula el nivel de usuario a partir de su experiencia total acumulada:
 * Nivel = 1 + floor(TotalXP / 150)
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return 1 + Math.floor(totalXp / XP_PER_LEVEL);
}

/**
 * Desglosa el progreso de XP del usuario para renderizar medidores y barras de progreso.
 */
export function getXpProgress(totalXp: number): XpProgress {
  const normalizedXp = Math.max(0, totalXp);
  const level = calculateLevel(normalizedXp);
  const currentLevelXp = normalizedXp % XP_PER_LEVEL;
  const percentage = Math.min(100, Math.floor((currentLevelXp / XP_PER_LEVEL) * 100));

  return {
    level,
    currentLevelXp,
    xpForNextLevel: XP_PER_LEVEL,
    percentage,
    totalXp: normalizedXp
  };
}
```

---

## 4. Diseño de Componentes del Layout Global

### 4.1. Barra de Nivel y XP animada (`shared/components/XpProgressBar.tsx`)

Renderiza el nivel del usuario y una barra de progreso que se llena con animación fluida:

```tsx
// apps/web/src/shared/components/XpProgressBar.tsx
import { Award, Zap } from 'lucide-react';
import { getXpProgress } from '../utils/gamification';

interface XpProgressBarProps {
  totalXp: number;
}

export function XpProgressBar({ totalXp }: XpProgressBarProps) {
  const { level, currentLevelXp, xpForNextLevel, percentage } = getXpProgress(totalXp);

  return (
    <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-inner">
      {/* Badge de Nivel */}
      <div className="flex items-center space-x-1.5 text-amber-400">
        <Award className="w-4 h-4" />
        <span className="text-xs font-bold text-slate-200 whitespace-nowrap">
          Nivel {level}
        </span>
      </div>

      <span className="text-slate-600 text-xs">|</span>

      {/* Barra de Progreso XP */}
      <div className="flex items-center space-x-2">
        <div className="w-24 sm:w-32 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-700/50 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="flex items-center text-[10px] font-mono font-medium text-amber-300 whitespace-nowrap">
          <Zap className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
          <span>{currentLevelXp}/{xpForNextLevel} XP</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 4.2. Menú de Control de Sesión (`features/auth/components/UserSessionMenu.tsx`)

Administra la representación visual del usuario y las acciones según el tipo de sesión:

```tsx
// apps/web/src/features/auth/components/UserSessionMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldAlert, Sparkles, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserSessionMenuProps {
  onOpenAuthModal: () => void;
}

export function UserSessionMenu({ onOpenAuthModal }: UserSessionMenuProps) {
  const { user, isGuest, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isGuest || !user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Modo Invitado</span>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Guardar progreso</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-800 border border-slate-700/80 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <User className="w-4 h-4" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
          <span className="text-[10px] text-emerald-400 font-mono">Registrado</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-800">
            <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email || 'Sin correo'}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-slate-800/80 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### 4.3. Layout Global Principal (`routes/RootLayout.tsx`)

Integra el Header persistente, el contenedor `<Outlet />` para vistas y el modal de autenticación:

```tsx
// apps/web/src/routes/RootLayout.tsx
import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/useAuthStore';
import { XpProgressBar } from '../shared/components/XpProgressBar';
import { UserSessionMenu } from '../features/auth/components/UserSessionMenu';
import { AuthModal } from '../features/auth/components/AuthModal';
import { Cloud } from 'lucide-react';

export function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Persistent Global Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand & Logo */}
        <Link to="/catalog" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors uppercase flex items-center space-x-1.5">
              <span>AWS Quest</span>
            </h1>
            <span className="text-[10px] text-slate-400 tracking-wider font-mono">Architecture Arena</span>
          </div>
        </Link>

        {/* User Stats & Session Status */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <XpProgressBar totalXp={user?.totalXP ?? 0} />
          <UserSessionMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Modal de Autenticación / Migración */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
```

---

## 5. Modal de Autenticación y Migración de Progreso (`features/auth/components/AuthModal.tsx`)

Permite a los usuarios invitados crear su cuenta o loguearse directamente desde un modal interactivo:

```tsx
// apps/web/src/features/auth/components/AuthModal.tsx
import { useState } from 'react';
import { X, Sparkles, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, login, isLoading, user } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === 'register') {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
      onClose();
    } catch (err) {
      if (ApiHttpError.isApiHttpError(err)) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado al procesar la solicitud.');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        {/* Glow de acento */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header del Modal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === 'register' ? 'Conserva tu progreso' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? `Crea una cuenta permanente para sincronizar tus ${user?.totalXP ?? 0} XP y récords históricos.`
              : 'Inicia sesión para continuar con tu ruta de aprendizaje de AWS.'}
          </p>
        </div>

        {/* Tabs de Selección */}
        <div className="flex rounded-xl bg-slate-950/60 p-1 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Carlos López"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
          >
            {isLoading ? 'Procesando...' : mode === 'register' ? 'Crear Cuenta y Migrar XP' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 6. Páginas de Error y Vistas Dedicadas

### 6.1. Página 404 No Encontrado (`routes/NotFoundPage.tsx`)

```tsx
// apps/web/src/routes/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <h2 className="text-3xl font-black text-slate-100">404</h2>
        <h3 className="text-base font-semibold text-slate-200">Ruta no encontrada</h3>
        <p className="text-xs text-slate-400">
          La arquitectura o sección solicitada no existe en la arena de AWS Quest.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    </div>
  );
}
```

---

### 6.2. Error Boundary Global (`routes/RootErrorBoundary.tsx`)

```tsx
// apps/web/src/routes/RootErrorBoundary.tsx
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export function RootErrorBoundary() {
  const error = useRouteError();

  let title = 'Error inesperado';
  let message = 'Ha ocurrido un error inesperado en la interfaz visual.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText}`;
    message = error.data?.message || 'Error en la petición de navegación.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 text-center">
      <div className="max-w-md space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">{title}</h2>
        <p className="text-xs text-slate-400">{message}</p>
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recargar</span>
          </button>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
          >
            <span>Ir al Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### 6.3. Configuración del Enrutador Actualizada (`routes/index.tsx`)

```tsx
// apps/web/src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { RootErrorBoundary } from './RootErrorBoundary';
import { NotFoundPage } from './NotFoundPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { CatalogPage } from '../features/catalog/pages/CatalogPage';
import { ChallengePage } from '../features/challenge/pages/ChallengePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
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
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
```

---

## 7. Páginas de Autenticación Dedicadas

### 7.1. `LoginPage.tsx` (`features/auth/pages/LoginPage.tsx`)
* Formulario centrado con campos `email` y `password`.
* Captura de errores con `ApiHttpError`.
* Redirección a `/catalog` tras login exitoso.
* Enlace a `/register`.

### 7.2. `RegisterPage.tsx` (`features/auth/pages/RegisterPage.tsx`)
* Formulario centrado con `name`, `email` y `password`.
* Banner explicativo: *"Tienes una sesión de invitado activa con {XP} puntos. Al registrarte, se vincularán automáticamente a tu cuenta."* (**RN-13 / CU-08**).
* Envío transparente del `guestToken` para migración de progreso.
* Redirección a `/catalog` tras registro exitoso.
* Enlace a `/login`.

---

## 8. Estructura de Archivos a Crear y Modificar

```text
apps/web/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── AuthModal.tsx               # [CREAR] Modal interactivo de login/registro y migración
│   │   │   └── UserSessionMenu.tsx         # [CREAR] Badge de invitado / Menú de usuario registrado
│   │   └── pages/
│   │       ├── LoginPage.tsx               # [CREAR] Página de inicio de sesión
│   │       └── RegisterPage.tsx            # [CREAR] Página de registro con migración
│   │
│   ├── catalog/
│   │   └── pages/
│   │       └── CatalogPage.tsx             # [CREAR] Vista base de catálogo
│   │
│   └── challenge/
│       └── pages/
│           └── ChallengePage.tsx           # [CREAR] Vista base de workspace
│
├── routes/
│   ├── index.tsx                           # [MODIFICAR] Router con ErrorBoundary, 404 y rutas
│   ├── RootLayout.tsx                      # [MODIFICAR] Header con XpProgressBar y UserSessionMenu
│   ├── RootErrorBoundary.tsx               # [CREAR] Error boundary global de navegación
│   └── NotFoundPage.tsx                    # [CREAR] Página 404
│
└── shared/
    ├── components/
    │   └── XpProgressBar.tsx               # [CREAR] Barra de progreso XP y nivel
    └── utils/
        └── gamification.ts                 # [CREAR] Fórmulas de nivel y desglose de XP (RN-10)
```

---

## 9. Estrategia de Pruebas Unitarias

### 9.1. Casos de Prueba Automatizados

1. **`gamification.test.ts`:**
   * `calculateLevel(0)` devuelve 1.
   * `calculateLevel(149)` devuelve 1.
   * `calculateLevel(150)` devuelve 2.
   * `calculateLevel(350)` devuelve 3.
   * `getXpProgress(75)` devuelve `{ level: 1, currentLevelXp: 75, percentage: 50 }`.
   * `getXpProgress(300)` devuelve `{ level: 3, currentLevelXp: 0, percentage: 0 }`.

2. **`XpProgressBar.test.tsx`:**
   * Debe renderizar el badge con el nivel correcto.
   * Debe asignar el ancho porcentual en el atributo `style` de la barra.
   * Debe mostrar el texto `{current}/{150} XP`.

3. **`UserSessionMenu.test.tsx`:**
   * Debe renderizar *"Modo Invitado"* y el botón *"Guardar progreso"* cuando `isGuest = true`.
   * Al hacer clic en *"Guardar progreso"*, debe disparar la función `onOpenAuthModal`.
   * Debe renderizar el nombre de usuario y el menú cuando el usuario está registrado (`isGuest = false`).
   * Al hacer clic en *"Cerrar sesión"*, debe invocar el método `logout()`.

4. **`RootLayout.test.tsx`:**
   * Debe renderizar el Header persistente con el logo y enlace a `/catalog`.
   * Debe renderizar el contenido hijo a través del `<Outlet />`.

5. **`AuthModal.test.tsx`:**
   * No debe renderizarse cuando `isOpen = false`.
   * Debe renderizarse con los tabs de Registro e Inicio de sesión cuando `isOpen = true`.
   * Debe cambiar de modo al presionar los tabs.
   * Debe mostrar mensajes de error cuando el submit falle.

6. **`LoginPage.test.tsx` y `RegisterPage.test.tsx`:**
   * Deben renderizar los campos correspondientes y botones de submit.
   * `RegisterPage` debe mostrar el banner de migración si el usuario actual es invitado.

### 9.2. Criterios de Aceptación Técnicos (Milestone 4.2)

* [ ] La aplicación redirige automáticamente de `/` a `/catalog` (**CU-01**).
* [ ] El Header muestra el nivel y la barra de XP con progreso visual acorde a `GameScoringRules` (**RN-10**).
* [ ] Los usuarios en Modo Invitado visualizan el badge de invitado y el botón *"Guardar progreso"* (**RF-20 / CU-08**).
* [ ] Al presionar *"Guardar progreso"*, se despliega el `AuthModal` con soporte para migración de cuenta (**RN-13**).
* [ ] Los usuarios registrados visualizan su nombre, avatar y menú con opción de *"Cerrar sesión"*.
* [ ] Las rutas inválidas despliegan la página 404 personalizada con retorno al catálogo.
* [ ] Fallos inesperados de renderizado son interceptados por `RootErrorBoundary`.
