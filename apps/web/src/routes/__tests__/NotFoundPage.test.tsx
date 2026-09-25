import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from '../NotFoundPage';
import { MemoryRouter } from 'react-router-dom';

describe('NotFoundPage', () => {
  it('debe renderizar el título 404 y el botón para volver al catálogo', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Ruta no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver al Catálogo/i })).toBeInTheDocument();
  });
});
