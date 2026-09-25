import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelUpModal } from '../LevelUpModal';

describe('LevelUpModal', () => {
  it('no debe renderizar nada cuando isOpen es false', () => {
    render(
      <LevelUpModal
        isOpen={false}
        onClose={vi.fn()}
        newLevel={2}
        totalXp={235}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizar el nivel, título y experiencia cuando isOpen es true', () => {
    render(
      <LevelUpModal
        isOpen={true}
        onClose={vi.fn()}
        newLevel={2}
        totalXp={235}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¡Subiste de Nivel!')).toBeInTheDocument();
    expect(screen.getByText('Nivel 2')).toBeInTheDocument();
    expect(screen.getByText('Cloud Practitioner Apprentice')).toBeInTheDocument();
    expect(screen.getByText(/235 XP/)).toBeInTheDocument();
  });

  it('debe invocar onClose al hacer clic en el botón de continuar', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={3}
        totalXp={450}
      />
    );

    const continueBtn = screen.getByRole('button', { name: /¡Continuar construyendo!/i });
    fireEvent.click(continueBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(
      <LevelUpModal
        isOpen={true}
        onClose={handleClose}
        newLevel={2}
        totalXp={200}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
