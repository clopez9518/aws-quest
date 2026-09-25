# Especificación Técnica: Proveedor de Tema Dark / Light Mode (Fase 4 - Hito 4.3)

## 1. Introducción y Objetivos

Esta especificación técnica define la arquitectura, gestión de estado con Zustand, persistencia en `localStorage`, sincronización reactiva con el DOM (`class="dark"` en `<html>`), soporte para preferencias del sistema operativo (`prefers-color-scheme`), componente interactivo `ThemeToggle` e integración en el layout global para el módulo de soporte dual de temas (**Dark Mode / Light Mode**) en la aplicación web (**`apps/web`**), correspondiente a la **Tarea 4.3** de la **Fase 4** del plan de implementación ([`docs/12-implementation-plan.md`](file:///c:/workspace/aws/aws-game/docs/12-implementation-plan.md)), en estricto cumplimiento con el diseño UI/UX ([`docs/11-ui-ux.md`](file:///c:/workspace/aws/aws-game/docs/11-ui-ux.md)), la especificación de diseño visual ([`docs/09-frontend-bootstrap.md`](file:///c:/workspace/aws/aws-game/docs/09-frontend-bootstrap.md)) y el layout global previamente implementado ([`specs/routing-global-layout-spec.md`](file:///c:/workspace/aws/aws-game/specs/routing-global-layout-spec.md)).

### Objetivos Clave:
1. **Soporte Dual de Tema Completo (`Dark` / `Light` / `System`):** Proveer una experiencia visual consistente que admita modo oscuro nativo de AWS, modo claro de alto contraste y detección automática basada en la configuración del sistema operativo (`prefers-color-scheme`).
2. **Gestor de Estado de Tema Reactivo y Persistente (`useThemeStore.ts`):** Administrar la preferencia del usuario con Zustand y persistirla en `localStorage` bajo la clave `awsquest_theme_mode`, con tolerancia a fallos en entornos sin almacenamiento.
3. **Sincronización Inmediata con el DOM y CSS:** Aplicar o remover la clase `dark` en `document.documentElement` y actualizar la propiedad `color-scheme` para que Tailwind CSS active automáticamente las variantes `dark:*` en todos los componentes.
4. **Listener en Tiempo Real para Preferencias del Sistema:** Escuchar eventos `change` de `window.matchMedia('(prefers-color-scheme: dark)')` para actualizar dinámicamente la interfaz cuando la preferencia seleccionada sea `system`.
5. **Componente Interactivo Accesible (`ThemeToggle.tsx`):** Botón ergonómico en el Header persistente con iconografía de `Sun` / `Moon` (`lucide-react`), transiciones visuales suaves y atributos de accesibilidad (`aria-label`, foco visible).
6. **Desacoplamiento Ergonómico (`useTheme.ts`):** Hook que encapsula el acceso al tema resuelto (`isDark: boolean`), tema configurado (`theme: 'dark' | 'light' | 'system'`) y métodos de alternancia rápida (`toggleTheme()`).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DEL PROVEEDOR DE TEMA                    │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         COMPONENTES UI                              │   │
│   │      (RootLayout.tsx, ThemeToggle.tsx, Canvas, Modales, etc.)       │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Consumen vía hook                    │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      HOOK DE TEMA (useTheme.ts)                     │   │
│   │     - theme: 'dark' | 'light' | 'system'                            │   │
│   │     - resolvedTheme: 'dark' | 'light'                               │   │
│   │     - isDark: boolean                                               │   │
│   │     - setTheme(mode), toggleTheme()                                 │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Lee / Modifica                       │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   ZUSTAND STORE (useThemeStore.ts)                  │   │
│   │  - Lee/Escribe en localStorage ('awsquest_theme_mode')              │   │
│   │  - Escucha matchMedia('(prefers-color-scheme: dark)')               │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │ Sincroniza mutaciones                │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   DOM (document.documentElement)                    │   │
│   │  - Agrega / Remueve clase 'dark' en <html class="...">              │   │
│   │  - Sincroniza estilo 'color-scheme: dark | light'                   │   │
│   │  - Tailwind CSS activa selector 'darkMode: class'                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Requerimientos y Reglas de Negocio Vinculadas

| Requisito / Regla | Concepto | Aplicación en el Proveedor de Tema |
| :--- | :--- | :--- |
| **11-ui-ux (Sec. 1.1)** | Soporte Dual de Tema | Detección de `prefers-color-scheme` con selector manual persistente en cabecera. |
| **11-ui-ux (Sec. 2.1)** | Paleta de Colores Dual | Contraste adecuado entre fondos oscuros (`#0B0F19`) y claros (`#F8FAFC`), superficies y bordes. |
| **RNF-04** | Diseño Adaptable | Coherencia cromática en todos los breakpoints responsivos. |
| **RNF-05** | Iconografía Limpia | Iconos outline `Sun` / `Moon` de `lucide-react` con transiciones de rotación y opacidad. |
| **RNF-06** | Feedback Visual | Feedback inmediato al alternar el tema sin parpadeos (*FOUC* - Flash of Unstyled Content). |
| **WCAG 2.1 AA** | Accesibilidad Visual | Garantía de ratio de contraste $\ge 4.5:1$ en textos principales en ambos modos. |

---

## 3. Tipos TypeScript y Modelo de Datos (`shared/types/theme.types.ts`)

```typescript
/**
 * Modos de tema seleccionables por el usuario.
 */
export type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Tema efectivo aplicado en el DOM (resuelto tras evaluar preferencias del sistema).
 */
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
```

---

## 4. Gestor de Estado y Sincronización DOM con Zustand (`shared/stores/useThemeStore.ts`)

El store administra el ciclo de vida del tema, realiza la resolución de preferencias de medios y sincroniza directamente las clases del elemento raíz `<html>`:

```typescript
// apps/web/src/shared/stores/useThemeStore.ts
import { create } from 'zustand';
import { ThemeMode, ResolvedTheme, ThemeState } from '../types/theme.types';

export const THEME_STORAGE_KEY = 'awsquest_theme_mode';

/**
 * Detecta si el sistema operativo tiene activada la preferencia de modo oscuro.
 */
function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Fallback por defecto a Dark Mode
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resuelve el tema visual efectivo ('dark' o 'light') a partir del modo configurado.
 */
function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Sincroniza la clase 'dark' y color-scheme en document.documentElement.
 */
function applyThemeToDom(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

/**
 * Carga el tema persistido en localStorage con fallback a 'system' o 'dark'.
 */
function loadPersistedTheme(): ThemeMode {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 'dark';
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    return 'dark';
  } catch (err) {
    console.error('[useThemeStore] Error leyendo tema de localStorage:', err);
    return 'dark';
  }
}

const initialTheme = loadPersistedTheme();
const initialResolved = resolveTheme(initialTheme);
applyThemeToDom(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listener para cambios de tema en el sistema operativo
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentTheme = get().theme;
      if (currentTheme === 'system') {
        const newResolved = getSystemPreference();
        applyThemeToDom(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (newTheme: ThemeMode) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        }
      } catch (err) {
        console.error('[useThemeStore] Error persistiendo tema en localStorage:', err);
      }

      const resolved = resolveTheme(newTheme);
      applyThemeToDom(resolved);
      set({ theme: newTheme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const currentResolved = get().resolvedTheme;
      const nextTheme: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    }
  };
});
```

---

## 5. Hook Personalizado de Tema (`shared/hooks/useTheme.ts`)

```typescript
// apps/web/src/shared/hooks/useTheme.ts
import { useThemeStore } from '../stores/useThemeStore';

export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme
  };
}
```

---

## 6. Componente Selector de Tema (`shared/components/ThemeToggle.tsx`)

Renderiza el botón de alternancia rápida con animaciones suaves y soporte de accesibilidad:

```tsx
// apps/web/src/shared/components/ThemeToggle.tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl border transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-inner'
          : 'bg-white border-slate-200 text-amber-500 hover:bg-slate-100 hover:text-amber-600 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
```

---

## 7. Integración en el Header Persistente (`routes/RootLayout.tsx`)

Se incorpora el componente `ThemeToggle` en la cabecera persistente, ubicado estratégicamente entre la barra de XP y el menú de sesión:

```tsx
// apps/web/src/routes/RootLayout.tsx
import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/useAuthStore';
import { XpProgressBar } from '../shared/components/XpProgressBar';
import { UserSessionMenu } from '../features/auth/components/UserSessionMenu';
import { AuthModal } from '../features/auth/components/AuthModal';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { Cloud } from 'lucide-react';

export function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950">
      {/* Persistent Global Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
        {/* Brand & Logo */}
        <Link to="/catalog" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors uppercase flex items-center space-x-1.5">
              <span>AWS Quest</span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider font-mono">
              Architecture Arena
            </span>
          </div>
        </Link>

        {/* User Stats, Theme Toggle & Session Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <XpProgressBar totalXp={user?.totalXP ?? 0} />
          <ThemeToggle />
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

## 8. Estructura de Archivos a Crear y Modificar

```text
apps/web/src/
├── routes/
│   └── RootLayout.tsx                      # [MODIFICAR] Integración de ThemeToggle y clases duales
│
└── shared/
    ├── components/
    │   └── ThemeToggle.tsx                 # [CREAR] Componente interactivo selector de tema
    ├── hooks/
    │   └── useTheme.ts                     # [CREAR] Hook ergonómico de tema
    ├── stores/
    │   └── useThemeStore.ts                # [CREAR] Zustand store con persistencia y matchMedia
    └── types/
        └── theme.types.ts                  # [CREAR] Tipos ThemeMode, ResolvedTheme, ThemeState
```

---

## 9. Estrategia de Pruebas Unitarias y Criterios de Aceptación

### 9.1. Pruebas Unitarias Propuestas

1. **`useThemeStore.test.ts`:**
   * Debe inicializar con tema persistido si existe en `localStorage`.
   * `setTheme('light')` debe actualizar `theme`, `resolvedTheme`, guardar en `localStorage` y añadir clase `light` a `document.documentElement`.
   * `setTheme('dark')` debe actualizar `theme`, `resolvedTheme`, guardar en `localStorage` y añadir clase `dark` a `document.documentElement`.
   * `toggleTheme()` debe alternar de `dark` a `light` y viceversa.
   * `setTheme('system')` debe resolver el tema según `window.matchMedia`.

2. **`useTheme.test.ts`:**
   * Debe retornar `isDark = true` cuando `resolvedTheme === 'dark'`.
   * Debe exponer métodos `setTheme` y `toggleTheme`.

3. **`ThemeToggle.test.tsx`:**
   * Debe renderizar el icono de `Sun` cuando el tema resuelto sea `dark`.
   * Debe renderizar el icono de `Moon` cuando el tema resuelto sea `light`.
   * Al hacer clic, debe disparar la alternancia de tema.
   * Debe tener el atributo `aria-label` adecuado para lectores de pantalla.

4. **`RootLayout.test.tsx` (Actualización):**
   * Debe renderizar el botón `ThemeToggle` en el header junto a la barra de XP y el menú de sesión.

### 9.2. Criterios de Aceptación Técnicos (Milestone 4.3)

* [ ] El usuario puede alternar entre Dark Mode y Light Mode haciendo clic en el botón `ThemeToggle` del Header.
* [ ] La preferencia de tema se persiste en `localStorage` (`awsquest_theme_mode`) y se preserva al recargar la página.
* [ ] La clase `dark` se sincroniza reactivamente en la etiqueta `<html class="dark">` de acuerdo con la selección.
* [ ] El diseño visual de `RootLayout` y componentes principales soporta ambos modos con transiciones de color suaves.
* [ ] La suite completa de pruebas unitarias de Vitest supera el 100% de aserciones.
