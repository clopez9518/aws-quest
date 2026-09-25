import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HintDrawer } from '../HintDrawer';
import { ChallengeHint } from '../../types/challenge.types';

const mockHints: ChallengeHint[] = [
  {
    orderIndex: 1,
    text: 'Primera pista revelada para orientar el diseño.',
    penaltyPoints: 5,
    isUnlocked: true
  },
  {
    orderIndex: 2,
    text: 'Segunda pista aún bloqueada.',
    penaltyPoints: 10,
    isUnlocked: false
  },
  {
    orderIndex: 3,
    text: 'Tercera pista posterior.',
    penaltyPoints: 15,
    isUnlocked: false
  }
];

describe('HintDrawer Component', () => {
  it('no debe renderizarse cuando isOpen es false', () => {
    const { container } = render(
      <HintDrawer
        isOpen={false}
        onClose={vi.fn()}
        hints={mockHints}
        unlockedCount={1}
        onUnlockHint={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar el texto de pistas desbloqueadas y botón de desbloqueo solo para la siguiente pista', () => {
    render(
      <HintDrawer
        isOpen={true}
        onClose={vi.fn()}
        hints={mockHints}
        unlockedCount={1}
        onUnlockHint={vi.fn()}
      />
    );

    // Pista 1 (desbloqueada) debe exhibir su texto
    expect(
      screen.getByText('Primera pista revelada para orientar el diseño.')
    ).toBeInTheDocument();

    // Pista 2 (siguiente en cola) debe ofrecer botón de desbloqueo con penalización
    expect(
      screen.getByRole('button', { name: /desbloquear pista \(-10 pts\)/i })
    ).toBeInTheDocument();

    // Pista 3 debe indicar que requiere completar las anteriores
    expect(
      screen.getByText(/Completa o desbloquea las pistas anteriores/i)
    ).toBeInTheDocument();
  });

  it('debe abrir el diálogo modal de confirmación antes de desbloquear la pista', () => {
    const onUnlockHintMock = vi.fn();

    render(
      <HintDrawer
        isOpen={true}
        onClose={vi.fn()}
        hints={mockHints}
        unlockedCount={1}
        onUnlockHint={onUnlockHintMock}
      />
    );

    const unlockButton = screen.getByRole('button', {
      name: /desbloquear pista \(-10 pts\)/i
    });
    fireEvent.click(unlockButton);

    // Debe mostrarse el modal de confirmación
    expect(screen.getByText('Desbloquear Pista #2')).toBeInTheDocument();
    expect(
      screen.getByText(/Esta pista te orientará en la selección o interconexión/i)
    ).toBeInTheDocument();

    // Confirmar en el modal
    const confirmButton = screen.getByRole('button', {
      name: /desbloquear \(-10 pts\)/i
    });
    fireEvent.click(confirmButton);

    expect(onUnlockHintMock).toHaveBeenCalledWith(2);
  });
});
