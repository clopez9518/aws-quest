import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CatalogFiltersToolbar } from '../CatalogFiltersToolbar';

describe('CatalogFiltersToolbar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    typeFilter: 'all' as const,
    onTypeFilterChange: vi.fn(),
    difficultyFilter: 'all' as const,
    onDifficultyFilterChange: vi.fn(),
    totalCounts: {
      all: 49,
      builder: 32,
      fix: 17,
    },
  };

  it('debe renderizar los inputs y filtros con sus respectivos contadores', () => {
    render(<CatalogFiltersToolbar {...defaultProps} />);

    expect(screen.getByPlaceholderText(/Buscar por servicio/i)).toBeInTheDocument();
    expect(screen.getByText('Todos (49)')).toBeInTheDocument();
    expect(screen.getByText('Builder (32)')).toBeInTheDocument();
    expect(screen.getByText('Fix Incidentes (17)')).toBeInTheDocument();
    expect(screen.getByText('Todas')).toBeInTheDocument();
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.getByText('Medio')).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();
    expect(screen.getByText('Capstone')).toBeInTheDocument();
  });

  it('debe disparar onSearchChange cuando el usuario escribe en el buscador', () => {
    const onSearchChange = vi.fn();
    render(<CatalogFiltersToolbar {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText(/Buscar por servicio/i);
    fireEvent.change(input, { target: { value: 'Lambda' } });

    expect(onSearchChange).toHaveBeenCalledWith('Lambda');
  });

  it('debe disparar onTypeFilterChange al cambiar el tipo de desafío', () => {
    const onTypeFilterChange = vi.fn();
    render(<CatalogFiltersToolbar {...defaultProps} onTypeFilterChange={onTypeFilterChange} />);

    const fixBtn = screen.getByText('Fix Incidentes (17)');
    fireEvent.click(fixBtn);

    expect(onTypeFilterChange).toHaveBeenCalledWith('fix');
  });

  it('debe disparar onDifficultyFilterChange al cambiar la dificultad', () => {
    const onDifficultyFilterChange = vi.fn();
    render(<CatalogFiltersToolbar {...defaultProps} onDifficultyFilterChange={onDifficultyFilterChange} />);

    const hardBtn = screen.getByText('Difícil');
    fireEvent.click(hardBtn);

    expect(onDifficultyFilterChange).toHaveBeenCalledWith('hard');
  });
});
