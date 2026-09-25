import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LoginPage } from '../LoginPage';
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

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe renderizar los inputs de correo, contraseña y botón de ingreso', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Iniciar Sesión$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si las credenciales son inválidas', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(
      new ApiHttpError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS')
    );

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /^Iniciar Sesión$/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });
});
