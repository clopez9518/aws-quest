import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('debe renderizar el contenido de texto', () => {
    render(<Badge>Intermedio</Badge>);
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
  });

  it('debe renderizar variantes de dificultad y pilares con clases correctas', () => {
    const { container } = render(
      <Badge variant="security" dot>
        Seguridad
      </Badge>
    );
    expect(screen.getByText('Seguridad')).toBeInTheDocument();
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('debe renderizar icono opcional', () => {
    render(
      <Badge icon={<span data-testid="badge-icon">🛡️</span>}>
        Fiabilidad
      </Badge>
    );
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });
});
