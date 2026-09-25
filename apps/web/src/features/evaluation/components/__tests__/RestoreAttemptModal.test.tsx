import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestoreAttemptModal } from '../RestoreAttemptModal';

describe('RestoreAttemptModal Component', () => {
  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <RestoreAttemptModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        attemptNumber={2}
        attemptScore={95}
        currentNodesCount={3}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título, puntuación y mensaje de advertencia cuando isOpen es true', () => {
    render(
      <RestoreAttemptModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        attemptNumber={2}
        attemptScore={95}
        currentNodesCount={3}
      />
    );

    expect(screen.getByText('¿Cargar Intento #2?')).toBeInTheDocument();
    expect(screen.getByText('95/100 pts')).toBeInTheDocument();
    expect(
      screen.getByText(/Al cargar este intento previo, se/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3 servicios/i)).toBeInTheDocument();
  });

  it('debe ejecutar onConfirm y onClose al presionar Reemplazar y Cargar', () => {
    const onConfirmMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <RestoreAttemptModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={onConfirmMock}
        attemptNumber={2}
        attemptScore={95}
        currentNodesCount={3}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Reemplazar y Cargar/i });
    fireEvent.click(confirmBtn);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe ejecutar onClose al presionar Cancelar o el botón de cerrar', () => {
    const onCloseMock = vi.fn();

    render(
      <RestoreAttemptModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
        attemptNumber={2}
        attemptScore={95}
        currentNodesCount={3}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(cancelBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('debe responder a la tecla Escape para cerrar', () => {
    const onCloseMock = vi.fn();

    render(
      <RestoreAttemptModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
        attemptNumber={2}
        attemptScore={95}
        currentNodesCount={3}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
