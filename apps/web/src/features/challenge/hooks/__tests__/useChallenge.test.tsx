import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useChallenge } from '../useChallenge';
import * as challengeApi from '../../api/challengeApi';
import { ChallengeDetailResponseDto } from '../../types/challenge.types';

vi.mock('../../api/challengeApi');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useChallenge Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe ejecutar la consulta si challengeId es indefinido o vacío', () => {
    const { result } = renderHook(() => useChallenge(''), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(challengeApi.getChallengeDetail).not.toHaveBeenCalled();
  });

  it('debe retornar el detalle del desafío tras una consulta exitosa', async () => {
    const mockChallenge: ChallengeDetailResponseDto = {
      id: 'c-1',
      title: 'Desafío de prueba',
      description: 'Descripción',
      difficulty: 'easy',
      mode: 'builder',
      baseXP: 100,
      allowedServices: [],
      hintsSummary: {
        totalHints: 1,
        unlockedCount: 0,
        unlockedHints: []
      },
      lastAttemptGraph: null
    };

    vi.mocked(challengeApi.getChallengeDetail).mockResolvedValueOnce(mockChallenge);

    const { result } = renderHook(() => useChallenge('c-1'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(challengeApi.getChallengeDetail).toHaveBeenCalledWith('c-1');
    expect(result.current.data).toEqual(mockChallenge);
  });

  it('debe manejar errores en la consulta HTTP', async () => {
    const error404 = Object.assign(new Error('Desafío no encontrado'), { status: 404 });
    vi.mocked(challengeApi.getChallengeDetail).mockRejectedValueOnce(error404);

    const { result } = renderHook(() => useChallenge('c-invalid'), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Desafío no encontrado');
  });
});
