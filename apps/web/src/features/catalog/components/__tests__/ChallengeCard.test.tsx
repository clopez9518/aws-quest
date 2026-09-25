import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChallengeCard } from '../ChallengeCard';
import { CatalogChallengeDto } from '../../types/catalog.types';

describe('ChallengeCard', () => {
  it('debe renderizar un desafío abierto con dificultad, XP y enlace activo', () => {
    const mockChallenge: CatalogChallengeDto = {
      id: 'c-101',
      title: 'Servidor Web Básico',
      difficulty: 'easy',
      mode: 'builder',
      baseXP: 100,
      requiredXP: 0,
      orderIndex: 1,
      isLocked: false,
      lockReason: null,
      userProgress: null,
    };

    render(
      <MemoryRouter>
        <ChallengeCard challenge={mockChallenge} />
      </MemoryRouter>
    );

    expect(screen.getByText('Servidor Web Básico')).toBeInTheDocument();
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.getByText('+100 XP')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Iniciar Desafío/i });
    expect(link).toHaveAttribute('href', '/challenges/c-101');
  });

  it('debe renderizar un desafío bloqueado con motivo de bloqueo y botón deshabilitado', () => {
    const mockLockedChallenge: CatalogChallengeDto = {
      id: 'c-102',
      title: 'Alta Disponibilidad con ALB',
      difficulty: 'intermediate',
      mode: 'builder',
      baseXP: 150,
      requiredXP: 100,
      orderIndex: 2,
      isLocked: true,
      lockReason: 'Requiere completar el desafío previo',
      userProgress: null,
    };

    render(
      <MemoryRouter>
        <ChallengeCard challenge={mockLockedChallenge} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alta Disponibilidad con ALB')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText('Requiere completar el desafío previo')).toBeInTheDocument();

    const disabledBtn = screen.getByRole('button', { name: /Bloqueado/i });
    expect(disabledBtn).toBeDisabled();
  });

  it('debe renderizar el badge de completado y la puntuación obtenida', () => {
    const mockCompletedChallenge: CatalogChallengeDto = {
      id: 'c-103',
      title: 'Base de Datos RDS Multi-AZ',
      difficulty: 'hard',
      mode: 'builder',
      baseXP: 200,
      requiredXP: 250,
      orderIndex: 3,
      isLocked: false,
      lockReason: null,
      userProgress: {
        status: 'completed',
        highScore: 95,
        hintsUsed: 1,
        completedAt: '2026-09-19T20:00:00Z',
      },
    };

    render(
      <MemoryRouter>
        <ChallengeCard challenge={mockCompletedChallenge} />
      </MemoryRouter>
    );

    expect(screen.getByText('Completado')).toBeInTheDocument();
    expect(screen.getByText(/95\/100 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/(1 pista)/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mejorar Puntaje/i })).toBeInTheDocument();
  });
});
