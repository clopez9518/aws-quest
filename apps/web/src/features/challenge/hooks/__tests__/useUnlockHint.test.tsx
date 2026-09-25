import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUnlockHint } from '../useUnlockHint';
import { challengeKeys } from '../challengeQueryKeys';
import { catalogKeys } from '../../../catalog/hooks/catalogQueryKeys';
import * as challengeApi from '../../api/challengeApi';
import {
  ChallengeDetailResponseDto,
  UnlockHintResponseDto
} from '../../types/challenge.types';

vi.mock('../../api/challengeApi');

describe('useUnlockHint Hook', () => {
  let queryClient: QueryClient;

  function createWrapper() {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe ejecutar la mutación y actualizar la caché de hints y catálogo', async () => {
    const initialChallenge: ChallengeDetailResponseDto = {
      id: 'c-101',
      title: 'Desafío 101',
      description: 'Desc',
      difficulty: 'easy',
      mode: 'builder',
      baseXP: 100,
      allowedServices: [],
      hintsSummary: {
        totalHints: 2,
        unlockedCount: 0,
        unlockedHints: []
      },
      lastAttemptGraph: null
    };

    const unlockResponse: UnlockHintResponseDto = {
      unlockedHint: {
        orderIndex: 1,
        text: 'Pista 1 revelada',
        penaltyApplied: 5
      },
      totalHintsUnlocked: 1,
      totalPenaltyAccumulated: 5
    };

    vi.mocked(challengeApi.unlockNextHint).mockResolvedValueOnce(unlockResponse);

    const wrapper = createWrapper();

    // Poblar caché previa
    queryClient.setQueryData(challengeKeys.detail('c-101'), initialChallenge);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUnlockHint('c-101'), { wrapper });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(challengeApi.unlockNextHint).toHaveBeenCalledWith('c-101');

    // Verificar que la caché del desafío se actualizó atómicamente
    const cachedData = queryClient.getQueryData<ChallengeDetailResponseDto>(
      challengeKeys.detail('c-101')
    );
    expect(cachedData?.hintsSummary.unlockedCount).toBe(1);
    expect(cachedData?.hintsSummary.unlockedHints).toHaveLength(1);
    expect(cachedData?.hintsSummary.unlockedHints[0].text).toBe('Pista 1 revelada');

    // Verificar que se invalidó el catálogo
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: catalogKeys.units() });
  });
});
