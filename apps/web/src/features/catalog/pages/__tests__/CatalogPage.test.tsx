import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CatalogPage } from '../CatalogPage';
import * as useUnitsHook from '../../hooks/useUnits';
import * as useSystemConfigHook from '../../hooks/useSystemConfig';
import { UnitResponseDto } from '../../types/catalog.types';

vi.mock('../../hooks/useUnits');
vi.mock('../../hooks/useSystemConfig');

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el esqueleto de carga cuando isLoading es true', () => {
    vi.mocked(useUnitsHook.useUnits).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSystemConfigHook.useSystemConfig).mockReturnValue({
      config: undefined,
      accessMode: 'openAccess',
      isLoading: false,
      isError: false,
      error: null,
      updateAccessMode: vi.fn(),
      isUpdating: false,
    });

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Cargando catálogo...')).toBeInTheDocument();
  });

  it('debe renderizar el estado de error y botón de reintento al fallar la consulta', () => {
    const mockRefetch = vi.fn();

    vi.mocked(useUnitsHook.useUnits).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Fallo en el servidor al cargar unidades'),
      refetch: mockRefetch,
    } as any);

    vi.mocked(useSystemConfigHook.useSystemConfig).mockReturnValue({
      config: undefined,
      accessMode: 'openAccess',
      isLoading: false,
      isError: false,
      error: null,
      updateAccessMode: vi.fn(),
      isUpdating: false,
    });

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Error al conectar con la arena')).toBeInTheDocument();
    expect(screen.getByText('Fallo en el servidor al cargar unidades')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Reintentar/i });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar las unidades, desafíos y métricas globales al cargar exitosamente', () => {
    const mockUnits: UnitResponseDto[] = [
      {
        id: 'u-1',
        title: 'Cómputo y Escalabilidad',
        description: 'Fundamentos de EC2 y ALB',
        orderIndex: 1,
        challenges: [
          {
            id: 'c-1',
            title: 'Servidor EC2',
            difficulty: 'easy',
            mode: 'builder',
            baseXP: 100,
            requiredXP: 0,
            orderIndex: 1,
            isLocked: false,
            lockReason: null,
            userProgress: {
              status: 'completed',
              highScore: 90,
              hintsUsed: 0,
              completedAt: '2026-09-19T20:00:00Z',
            },
          },
        ],
      },
    ];

    vi.mocked(useUnitsHook.useUnits).mockReturnValue({
      data: mockUnits,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSystemConfigHook.useSystemConfig).mockReturnValue({
      config: { accessMode: 'openAccess', updatedAt: '2026-09-19' },
      accessMode: 'openAccess',
      isLoading: false,
      isError: false,
      error: null,
      updateAccessMode: vi.fn(),
      isUpdating: false,
    });

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Catálogo de Desafíos de Arquitectura')).toBeInTheDocument();
    expect(screen.getByText('Cómputo y Escalabilidad')).toBeInTheDocument();
    expect(screen.getByText('Servidor EC2')).toBeInTheDocument();
    expect(screen.getByText('Desafíos Totales')).toBeInTheDocument();
  });
});
