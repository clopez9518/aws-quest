import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChallengeContextModal } from '../ChallengeContextModal';
import { ChallengeBriefingDto, ArchitectureRequirement } from '../../types/challenge.types';
import { useDictionaryStore } from '../../../dictionary/stores/useDictionaryStore';

describe('ChallengeContextModal Component', () => {
  const mockBriefing: ChallengeBriefingDto = {
    estimatedReadTime: '45 seg',
    learningObjective: 'Comprender el aprovisionamiento de instancias EC2 y modelos de pricing.',
    businessScenario: 'Una startup necesita desplegar su API monolithic en una instancia virtual escalable.',
    keyConcept: 'EC2 proporciona capacidad de cómputo segura y redimensionable en la nube.',
    keyTakeaways: [
      'Selecciona el tipo de instancia según vCPU y memoria.',
      'Configura Security Groups como firewall virtual stateful.'
    ],
    keyComponents: [
      {
        title: 'Amazon EC2',
        description: 'Capacidad de cómputo elástica en la nube.',
        serviceCode: 'AWS_EC2',
        category: 'service'
      }
    ]
  };

  const mockRequirements: ArchitectureRequirement[] = [
    {
      id: 'req-1',
      type: 'required_service',
      title: 'Instancia EC2 en Subred Pública',
      description: 'El servidor web debe poder recibir tráfico directo.'
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    challengeTitle: '101 · Mi primer servidor con EC2',
    challengeId: 'challenge-101',
    description: 'TechCorp necesita desplegar su primer portal web en AWS.',
    mode: 'builder' as const,
    difficulty: 'easy' as const,
    briefing: mockBriefing,
    requirements: mockRequirements,
    allowedServices: [
      {
        code: 'AWS_EC2',
        name: 'Amazon EC2',
        category: 'Compute'
      }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(<ChallengeContextModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar la pestaña de Caso de Negocio por defecto al abrirse', () => {
    render(<ChallengeContextModal {...defaultProps} />);

    // Selector de pestañas visible
    expect(screen.getByTestId('modal-tab-business-case')).toBeInTheDocument();
    expect(screen.getByTestId('modal-tab-briefing')).toBeInTheDocument();

    // Contenido del Caso de Negocio presente
    expect(screen.getByText('Planteamiento y Necesidad del Cliente')).toBeInTheDocument();
    expect(screen.getByText('TechCorp necesita desplegar su primer portal web en AWS.')).toBeInTheDocument();
    expect(screen.getByText('Instancia EC2 en Subred Pública')).toBeInTheDocument();

    // Botón de acceso rápido al Briefing dentro de la pestaña Caso de Negocio
    expect(screen.getByText(/¿Deseas repasar los conceptos clave/i)).toBeInTheDocument();
  });

  it('debe alternar a la pestaña de Briefing Técnico al hacer clic en el tab de Briefing', () => {
    render(<ChallengeContextModal {...defaultProps} />);

    const briefingTab = screen.getByTestId('modal-tab-briefing');
    fireEvent.click(briefingTab);

    // Contenido del Briefing presente
    expect(screen.getByText('Meta de Aprendizaje')).toBeInTheDocument();
    expect(screen.getByText(/Comprender el aprovisionamiento de instancias EC2/i)).toBeInTheDocument();
    expect(screen.getByText('Concepto Clave & Principio Cloud')).toBeInTheDocument();
    expect(screen.getByText('Puntos Clave de Arquitectura')).toBeInTheDocument();

    // Botón de retorno al Caso de Negocio presente
    expect(screen.getByRole('button', { name: /← Caso de Negocio/i })).toBeInTheDocument();
  });

  it('debe alternar a la pestaña de Briefing Técnico usando el botón del banner dentro del Caso de Negocio', () => {
    render(<ChallengeContextModal {...defaultProps} />);

    const bannerBtn = screen.getByRole('button', { name: /Ver Briefing/i });
    fireEvent.click(bannerBtn);

    expect(screen.getByText('Meta de Aprendizaje')).toBeInTheDocument();
  });

  it('debe permitir regresar a Caso de Negocio desde el Briefing', () => {
    render(<ChallengeContextModal {...defaultProps} initialTab="briefing" />);

    expect(screen.getByText('Meta de Aprendizaje')).toBeInTheDocument();

    const returnBtn = screen.getByRole('button', { name: /← Caso de Negocio/i });
    fireEvent.click(returnBtn);

    expect(screen.getByText('Planteamiento y Necesidad del Cliente')).toBeInTheDocument();
  });

  it('debe invocar onClose al pulsar el botón X', () => {
    const onClose = vi.fn();
    render(<ChallengeContextModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByTestId('close-challenge-context-modal');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe guardar la preferencia en localStorage al marcar el checkbox No volver a mostrar', () => {
    render(<ChallengeContextModal {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(localStorage.getItem('awsquest_hide_briefing_challenge-101')).toBe('true');
  });

  it('debe interactuar con el diccionario al abrir conceptos clave en la pestaña de Briefing', () => {
    const openDrawerSpy = vi.fn();
    vi.spyOn(useDictionaryStore.getState(), 'openDrawer').mockImplementation(openDrawerSpy);

    render(<ChallengeContextModal {...defaultProps} initialTab="briefing" />);

    // Desplegar conceptos clave
    const toggleBtn = screen.getByTestId('briefing-key-components-toggle');
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();

    const dictBtn = screen.getByRole('button', { name: /Ver Amazon EC2 en el glosario/i });
    fireEvent.click(dictBtn);

    expect(openDrawerSpy).toHaveBeenCalled();
  });
});
