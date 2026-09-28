import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WavesLearningCards } from '../WavesLearningCards';
import { UnitResponseDto } from '../../types/catalog.types';

describe('WavesLearningCards', () => {
  const mockUnits: UnitResponseDto[] = [
    {
      id: 'u-1',
      title: 'Cómputo Base',
      description: 'EC2 y S3',
      orderIndex: 1,
      challenges: [
        {
          id: 'c-1',
          title: 'Servidor Web',
          difficulty: 'easy',
          mode: 'builder',
          baseXP: 100,
          requiredXP: 0,
          orderIndex: 1,
          isLocked: false,
          lockReason: null,
          userProgress: {
            status: 'completed',
            highScore: 100,
            hintsUsed: 0,
            completedAt: '2026-09-19T20:00:00Z',
          },
        },
      ],
    },
    {
      id: 'u-6',
      title: 'Serverless y Eventos',
      description: 'Lambda y SQS',
      orderIndex: 6,
      challenges: [
        {
          id: 'c-6',
          title: 'Lambda Procesador',
          difficulty: 'intermediate',
          mode: 'builder',
          baseXP: 150,
          requiredXP: 100,
          orderIndex: 1,
          isLocked: false,
          lockReason: null,
          userProgress: null,
        },
      ],
    },
  ];

  it('debe renderizar las 3 olas de aprendizaje técnico', () => {
    const handleSelect = vi.fn();
    render(
      <WavesLearningCards
        units={mockUnits}
        selectedWave={null}
        onSelectWave={handleSelect}
      />
    );

    expect(screen.getByText('Olas de Aprendizaje Técnico')).toBeInTheDocument();
    expect(screen.getByText('OLA 01 • FUNDAMENTOS')).toBeInTheDocument();
    expect(screen.getByText('OLA 02 • DESACOPLADO')).toBeInTheDocument();
    expect(screen.getByText('OLA 03 • EMPRESA')).toBeInTheDocument();
  });

  it('debe llamar a onSelectWave al hacer clic en una ola', () => {
    const handleSelect = vi.fn();
    render(
      <WavesLearningCards
        units={mockUnits}
        selectedWave={null}
        onSelectWave={handleSelect}
      />
    );

    const wave1Btn = screen.getByRole('button', { name: /OLA 01/i });
    fireEvent.click(wave1Btn);

    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
