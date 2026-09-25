import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthModal } from '../AuthModal';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';
import { authApi } from '../../api/authApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ApiHttpError } from '../../../../shared/api/ApiHttpError';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AuthModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    mockOnClose.mockClear();
    vi.restoreAllMocks();
  });

  it('no debe renderizar nada cuando isOpen = false', () => {
    renderWithProviders(<AuthModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText(/Conserva tu progreso/i)).not.toBeInTheDocument();
  });

  it('debe renderizarse en modo Crear Cuenta por defecto cuando isOpen = true', () => {
    useAuthStore.getState().setSession('guest-token', {
      id: 'g-1',
      name: 'Invitado_1',
      email: null,
      isGuest: true,
      totalXP: 100,
      level: 1
    });

    renderWithProviders(<AuthModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Conserva tu progreso')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Cuenta y Migrar XP/i })).toBeInTheDocument();
  });

  it('debe alternar entre pestañas de Crear Cuenta e Iniciar Sesión', () => {
    renderWithProviders(<AuthModal isOpen={true} onClose={mockOnClose} />);

    // Cambiar a Iniciar Sesión
    const loginTab = screen.getByRole('button', { name: /Iniciar Sesión/i });
    fireEvent.click(loginTab);

    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nombre Completo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Entrar$/i })).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si el registro falla', async () => {
    vi.spyOn(authApi, 'register').mockRejectedValue(
      new ApiHttpError('El email ya está registrado', 409, 'EMAIL_ALREADY_EXISTS')
    );

    renderWithProviders(<AuthModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'carlos@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Secret123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Migrar XP/i }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });
});
