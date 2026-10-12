import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RootLayout } from '../RootLayout';
import { useAuthStore } from '../../shared/stores/useAuthStore';
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

describe('RootLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
  });

  it('debe renderizar el Header persistente con logo, nivel y botón de invitado', () => {
    useAuthStore.getState().setSession('guest-token', {
      id: 'g-1',
      name: 'Invitado_100',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    });

    renderWithProviders(<RootLayout />);

    expect(screen.getByText('AWS Quest')).toBeInTheDocument();
    expect(screen.getByText('Architecture Arena')).toBeInTheDocument();
    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.getByText('Modo Invitado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Desafíos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Diccionario/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar progreso/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cambiar a modo/i })).toBeInTheDocument();
  });

  it('debe abrir el tutorial de bienvenida automáticamente si es la primera visita y permitir cerrarlo', () => {
    renderWithProviders(<RootLayout />);

    expect(screen.getByTestId('onboarding-tutorial-modal')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido a AWS Quest Architecture Arena/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('skip-onboarding-tutorial'));
    expect(screen.queryByTestId('onboarding-tutorial-modal')).not.toBeInTheDocument();
  });

  it('no debe abrir el tutorial automáticamente si ya fue completado previamente, pero permite abrirlo con el botón Tutorial del header', () => {
    localStorage.setItem('awsquest_onboarding_completed', 'true');
    renderWithProviders(<RootLayout />);

    expect(screen.queryByTestId('onboarding-tutorial-modal')).not.toBeInTheDocument();

    const tutorialBtn = screen.getByTestId('header-tutorial-button');
    fireEvent.click(tutorialBtn);

    expect(screen.getByTestId('onboarding-tutorial-modal')).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido a AWS Quest Architecture Arena/i)).toBeInTheDocument();
  });
});

