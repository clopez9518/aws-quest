import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccessModeToggle } from '../AccessModeToggle';

describe('AccessModeToggle', () => {
  it('debe renderizar los botones de Modo Libre y Progresivo indicando el modo activo', () => {
    const onToggle = vi.fn();
    render(<AccessModeToggle accessMode="openAccess" onToggle={onToggle} />);

    expect(screen.getByText('Modo de Acceso:')).toBeInTheDocument();
    const openBtn = screen.getByRole('button', { name: /Modo Libre/i });
    const progBtn = screen.getByRole('button', { name: /Progresivo/i });

    expect(openBtn).toBeInTheDocument();
    expect(progBtn).toBeInTheDocument();

    // Al hacer click en Progresivo debe llamar a onToggle('progressive')
    fireEvent.click(progBtn);
    expect(onToggle).toHaveBeenCalledWith('progressive');
  });

  it('debe llamar a onToggle("openAccess") cuando se presiona Modo Libre estando en Progresivo', () => {
    const onToggle = vi.fn();
    render(<AccessModeToggle accessMode="progressive" onToggle={onToggle} />);

    const openBtn = screen.getByRole('button', { name: /Modo Libre/i });
    fireEvent.click(openBtn);

    expect(onToggle).toHaveBeenCalledWith('openAccess');
  });
});
