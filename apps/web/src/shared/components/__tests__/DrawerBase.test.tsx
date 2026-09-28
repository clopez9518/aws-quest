import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DrawerBase } from '../DrawerBase';

describe('DrawerBase Component', () => {
  it('no debe renderizarse cuando isOpen es false', () => {
    render(
      <DrawerBase isOpen={false} onClose={() => {}} title="Drawer Prueba">
        Contenido
      </DrawerBase>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizarse cuando isOpen es true con rol dialog y controles accesibles', () => {
    const handleClose = vi.fn();
    render(
      <DrawerBase isOpen={true} onClose={handleClose} title="Ficha Técnica" description="Detalles del término">
        <p>Cuerpo del drawer</p>
      </DrawerBase>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ficha técnica/i })).toBeInTheDocument();
    expect(screen.getByText(/detalles del término/i)).toBeInTheDocument();
    expect(screen.getByText(/cuerpo del drawer/i)).toBeInTheDocument();

    // Clic en botón cerrar
    fireEvent.click(screen.getByLabelText(/cerrar panel lateral/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe cerrar al presionar la tecla Escape', () => {
    const handleClose = vi.fn();
    render(
      <DrawerBase isOpen={true} onClose={handleClose} title="Drawer Escape">
        <p>Presiona Escape</p>
      </DrawerBase>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
