import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { useChallengeAttempts } from '../useChallengeAttempts';
import * as evaluationApi from '../../api/evaluationApi';
import { ChallengeAttemptHistoryDto } from '../../types/evaluation.types';
import { ApiHttpError } from '../../../../shared/api/ApiHttpError';

vi.mock('../../api/evaluationApi', () => ({
  evaluateArchitecture: vi.fn(),
  getChallengeAttempts: vi.fn()
}));

describe('useChallengeAttempts', () => {
  let queryClient: QueryClient;
  const challengeId = '1985dcf5-840d-41cb-9348-a5254caaeb04';

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    return ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  const mockAttempts: ChallengeAttemptHistoryDto[] = [
    {
      id: 'att-1',
      score: 95,
      passed: true,
      hintsUsed: 1,
      createdAt: '2026-09-20T23:05:00.000Z',
      graphSubmitted: {
        components: [
          { id: 'node-1', serviceCode: 'AWS_ALB', config: {} },
          { id: 'node-2', serviceCode: 'AWS_EC2', config: {} }
        ],
        connections: [
          { fromComponentId: 'node-1', toComponentId: 'node-2', connectionType: 'HTTP_HTTPS' }
        ]
      }
    },
    {
      id: 'att-2',
      score: 45,
      passed: false,
      hintsUsed: 0,
      createdAt: '2026-09-20T22:30:00.000Z',
      graphSubmitted: {
        components: [
          { id: 'node-1', serviceCode: 'AWS_ALB', config: {} }
        ],
        connections: []
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe consultar los intentos del desafío y calcular attemptsCount y bestScore', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce(mockAttempts);

    const { result } = renderHook(() => useChallengeAttempts(challengeId), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(evaluationApi.getChallengeAttempts).toHaveBeenCalledWith(challengeId);
    expect(result.current.attempts).toEqual(mockAttempts);
    expect(result.current.attemptsCount).toBe(2);
    expect(result.current.bestScore).toBe(95);
    expect(result.current.isError).toBe(false);
  });

  it('debe manejar lista vacía y devolver bestScore = 0 y attemptsCount = 0', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useChallengeAttempts(challengeId), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.attempts).toEqual([]);
    expect(result.current.attemptsCount).toBe(0);
    expect(result.current.bestScore).toBe(0);
  });

  it('debe no disparar consulta si challengeId es vacío o nulo', () => {
    const { result } = renderHook(() => useChallengeAttempts(undefined), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(false);
    expect(evaluationApi.getChallengeAttempts).not.toHaveBeenCalled();
    expect(result.current.attempts).toEqual([]);
  });

  it('debe capturar errores de red y exponer isError = true', async () => {
    const mockError = new ApiHttpError('Error al obtener intentos', 500, 'SERVER_ERROR');
    vi.mocked(evaluationApi.getChallengeAttempts).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useChallengeAttempts(challengeId), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.attempts).toEqual([]);
  });
});
