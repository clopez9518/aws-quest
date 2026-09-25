import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActiveLearningPromptCard } from '../ActiveLearningPromptCard';
import { ChallengeReflectionPromptDto, SubmitReflectionAnswerResponseDto } from '../../types/challenge.types';
import * as challengeApi from '../../api/challengeApi';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';

describe('ActiveLearningPromptCard Component', () => {
  const mockPrompt: ChallengeReflectionPromptDto = {
    question: '¿Por qué es fundamental desacoplar servidores web con S3?',
    pillar: 'Reliability',
    bonusXP: 25,
    options: [
      {
        id: 'opt-a',
        text: 'Porque EBS tiene un límite rígido de 500 MB.'
      },
      {
        id: 'opt-b',
        text: 'Porque mantiene los servidores stateless y otorga 11 nueves de durabilidad.'
      }
    ]
  };

  const mockSuccessResponse: SubmitReflectionAnswerResponseDto = {
    isCorrect: true,
    bonusXpEarned: 25,
    explanation: '¡Exacto! El almacenamiento stateless previene pérdida de datos.',
    correctOptionId: 'opt-b',
    currentUserXP: 175,
    currentUserLevel: 2,
    allExplanations: [
      {
        id: 'opt-a',
        isCorrect: false,
        explanation: 'Incorrecto. EBS soporta hasta 64 TB.'
      },
      {
        id: 'opt-b',
        isCorrect: true,
        explanation: '¡Exacto! El almacenamiento stateless previene pérdida de datos.'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'tester@awsquest.io',
        displayName: 'Cloud Tester',
        totalXP: 150,
        level: 1,
        isGuest: false,
        createdAt: new Date().toISOString()
      },
      accessToken: 'test-token',
      isInitialized: true,
      isLoading: false
    });
  });

  it('debe renderizar la pregunta, el pilar de Well-Architected y el badge de Bonus XP', () => {
    render(
      <ActiveLearningPromptCard
        challengeId="challenge-104"
        prompt={mockPrompt}
      />
    );

    expect(screen.getByText('¿Por qué es fundamental desacoplar servidores web con S3?')).toBeInTheDocument();
    expect(screen.getByText(/Pilar: Fiabilidad/i)).toBeInTheDocument();
    expect(screen.getByText('+25 Bonus XP')).toBeInTheDocument();
    expect(screen.getByText('Porque EBS tiene un límite rígido de 500 MB.')).toBeInTheDocument();
    expect(screen.getByText('Porque mantiene los servidores stateless y otorga 11 nueves de durabilidad.')).toBeInTheDocument();
  });

  it('debe deshabilitar el botón de envío hasta que se seleccione una opción', () => {
    render(
      <ActiveLearningPromptCard
        challengeId="challenge-104"
        prompt={mockPrompt}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Confirmar Respuesta/i });
    expect(submitBtn).toBeDisabled();

    // Seleccionar opción
    const radioOptionB = screen.getByDisplayValue('opt-b');
    fireEvent.click(radioOptionB);

    expect(radioOptionB).toBeChecked();
    expect(submitBtn).not.toBeDisabled();
  });

  it('debe enviar la respuesta al hacer clic en Confirmar Respuesta y mostrar la retroalimentación formativa', async () => {
    const submitSpy = vi.spyOn(challengeApi, 'submitReflectionAnswer').mockResolvedValue(mockSuccessResponse);
    const onAnswerSubmittedMock = vi.fn();

    render(
      <ActiveLearningPromptCard
        challengeId="challenge-104"
        prompt={mockPrompt}
        onAnswerSubmitted={onAnswerSubmittedMock}
      />
    );

    const radioOptionB = screen.getByDisplayValue('opt-b');
    fireEvent.click(radioOptionB);

    const submitBtn = screen.getByRole('button', { name: /Confirmar Respuesta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith('challenge-104', 'opt-b');
    });

    await waitFor(() => {
      expect(screen.getByText(/¡Excelente razonamiento! \+25 XP añadidos a tu perfil\./i)).toBeInTheDocument();
      expect(screen.getByText('¡Exacto! El almacenamiento stateless previene pérdida de datos.')).toBeInTheDocument();
    });

    // Validar que se actualizó useAuthStore
    expect(useAuthStore.getState().user?.totalXP).toBe(175);
    expect(useAuthStore.getState().user?.level).toBe(2);
    expect(onAnswerSubmittedMock).toHaveBeenCalledWith(mockSuccessResponse);
  });
});
