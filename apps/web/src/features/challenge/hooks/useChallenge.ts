import { useQuery } from '@tanstack/react-query';
import { challengeKeys } from './challengeQueryKeys';
import { getChallengeDetail } from '../api/challengeApi';
import { ChallengeDetailResponseDto } from '../types/challenge.types';

export function useChallenge(challengeId: string | undefined) {
  return useQuery<ChallengeDetailResponseDto, Error>({
    queryKey: challengeKeys.detail(challengeId ?? ''),
    queryFn: () => getChallengeDetail(challengeId!),
    enabled: Boolean(challengeId && challengeId.trim().length > 0),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché fresca
    gcTime: 1000 * 60 * 15, // 15 minutos en memoria
    retry: (failureCount, error: any) => {
      // No reintentar si el error es 404 (No encontrado) o 403 (Bloqueado)
      const status = error?.statusCode || error?.status || error?.response?.status;
      if (status === 404 || status === 403) return false;
      return failureCount < 2;
    }
  });
}
