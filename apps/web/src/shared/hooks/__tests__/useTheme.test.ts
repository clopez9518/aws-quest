import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { useThemeStore } from '../../stores/useThemeStore';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().setTheme('dark');
  });

  it('debe exponer el tema actual y la bandera isDark = true cuando resolvedTheme es dark', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('debe alternar el tema correctamente y actualizar isDark a false', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });
});
