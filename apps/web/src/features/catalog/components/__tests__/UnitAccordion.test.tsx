import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnitAccordion } from '../UnitAccordion';
import { UnitResponseDto } from '../../types/catalog.types';

describe('UnitAccordion', () => {
  const mockUnit: UnitResponseDto = {
    id: 'u-1',
    title: 'Cómputo y Escalabilidad',
    description: 'Aprende sobre EC2 y balanceo de carga.',
    orderIndex: 1,
    challenges: [
      {
        id: 'c-1',
        title: 'Servidor EC2',
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
      {
        id: 'c-2',
        title: 'ALB Redundante',
        difficulty: 'intermediate',
        mode: 'builder',
        baseXP: 150,
        requiredXP: 100,
        orderIndex: 2,
        isLocked: false,
        lockReason: null,
        userProgress: null,
      },
    ],
  };

  it('debe renderizar el título de la unidad, descripción y métrica de avance (1 de 2)', () => {
    render(
      <MemoryRouter>
        <UnitAccordion unit={mockUnit} defaultExpanded={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Unidad 1')).toBeInTheDocument();
    expect(screen.getByText('Cómputo y Escalabilidad')).toBeInTheDocument();
    expect(screen.getByText('Aprende sobre EC2 y balanceo de carga.')).toBeInTheDocument();
    expect(screen.getByText('1 de 2 Desafíos')).toBeInTheDocument();
    expect(screen.getByText('Servidor EC2')).toBeInTheDocument();
    expect(screen.getByText('ALB Redundante')).toBeInTheDocument();
  });

  it('debe colapsar y expandir los desafíos al hacer clic en la cabecera', () => {
    render(
      <MemoryRouter>
        <UnitAccordion unit={mockUnit} defaultExpanded={true} />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /Unidad 1/i });
    expect(screen.getByText('Servidor EC2')).toBeInTheDocument();

    // Colapsar
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Servidor EC2')).not.toBeInTheDocument();

    // Expandir
    fireEvent.click(toggleButton);
    expect(screen.getByText('Servidor EC2')).toBeInTheDocument();
  });
});
