import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { XpProgressBar } from '../XpProgressBar';

describe('XpProgressBar', () => {
  it('debe renderizar el nivel y el XP actual correctamente para 0 XP', () => {
    render(<XpProgressBar totalXp={0} />);

    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.getByText('0/150 XP')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('debe calcular el progreso porcentual y ancho de la barra para 75 XP (50%)', () => {
    render(<XpProgressBar totalXp={75} />);

    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.getByText('75/150 XP')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveStyle({ width: '50%' });
  });

  it('debe calcular Nivel 2 para 225 XP (75 XP en el nivel actual)', () => {
    render(<XpProgressBar totalXp={225} />);

    expect(screen.getByText('Nivel 2')).toBeInTheDocument();
    expect(screen.getByText('75/150 XP')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('debe mostrar la píldora flotante (+XP) cuando se incrementa el totalXp', () => {
    const { rerender } = render(<XpProgressBar totalXp={50} />);

    expect(screen.queryByTestId('xp-floating-delta')).not.toBeInTheDocument();

    act(() => {
      rerender(<XpProgressBar totalXp={120} />);
    });

    const floatingDelta = screen.getByTestId('xp-floating-delta');
    expect(floatingDelta).toBeInTheDocument();
    expect(floatingDelta).toHaveTextContent('+70 XP');
  });
});
