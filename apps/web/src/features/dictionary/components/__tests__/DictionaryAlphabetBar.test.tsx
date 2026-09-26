import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DictionaryAlphabetBar } from '../DictionaryAlphabetBar';

describe('DictionaryAlphabetBar Component', () => {
  const mockAvailableLetters = new Set(['A', 'E', 'S']);
  const defaultProps = {
    selectedLetter: null,
    onSelectLetter: vi.fn(),
    availableLetters: mockAvailableLetters,
  };

  it('debe renderizar el botón "Todas" y las 26 letras del abecedario', () => {
    render(<DictionaryAlphabetBar {...defaultProps} />);

    expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument();
    // 'A', 'B', ... 'Z'
    expect(screen.getByRole('button', { name: /Filtrar por letra A/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filtrar por letra Z/i })).toBeInTheDocument();
  });

  it('debe deshabilitar las letras que no están en availableLetters', () => {
    render(<DictionaryAlphabetBar {...defaultProps} />);

    const buttonA = screen.getByRole('button', { name: /Filtrar por letra A/i });
    const buttonB = screen.getByRole('button', { name: /Filtrar por letra B/i });

    expect(buttonA).not.toBeDisabled();
    expect(buttonB).toBeDisabled();
  });

  it('debe invocar onSelectLetter con la letra seleccionada al hacer clic', () => {
    const onSelectLetter = vi.fn();
    render(<DictionaryAlphabetBar {...defaultProps} onSelectLetter={onSelectLetter} />);

    const buttonE = screen.getByRole('button', { name: /Filtrar por letra E/i });
    fireEvent.click(buttonE);

    expect(onSelectLetter).toHaveBeenCalledWith('E');
  });

  it('al hacer clic en "Todas" debe invocar onSelectLetter con null', () => {
    const onSelectLetter = vi.fn();
    render(<DictionaryAlphabetBar {...defaultProps} selectedLetter="A" onSelectLetter={onSelectLetter} />);

    const buttonTodas = screen.getByRole('button', { name: /todas/i });
    fireEvent.click(buttonTodas);

    expect(onSelectLetter).toHaveBeenCalledWith(null);
  });
});
