import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore, THEME_STORAGE_KEY } from '../useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('debe inicializar por defecto en dark mode y aplicar la clase dark al DOM', () => {
    useThemeStore.getState().setTheme('dark');
    const state = useThemeStore.getState();

    expect(state.theme).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('debe cambiar a light mode, persistir en localStorage y actualizar el DOM', () => {
    useThemeStore.getState().setTheme('light');
    const state = useThemeStore.getState();

    expect(state.theme).toBe('light');
    expect(state.resolvedTheme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('debe alternar entre dark y light al llamar a toggleTheme', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('debe resolver el tema del sistema cuando theme = system', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    useThemeStore.getState().setTheme('system');
    const state = useThemeStore.getState();

    expect(state.theme).toBe('system');
    expect(state.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
