import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { useThemeStore } from '../../stores/useThemeStore';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().setTheme('dark');
  });

  it('debe renderizar el botón con aria-label de modo claro cuando está en dark mode', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /Cambiar a modo claro/i });
    expect(button).toBeInTheDocument();
  });

  it('debe alternar a modo oscuro al hacer clic', () => {
    useThemeStore.getState().setTheme('light');
    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: /Cambiar a modo oscuro/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
  });
});
