import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('debe renderizar el texto del botón correctamente', () => {
    render(<Button>Comenzar Desafío</Button>);
    expect(screen.getByRole('button', { name: /comenzar desafío/i })).toBeInTheDocument();
  });

  it('debe ejecutar el callback onClick al hacer clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Enviar</Button>);
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no debe ejecutar onClick si está deshabilitado', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Deshabilitado</Button>);
    const button = screen.getByRole('button', { name: /deshabilitado/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('debe renderizar el spinner y deshabilitarse cuando isLoading es true', () => {
    render(<Button isLoading>Cargando datos</Button>);
    const button = screen.getByRole('button', { name: /cargando datos/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('debe renderizar iconos a la izquierda y derecha', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Navegar
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
