import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UserSessionMenu } from '../UserSessionMenu';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

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

describe('UserSessionMenu', () => {
  const mockOnOpenAuthModal = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    mockOnOpenAuthModal.mockClear();
  });

  it('debe mostrar el badge de Modo Invitado y el botón Guardar progreso cuando isGuest = true', () => {
    useAuthStore.getState().setSession('guest-token', {
      id: 'guest-1',
      name: 'Invitado_1234',
      email: null,
      isGuest: true,
      totalXP: 50,
      level: 1
    });

    renderWithProviders(<UserSessionMenu onOpenAuthModal={mockOnOpenAuthModal} />);

    expect(screen.getByText('Modo Invitado')).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: /Guardar progreso/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(mockOnOpenAuthModal).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el nombre de usuario y desplegar menú de Cerrar sesión cuando isGuest = false', () => {
    useAuthStore.getState().setSession('perm-token', {
      id: 'perm-1',
      name: 'Carlos López',
      email: 'carlos@example.com',
      isGuest: false,
      totalXP: 200,
      level: 2
    });

    renderWithProviders(<UserSessionMenu onOpenAuthModal={mockOnOpenAuthModal} />);

    expect(screen.getByText('Carlos López')).toBeInTheDocument();
    expect(screen.getByText('Registrado')).toBeInTheDocument();

    // Abrir dropdown
    const userButton = screen.getByRole('button', { expanded: false });
    fireEvent.click(userButton);

    const logoutButton = screen.getByRole('button', { name: /Cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
