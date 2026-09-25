import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvaluationModal } from '../EvaluationModal';
import { EvaluateArchitectureResponseDto } from '../../types/evaluation.types';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('EvaluationModal Component', () => {
  const mockResultPassed: EvaluateArchitectureResponseDto = {
    score: 95,
    passed: true,
    isNewHighScore: true,
    earnedXP: 95,
    currentUserXP: 250,
    currentUserLevel: 2,
    feedback: {
      summary: 'Arquitectura validada.',
      items: [
        {
          status: 'pass',
          category: 'serviceSelection',
          title: 'Servicio Correcto',
          explanation: 'ALB es el balanceador adecuado',
          penaltyApplied: 0,
          relatedComponentIds: ['node_1']
        }
      ]
    },
    attemptId: 'att-123'
  };

  const mockResultFailed: EvaluateArchitectureResponseDto = {
    score: 40,
    passed: false,
    isNewHighScore: false,
    earnedXP: 0,
    currentUserXP: 155,
    currentUserLevel: 2,
    feedback: {
      summary: 'Faltan componentes.',
      items: [
        {
          status: 'fail',
          category: 'availability',
          title: 'Falta Multi-AZ',
          explanation: 'Se requiere redundancia',
          penaltyApplied: 30,
          relatedComponentIds: ['node_2']
        }
      ]
    },
    attemptId: 'att-124'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        name: 'Invitado',
        email: 'guest@awsquest.com',
        isGuest: false,
        totalXP: 100,
        level: 1
      },
      accessToken: 'token-123',
      isInitialized: true,
      isLoading: false
    });
  });

  it('no debe renderizar nada si isOpen es false o result es null', () => {
    const { container } = render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={false}
          onClose={vi.fn()}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
        />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el modal completo con título, ScoreGauge y FeedbackList cuando está abierto y aprobado', () => {
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
          nextChallengeId="c-next-uuid"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Servidor Web con HA')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico de Arquitectura')).toBeInTheDocument();
    expect(screen.getByText('Servicio Correcto')).toBeInTheDocument();
    expect(screen.getByText('Reintentar solución')).toBeInTheDocument();
    expect(screen.getByText('Siguiente Desafío')).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer clic en el botón X', () => {
    const onCloseMock = vi.fn();
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={onCloseMock}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
        />
      </MemoryRouter>
    );

    const closeButton = screen.getByLabelText('Cerrar modal de evaluación');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe cerrar el modal al presionar la tecla Escape', () => {
    const onCloseMock = vi.fn();
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={onCloseMock}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
        />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe ejecutar onRetry al hacer clic en Reintentar solución', () => {
    const onRetryMock = vi.fn();
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          onRetry={onRetryMock}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
        />
      </MemoryRouter>
    );

    const retryButton = screen.getByText('Reintentar solución');
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('debe navegar al siguiente desafío al hacer clic en Siguiente Desafío', () => {
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
          nextChallengeId="c-next-uuid"
        />
      </MemoryRouter>
    );

    const nextButton = screen.getByText('Siguiente Desafío');
    fireEvent.click(nextButton);

    expect(mockNavigate).toHaveBeenCalledWith('/challenges/c-next-uuid');
  });

  it('debe mostrar botón Explorar Catálogo si no fue aprobado', () => {
    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          result={mockResultFailed}
          challengeTitle="Servidor Web con HA"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Explorar Catálogo')).toBeInTheDocument();
    expect(screen.queryByText('Siguiente Desafío')).not.toBeInTheDocument();

    const catalogButton = screen.getByText('Explorar Catálogo');
    fireEvent.click(catalogButton);

    expect(mockNavigate).toHaveBeenCalledWith('/catalog');
  });

  it('debe renderizar GuestProgressBanner si el usuario es invitado y se proporciona onRegisterClick', () => {
    useAuthStore.setState({
      user: {
        id: 'guest-1',
        name: 'Invitado',
        email: 'guest@awsquest.com',
        isGuest: true,
        totalXP: 95,
        level: 1
      },
      accessToken: 'token-guest',
      isInitialized: true,
      isLoading: false
    });

    const onRegisterMock = vi.fn();

    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
          onRegisterClick={onRegisterMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('guest-progress-banner')).toBeInTheDocument();
    const registerBtn = screen.getByRole('button', { name: /Crear cuenta y migrar XP/i });
    fireEvent.click(registerBtn);
    expect(onRegisterMock).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar ActiveLearningPromptCard cuando passed es true y existe reflectionPrompt', () => {
    const mockPrompt = {
      question: '¿Por qué desacoplar con SQS?',
      pillar: 'Reliability' as const,
      bonusXP: 25,
      options: [
        { id: 'o1', text: 'Para absorber picos de tráfico' }
      ]
    };

    render(
      <MemoryRouter>
        <EvaluationModal
          isOpen={true}
          onClose={vi.fn()}
          result={mockResultPassed}
          challengeTitle="Servidor Web con HA"
          challengeId="challenge-601"
          reflectionPrompt={mockPrompt}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('active-learning-prompt-card')).toBeInTheDocument();
    expect(screen.getByText('¿Por qué desacoplar con SQS?')).toBeInTheDocument();
  });
});
