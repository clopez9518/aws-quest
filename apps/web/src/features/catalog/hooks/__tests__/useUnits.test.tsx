import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUnits } from '../useUnits';
import * as catalogApi from '../../api/catalogApi';
import { UnitResponseDto } from '../../types/catalog.types';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';

vi.mock('../../api/catalogApi');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useUnits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().setSession('mock-token', {
      id: 'usr-1',
      name: 'Test User',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    });
  });

  it('no debe disparar la petición si no está autenticado (enabled: false)', () => {
    useAuthStore.getState().clearSession();

    const { result } = renderHook(() => useUnits(), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(catalogApi.getUnitsCatalog).not.toHaveBeenCalled();
  });

  it('debe obtener y retornar las unidades del catálogo exitosamente', async () => {
    const mockUnits: UnitResponseDto[] = [
      {
        id: 'u-1',
        title: 'Cómputo Básico',
        description: 'Fundamentos de EC2',
        orderIndex: 1,
        challenges: [],
      },
    ];

    vi.mocked(catalogApi.getUnitsCatalog).mockResolvedValueOnce(mockUnits);

    const { result } = renderHook(() => useUnits(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUnits);
    expect(catalogApi.getUnitsCatalog).toHaveBeenCalledTimes(1);
  });

  it('debe manejar errores al fallar la consulta de unidades', async () => {
    vi.mocked(catalogApi.getUnitsCatalog).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUnits(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network error');
  });
});
