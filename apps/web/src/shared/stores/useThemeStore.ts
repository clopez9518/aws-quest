import { create } from 'zustand';
import { ThemeMode, ResolvedTheme, ThemeState } from '../types/theme.types';

export const THEME_STORAGE_KEY = 'awsquest_theme_mode';

/**
 * Detecta si el sistema operativo tiene activada la preferencia de modo oscuro.
 */
export function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'; // Fallback por defecto a Dark Mode
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resuelve el tema visual efectivo ('dark' o 'light') a partir del modo configurado.
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Sincroniza la clase 'dark' / 'light' y color-scheme en document.documentElement.
 */
export function applyThemeToDom(resolved: ResolvedTheme): void {
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
 * Carga el tema persistido en localStorage con fallback a 'dark'.
 */
export function loadPersistedTheme(): ThemeMode {
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
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as { addListener: (cb: () => void) => void }).addListener(handleChange);
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
