import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSystemConfig } from '../useSystemConfig';
import * as systemConfigApi from '../../api/systemConfigApi';
import { SystemConfigResponseDto } from '../../types/systemConfig.types';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';

vi.mock('../../api/systemConfigApi');

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSystemConfig', () => {
  let queryClient: QueryClient;

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
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('debe consultar la configuración activa del sistema', async () => {
    const mockConfig: SystemConfigResponseDto = {
      accessMode: 'openAccess',
      updatedAt: '2026-09-19T20:00:00Z',
    };

    vi.mocked(systemConfigApi.getSystemConfig).mockResolvedValueOnce(mockConfig);

    const { result } = renderHook(() => useSystemConfig(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.config).toBeDefined());

    expect(result.current.accessMode).toBe('openAccess');
    expect(result.current.config).toEqual(mockConfig);
  });

  it('debe ejecutar la mutación de actualización e invalidar la caché', async () => {
    const mockInitial: SystemConfigResponseDto = {
      accessMode: 'openAccess',
      updatedAt: '2026-09-19T20:00:00Z',
    };
    const mockUpdated: SystemConfigResponseDto = {
      accessMode: 'progressive',
      updatedAt: '2026-09-19T21:00:00Z',
    };

    vi.mocked(systemConfigApi.getSystemConfig).mockResolvedValueOnce(mockInitial);
    vi.mocked(systemConfigApi.updateSystemConfig).mockResolvedValueOnce(mockUpdated);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useSystemConfig(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.config).toBeDefined());

    await act(async () => {
      result.current.updateAccessMode('progressive');
    });

    await waitFor(() => expect(result.current.accessMode).toBe('progressive'));

    expect(systemConfigApi.updateSystemConfig).toHaveBeenCalledWith('progressive');
    expect(invalidateSpy).toHaveBeenCalled();
  });
});
