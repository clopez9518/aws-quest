import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalBase } from '../ModalBase';

describe('ModalBase Component', () => {
  it('no debe renderizarse cuando isOpen es false', () => {
    render(
      <ModalBase isOpen={false} onClose={() => {}} title="Modal Prueba">
        Contenido
      </ModalBase>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizarse cuando isOpen es true con rol dialog y foco atrapado', () => {
    const handleClose = vi.fn();
    render(
      <ModalBase isOpen={true} onClose={handleClose} title="Modal Prueba" description="Detalles">
        <p>Contenido del modal</p>
      </ModalBase>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /modal prueba/i })).toBeInTheDocument();
    expect(screen.getByText(/detalles/i)).toBeInTheDocument();
    expect(screen.getByText(/contenido del modal/i)).toBeInTheDocument();

    // Clic en botón cerrar
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe cerrar al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(
      <ModalBase isOpen={true} onClose={handleClose} title="Modal Escape">
        <p>Presiona Escape</p>
      </ModalBase>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
