import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFocusTrap } from '../../shared/hooks/useFocusTrap';

function ModalMockComponent({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="test-modal-title">
      <div ref={modalRef} data-testid="test-modal-container">
        <h2 id="test-modal-title">Título Accesible</h2>
        <button type="button" data-testid="button-first">Primer Botón</button>
        <input type="text" data-testid="input-middle" placeholder="Campo de texto" />
        <button type="button" data-testid="button-last" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

describe('Auditoría de Accesibilidad: useFocusTrap y Navegación por Teclado (WCAG 2.1.2)', () => {
  it('atrapa la navegación por teclado (Tab y Shift+Tab) ciclando dentro del modal', () => {
    const handleClose = vi.fn();
    render(<ModalMockComponent isOpen={true} onClose={handleClose} />);

    const firstBtn = screen.getByTestId('button-first');
    expect(screen.getByTestId('input-middle')).toBeInTheDocument();
    const lastBtn = screen.getByTestId('button-last');

    // Al abrirse, el primer elemento interactivo debe recibir foco automáticamente
    expect(document.activeElement).toBe(firstBtn);

    // Tab desde el último elemento debe ciclar de regreso al primer elemento
    lastBtn.focus();
    expect(document.activeElement).toBe(lastBtn);

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(firstBtn);

    // Shift + Tab desde el primer elemento debe ciclar al último elemento
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastBtn);
  });

  it('cierra el modal cuando el usuario presiona la tecla Escape', () => {
    const handleClose = vi.fn();
    render(<ModalMockComponent isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
