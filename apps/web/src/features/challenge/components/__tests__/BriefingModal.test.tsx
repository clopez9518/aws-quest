import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BriefingModal } from '../BriefingModal';
import { ChallengeBriefingDto } from '../../types/challenge.types';

describe('BriefingModal Component', () => {
  const mockBriefing: ChallengeBriefingDto = {
    estimatedReadTime: '45 seg',
    learningObjective: 'Comprender el aprovisionamiento de instancias EC2 y modelos de pricing.',
    businessScenario: 'Una startup necesita desplegar su API monolithic en una instancia virtual escalable.',
    keyConcept: 'EC2 proporciona capacidad de cómputo segura y redimensionable en la nube.',
    keyTakeaways: [
      'Selecciona el tipo de instancia según vCPU y memoria.',
      'Configura Security Groups como firewall virtual stateful.',
      'Utiliza User Data scripts para bootstrapping automatizado.'
    ]
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    challengeTitle: '101 · Mi primer servidor con EC2',
    briefing: mockBriefing,
    challengeId: 'challenge-101'
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(<BriefingModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('no debe renderizar nada si briefing es null', () => {
    const { container } = render(<BriefingModal {...defaultProps} briefing={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título, tiempo estimado y todas las 4 secciones pedagógicas', () => {
    render(<BriefingModal {...defaultProps} />);

    // Título y badge
    expect(screen.getByText('101 · Mi primer servidor con EC2')).toBeInTheDocument();
    expect(screen.getByText(/45 seg de lectura/i)).toBeInTheDocument();
    expect(screen.getByText(/Micro-Cápsula de Contexto/i)).toBeInTheDocument();

    // 1. Meta de Aprendizaje
    expect(screen.getByText('Meta de Aprendizaje')).toBeInTheDocument();
    expect(screen.getByText(/Comprender el aprovisionamiento de instancias EC2/i)).toBeInTheDocument();

    // 2. Escenario de Negocio Real
    expect(screen.getByText('Escenario de Negocio Real')).toBeInTheDocument();
    expect(screen.getByText(/Una startup necesita desplegar su API monolithic/i)).toBeInTheDocument();

    // 3. Concepto Clave & Principio Cloud
    expect(screen.getByText('Concepto Clave & Principio Cloud')).toBeInTheDocument();
    expect(screen.getByText(/EC2 proporciona capacidad de cómputo segura/i)).toBeInTheDocument();

    // 4. Puntos Clave de Arquitectura (Takeaways)
    expect(screen.getByText('Puntos Clave de Arquitectura')).toBeInTheDocument();
    expect(screen.getByText(/Selecciona el tipo de instancia según vCPU y memoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Configura Security Groups como firewall virtual stateful/i)).toBeInTheDocument();
    expect(screen.getByText(/Utiliza User Data scripts para bootstrapping automatizado/i)).toBeInTheDocument();
  });

  it('debe invocar onClose al hacer clic en el botón de cerrar (X)', () => {
    render(<BriefingModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar briefing/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al hacer clic en el botón CTA "¡Entendido, vamos al Canvas!"', () => {
    render(<BriefingModal {...defaultProps} />);

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe guardar la preferencia en localStorage si se marca el checkbox "No volver a mostrar"', () => {
    render(<BriefingModal {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(localStorage.getItem('awsquest_hide_briefing_challenge-101')).toBe('true');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe remover la preferencia de localStorage si se desmarca el checkbox', () => {
    localStorage.setItem('awsquest_hide_briefing_challenge-101', 'true');

    render(<BriefingModal {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(localStorage.getItem('awsquest_hide_briefing_challenge-101')).toBeNull();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
