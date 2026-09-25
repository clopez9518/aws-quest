import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ScoreGauge } from '../ScoreGauge';

describe('ScoreGauge Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar la puntuación aprobada (>= 70) con badge de éxito', () => {
    render(
      <ScoreGauge
        score={95}
        passed={true}
        earnedXP={95}
        isNewHighScore={true}
      />
    );

    // Avanzar timers para la animación de puntuación
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('de 100 pts')).toBeInTheDocument();
    expect(screen.getByText('¡Desafío Aprobado!')).toBeInTheDocument();
    expect(screen.getByText('+95 XP Ganada')).toBeInTheDocument();
    expect(screen.getByText('¡Nuevo Récord!')).toBeInTheDocument();
  });

  it('debe renderizar estado no aprobado (< 70) sin badge de XP si earnedXP es 0', () => {
    render(
      <ScoreGauge
        score={45}
        passed={false}
        earnedXP={0}
        isNewHighScore={false}
      />
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('No Aprobado (Mínimo 70 pts)')).toBeInTheDocument();
    expect(screen.queryByText(/XP Ganada/i)).not.toBeInTheDocument();
    expect(screen.queryByText('¡Nuevo Récord!')).not.toBeInTheDocument();
  });

  it('debe aplicar clases de color rose cuando el score es menor a 40', () => {
    const { container } = render(
      <ScoreGauge
        score={25}
        passed={false}
        earnedXP={0}
      />
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText('25')).toHaveClass('text-rose-500');
    expect(container.querySelector('.stroke-rose-500')).toBeInTheDocument();
  });
});
