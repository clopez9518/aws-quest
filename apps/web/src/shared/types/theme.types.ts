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
