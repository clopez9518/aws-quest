import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestProgressBanner } from '../GuestProgressBanner';

describe('GuestProgressBanner', () => {
  it('debe renderizar el banner normal con la cantidad de XP', () => {
    const handleRegister = vi.fn();
    render(
      <GuestProgressBanner
        onRegisterClick={handleRegister}
        totalXp={180}
      />
    );

    expect(screen.getByTestId('guest-progress-banner')).toBeInTheDocument();
    expect(screen.getByText(/180 XP/)).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta y migrar XP')).toBeInTheDocument();
  });

  it('debe invocar onRegisterClick al hacer clic en el botón principal', () => {
    const handleRegister = vi.fn();
    render(
      <GuestProgressBanner
        onRegisterClick={handleRegister}
        totalXp={200}
      />
    );

    const btn = screen.getByRole('button', { name: /Crear cuenta y migrar XP/i });
    fireEvent.click(btn);

    expect(handleRegister).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar la variante compacta cuando compact es true', () => {
    const handleRegister = vi.fn();
    render(
      <GuestProgressBanner
        onRegisterClick={handleRegister}
        totalXp={95}
        compact={true}
      />
    );

    expect(screen.getByTestId('guest-progress-banner-compact')).toBeInTheDocument();
    expect(screen.getByText('Modo Invitado (95 XP)')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(btn);
    expect(handleRegister).toHaveBeenCalledTimes(1);
  });
});
