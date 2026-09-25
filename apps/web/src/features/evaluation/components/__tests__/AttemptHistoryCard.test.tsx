import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttemptHistoryCard } from '../AttemptHistoryCard';
import { ChallengeAttemptHistoryDto } from '../../types/evaluation.types';

describe('AttemptHistoryCard Component', () => {
  const mockAttemptPassed: ChallengeAttemptHistoryDto = {
    id: 'att-1',
    score: 95,
    passed: true,
    hintsUsed: 1,
    createdAt: new Date().toISOString(),
    graphSubmitted: {
      components: [
        { id: 'node-1', serviceCode: 'AWS_ALB', config: {} },
        { id: 'node-2', serviceCode: 'AWS_EC2', config: {} },
        { id: 'node-3', serviceCode: 'AWS_RDS', config: {} }
      ],
      connections: [
        { fromComponentId: 'node-1', toComponentId: 'node-2', connectionType: 'HTTP_HTTPS' },
        { fromComponentId: 'node-2', toComponentId: 'node-3', connectionType: 'DATABASE' }
      ]
    }
  };

  const mockAttemptFailed: ChallengeAttemptHistoryDto = {
    id: 'att-2',
    score: 40,
    passed: false,
    hintsUsed: 0,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    graphSubmitted: {
      components: [{ id: 'node-1', serviceCode: 'AWS_EC2', config: {} }],
      connections: []
    }
  };

  it('debe renderizar un intento aprobado con badge Aprobado, score 95/100 y badge Reciente', () => {
    const onRestoreMock = vi.fn();
    render(
      <AttemptHistoryCard
        attempt={mockAttemptPassed}
        attemptNumber={3}
        isLatest={true}
        onRestore={onRestoreMock}
      />
    );

    expect(screen.getByText('Intento #3')).toBeInTheDocument();
    expect(screen.getByText('Reciente')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('95/100')).toBeInTheDocument();
    expect(screen.getByText('1 pista')).toBeInTheDocument();
    expect(screen.getByText('3 servicios')).toBeInTheDocument();
    expect(screen.getByText('2 conexiones')).toBeInTheDocument();
  });

  it('debe renderizar un intento fallido con badge No Aprobado y sin pistas', () => {
    const onRestoreMock = vi.fn();
    render(
      <AttemptHistoryCard
        attempt={mockAttemptFailed}
        attemptNumber={1}
        isLatest={false}
        onRestore={onRestoreMock}
      />
    );

    expect(screen.getByText('Intento #1')).toBeInTheDocument();
    expect(screen.queryByText('Reciente')).not.toBeInTheDocument();
    expect(screen.getByText('No Aprobado')).toBeInTheDocument();
    expect(screen.getByText('40/100')).toBeInTheDocument();
    expect(screen.getByText('Sin pistas')).toBeInTheDocument();
    expect(screen.getByText('1 servicio')).toBeInTheDocument();
    expect(screen.getByText('0 conexiones')).toBeInTheDocument();
  });

  it('debe disparar callback onRestore al hacer clic en Cargar en Canvas', () => {
    const onRestoreMock = vi.fn();
    render(
      <AttemptHistoryCard
        attempt={mockAttemptPassed}
        attemptNumber={3}
        isLatest={true}
        onRestore={onRestoreMock}
      />
    );

    const restoreButton = screen.getByRole('button', {
      name: /Cargar intento número 3/i
    });
    fireEvent.click(restoreButton);

    expect(onRestoreMock).toHaveBeenCalledTimes(1);
    expect(onRestoreMock).toHaveBeenCalledWith(mockAttemptPassed);
  });
});
