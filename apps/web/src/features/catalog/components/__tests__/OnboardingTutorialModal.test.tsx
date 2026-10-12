import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  OnboardingTutorialModal,
  ONBOARDING_STORAGE_KEY
} from '../OnboardingTutorialModal';

describe('OnboardingTutorialModal', () => {
  const onClose = vi.fn();
  const onComplete = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es falso', () => {
    const { container } = render(
      <OnboardingTutorialModal isOpen={false} onClose={onClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el primer paso (Bienvenida) cuando isOpen es verdadero', () => {
    render(
      <OnboardingTutorialModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    expect(screen.getByTestId('onboarding-tutorial-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Bienvenido a AWS Quest Architecture Arena/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 4/i)).toBeInTheDocument();
    expect(screen.getByTestId('next-step-onboarding')).toBeInTheDocument();
    expect(screen.queryByTestId('prev-step-onboarding')).not.toBeInTheDocument();
  });

  it('permite avanzar entre pasos hasta el final y completa el tutorial', () => {
    render(
      <OnboardingTutorialModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    // Paso 1 -> Paso 2
    fireEvent.click(screen.getByTestId('next-step-onboarding'));
    expect(
      screen.getByText(/Itinerario por Olas y Modos de Desafío/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Paso 2 de 4/i)).toBeInTheDocument();
    expect(screen.getByTestId('prev-step-onboarding')).toBeInTheDocument();

    // Paso 2 -> Paso 3
    fireEvent.click(screen.getByTestId('next-step-onboarding'));
    expect(
      screen.getByText(/Topología Interactiva & CIDR en Redes/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Paso 3 de 4/i)).toBeInTheDocument();

    // Paso 3 -> Paso 4
    fireEvent.click(screen.getByTestId('next-step-onboarding'));
    expect(
      screen.getByText(/Glosario Cloud & Sistema de Niveles/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Paso 4 de 4/i)).toBeInTheDocument();
    expect(screen.getByText('¡Comenzar Desafíos!')).toBeInTheDocument();

    // Finalizar en el último paso
    fireEvent.click(screen.getByTestId('next-step-onboarding'));
    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('permite retroceder al paso anterior con el botón Anterior', () => {
    render(
      <OnboardingTutorialModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    fireEvent.click(screen.getByTestId('next-step-onboarding'));
    expect(screen.getByText(/Paso 2 de 4/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('prev-step-onboarding'));
    expect(screen.getByText(/Paso 1 de 4/i)).toBeInTheDocument();
  });

  it('permite saltar el tutorial y guarda la marca en localStorage', () => {
    render(
      <OnboardingTutorialModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    const skipButton = screen.getByTestId('skip-onboarding-tutorial');
    fireEvent.click(skipButton);

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('permite cerrar desde la X superior y guarda la marca', () => {
    render(
      <OnboardingTutorialModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    );

    const closeButton = screen.getByTestId('close-onboarding-tutorial');
    fireEvent.click(closeButton);

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
