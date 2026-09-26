import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DictionaryPillarsFilter } from '../DictionaryPillarsFilter';
import { WellArchitectedPillar } from '../../types/dictionary.types';

describe('DictionaryPillarsFilter Component', () => {
  it('debe renderizar la cabecera y los 6 pilares de Well-Architected Framework', () => {
    const handleSelectPillar = vi.fn();
    render(
      <DictionaryPillarsFilter
        selectedPillar={null}
        onSelectPillar={handleSelectPillar}
      />
    );

    expect(screen.getByText(/Pilares WAF:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seguridad/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fiabilidad/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rendimiento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Costos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Op\. Excellence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sostenibilidad/i })).toBeInTheDocument();
  });

  it('debe marcar aria-pressed="true" en el pilar seleccionado', () => {
    const handleSelectPillar = vi.fn();
    render(
      <DictionaryPillarsFilter
        selectedPillar="CostOptimization"
        onSelectPillar={handleSelectPillar}
      />
    );

    const costBtn = screen.getByRole('button', { name: /Costos/i });
    const securityBtn = screen.getByRole('button', { name: /Seguridad/i });

    expect(costBtn).toHaveAttribute('aria-pressed', 'true');
    expect(securityBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe invocar onSelectPillar con la clave del pilar al hacer clic', () => {
    const handleSelectPillar = vi.fn();
    render(
      <DictionaryPillarsFilter
        selectedPillar={null}
        onSelectPillar={handleSelectPillar}
      />
    );

    const securityBtn = screen.getByRole('button', { name: /Seguridad/i });
    fireEvent.click(securityBtn);

    expect(handleSelectPillar).toHaveBeenCalledWith('Security');
  });

  it('debe deseleccionar (enviar null) al hacer clic en un pilar que ya estaba activo', () => {
    const handleSelectPillar = vi.fn();
    render(
      <DictionaryPillarsFilter
        selectedPillar="Security"
        onSelectPillar={handleSelectPillar}
      />
    );

    const securityBtn = screen.getByRole('button', { name: /Seguridad/i });
    fireEvent.click(securityBtn);

    expect(handleSelectPillar).toHaveBeenCalledWith(null);
  });

  it('debe ser insensible a mayúsculas/minúsculas o formato al verificar selección (ej. costOptimization camelCase)', () => {
    const handleSelectPillar = vi.fn();
    render(
      <DictionaryPillarsFilter
        selectedPillar={'costOptimization' as WellArchitectedPillar}
        onSelectPillar={handleSelectPillar}
      />
    );

    const costBtn = screen.getByRole('button', { name: /Costos/i });
    expect(costBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
