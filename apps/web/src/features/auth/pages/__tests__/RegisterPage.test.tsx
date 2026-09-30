import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { RegisterPage } from '../RegisterPage';
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

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    vi.restoreAllMocks();
  });

  it('debe renderizar los inputs de nombre, correo, contraseña con minLength 8, lista de requisitos y botón', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    const passwordInput = screen.getByLabelText(/^Contraseña$/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('minLength', '8');
    expect(passwordInput).toHaveAttribute('placeholder', 'Mínimo 8 caracteres');
    expect(screen.getByTestId('password-requirements-list')).toBeInTheDocument();
    expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Cuenta y Comenzar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it('debe mostrar el banner de migración si el usuario actual es invitado con XP acumulados (RN-13)', () => {
    useAuthStore.getState().setSession('guest-token', {
      id: 'g-1',
      name: 'Invitado_1',
      email: null,
      isGuest: true,
      totalXP: 250,
      level: 2
    });

    renderWithProviders(<RegisterPage />);

    expect(screen.getByText(/¡Migración automática activada!/i)).toBeInTheDocument();
    expect(screen.getByText(/250 XP/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si el email ya está en uso', async () => {
    vi.spyOn(authApi, 'register').mockRejectedValue(
      new ApiHttpError('El email ya está registrado', 409, 'EMAIL_ALREADY_EXISTS')
    );

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'carlos@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'secretPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Comenzar/i }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });
});
