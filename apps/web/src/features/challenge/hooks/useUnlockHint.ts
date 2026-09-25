import { useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeKeys } from './challengeQueryKeys';
import { catalogKeys } from '../../catalog/hooks/catalogQueryKeys';
import { unlockNextHint } from '../api/challengeApi';
import { ChallengeDetailResponseDto, UnlockHintResponseDto } from '../types/challenge.types';

export function useUnlockHint(challengeId: string) {
  const queryClient = useQueryClient();

  return useMutation<UnlockHintResponseDto, Error, void>({
    mutationFn: () => unlockNextHint(challengeId),
    onSuccess: (data) => {
      // 1. Actualización atómica en la caché del desafío actual
      queryClient.setQueryData<ChallengeDetailResponseDto>(
        challengeKeys.detail(challengeId),
        (old) => {
          if (!old) return old;

          const exists = old.hintsSummary.unlockedHints.some(
            (h) => h.orderIndex === data.unlockedHint.orderIndex
          );

          const updatedUnlockedHints = exists
            ? old.hintsSummary.unlockedHints
            : [...old.hintsSummary.unlockedHints, data.unlockedHint].sort(
                (a, b) => a.orderIndex - b.orderIndex
              );

          return {
            ...old,
            hintsSummary: {
              ...old.hintsSummary,
              unlockedCount: data.totalHintsUnlocked,
              unlockedHints: updatedUnlockedHints
            }
          };
        }
      );

      // 2. Invalidar la lista de unidades del catálogo para mantener sincronizados los contadores
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });
    }
  });
}
