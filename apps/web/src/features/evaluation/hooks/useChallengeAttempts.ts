import { useQuery } from '@tanstack/react-query';
import { getChallengeAttempts } from '../api/evaluationApi';
import { evaluationKeys } from './evaluationQueryKeys';
import { ChallengeAttemptHistoryDto } from '../types/evaluation.types';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

export interface UseChallengeAttemptsResult {
  attempts: ChallengeAttemptHistoryDto[];
  isLoading: boolean;
  isError: boolean;
  error: ApiHttpError | null;
  refetch: () => void;
  attemptsCount: number;
  bestScore: number;
}

/**
 * Hook reactivo para consultar y mantener sincronizado el historial de intentos de un desafío.
 * 
 * @param challengeId Identificador único del desafío (UUID).
 */
export function useChallengeAttempts(challengeId?: string): UseChallengeAttemptsResult {
  const query = useQuery<ChallengeAttemptHistoryDto[], ApiHttpError>({
    queryKey: evaluationKeys.attempts(challengeId ?? ''),
    queryFn: () => getChallengeAttempts(challengeId ?? ''),
    enabled: Boolean(challengeId),
    staleTime: 1000 * 60 * 2, // 2 minutos de stale time
  });

  const attempts = query.data ?? [];
  const bestScore = attempts.reduce((max, curr) => Math.max(max, curr.score), 0);

  return {
    attempts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    attemptsCount: attempts.length,
    bestScore
  };
}
