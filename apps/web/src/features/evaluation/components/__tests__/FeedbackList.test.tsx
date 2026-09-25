import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackList } from '../FeedbackList';
import { FeedbackItemDto } from '../../types/evaluation.types';

describe('FeedbackList Component', () => {
  const mockSummary = '¡Excelente arquitectura! Cumple con alta disponibilidad.';

  const mockItems: FeedbackItemDto[] = [
    {
      status: 'pass',
      category: 'serviceSelection',
      title: 'Balanceador de Carga configurado',
      explanation: 'Application Load Balancer distribuye adecuadamente el tráfico.',
      penaltyApplied: 0,
      relatedComponentIds: ['node_1']
    },
    {
      status: 'pass',
      category: 'availability',
      title: 'Redundancia en Base de Datos',
      explanation: 'RDS Multi-AZ garantiza tolerancia a fallos.',
      penaltyApplied: 0,
      relatedComponentIds: ['node_2']
    },
    {
      status: 'fail',
      category: 'security',
      title: 'Base de datos pública',
      explanation: 'La base de datos RDS no debe tener IP pública.',
      penaltyApplied: 15,
      relatedComponentIds: ['node_2']
    },
    {
      status: 'info',
      category: 'hintPenalty',
      title: 'Penalización de Pistas',
      explanation: 'Se descontaron 5 puntos por uso de pista.',
      penaltyApplied: 5,
      relatedComponentIds: []
    }
  ];

  it('debe renderizar el banner de resumen y la lista completa en filtro Todos', () => {
    render(<FeedbackList summary={mockSummary} items={mockItems} />);

    expect(screen.getByText(mockSummary)).toBeInTheDocument();
    expect(screen.getByText('Todos (4)')).toBeInTheDocument();
    expect(screen.getByText('Aciertos (2)')).toBeInTheDocument();
    expect(screen.getByText('Observaciones (1)')).toBeInTheDocument();

    expect(screen.getByText('Balanceador de Carga configurado')).toBeInTheDocument();
    expect(screen.getByText('Redundancia en Base de Datos')).toBeInTheDocument();
    expect(screen.getByText('Base de datos pública')).toBeInTheDocument();
    expect(screen.getByText('-15 pts')).toBeInTheDocument();
  });

  it('debe filtrar exclusivamente los aciertos al hacer clic en la pestaña Aciertos', () => {
    render(<FeedbackList summary={mockSummary} items={mockItems} />);

    const passTabButton = screen.getByText('Aciertos (2)');
    fireEvent.click(passTabButton);

    expect(screen.getByText('Balanceador de Carga configurado')).toBeInTheDocument();
    expect(screen.getByText('Redundancia en Base de Datos')).toBeInTheDocument();
    expect(screen.queryByText('Base de datos pública')).not.toBeInTheDocument();
  });

  it('debe filtrar observaciones y fallos al hacer clic en la pestaña Observaciones', () => {
    render(<FeedbackList summary={mockSummary} items={mockItems} />);

    const issuesTabButton = screen.getByText('Observaciones (1)');
    fireEvent.click(issuesTabButton);

    expect(screen.getByText('Base de datos pública')).toBeInTheDocument();
    expect(screen.queryByText('Balanceador de Carga configurado')).not.toBeInTheDocument();
  });

  it('debe mostrar mensaje amigable si un filtro no contiene elementos', () => {
    const onlyPassItems: FeedbackItemDto[] = [
      {
        status: 'pass',
        category: 'serviceSelection',
        title: 'Solo Aciertos',
        explanation: 'Todo bien.',
        penaltyApplied: 0,
        relatedComponentIds: []
      }
    ];

    render(<FeedbackList summary={mockSummary} items={onlyPassItems} />);

    const issuesTabButton = screen.getByText('Observaciones (0)');
    fireEvent.click(issuesTabButton);

    expect(screen.getByText('No hay elementos en esta categoría.')).toBeInTheDocument();
  });
});
