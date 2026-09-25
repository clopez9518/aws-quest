import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from '../../../../shared/api/httpClient';
import { evaluateArchitecture, getChallengeAttempts } from '../evaluationApi';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  ChallengeAttemptHistoryDto
} from '../../types/evaluation.types';

vi.mock('../../../../shared/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('evaluationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateArchitecture', () => {
    const challengeId = '7f991f85-3b9e-4c17-a065-27a96e1ef6b2';
    const mockRequestPayload: EvaluateArchitectureRequestDto = {
      graph: {
        components: [
          {
            id: 'node_1',
            serviceCode: 'AWS_ALB',
            label: 'ALB',
            config: {}
          }
        ],
        connections: []
      },
      hintsUsed: 1
    };

    const mockResponseData: EvaluateArchitectureResponseDto = {
      score: 95,
      passed: true,
      isNewHighScore: true,
      earnedXP: 95,
      currentUserXP: 195,
      currentUserLevel: 2,
      feedback: {
        summary: 'Arquitectura óptima y resiliente.',
        items: [
          {
            status: 'pass',
            category: 'serviceSelection',
            title: 'Load Balancer correcto',
            explanation: 'ALB distribuye el tráfico.',
            penaltyApplied: 0,
            relatedComponentIds: ['node_1']
          }
        ]
      },
      attemptId: 'att-123-uuid'
    };

    it('debe enviar la petición POST a /challenges/:id/evaluate y retornar data', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockResponseData,
          meta: { timestamp: new Date().toISOString() }
        }
      });

      const result = await evaluateArchitecture(challengeId, mockRequestPayload);

      expect(httpClient.post).toHaveBeenCalledWith(
        `/challenges/${challengeId}/evaluate`,
        mockRequestPayload
      );
      expect(result).toEqual(mockResponseData);
      expect(result.score).toBe(95);
      expect(result.passed).toBe(true);
    });

    it('debe propagar errores cuando httpClient.post falla', async () => {
      const mockError = new Error('Network Error');
      vi.mocked(httpClient.post).mockRejectedValueOnce(mockError);

      await expect(evaluateArchitecture(challengeId, mockRequestPayload)).rejects.toThrow(
        'Network Error'
      );
    });
  });

  describe('getChallengeAttempts', () => {
    const challengeId = '7f991f85-3b9e-4c17-a065-27a96e1ef6b2';
    const mockAttempts: ChallengeAttemptHistoryDto[] = [
      {
        id: 'att-1',
        score: 95,
        passed: true,
        hintsUsed: 1,
        createdAt: '2026-09-20T17:00:00Z',
        graphSubmitted: {
          components: [],
          connections: []
        }
      },
      {
        id: 'att-2',
        score: 40,
        passed: false,
        hintsUsed: 0,
        createdAt: '2026-09-20T16:50:00Z',
        graphSubmitted: {
          components: [],
          connections: []
        }
      }
    ];

    it('debe enviar la petición GET a /challenges/:id/attempts y retornar lista de intentos', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockAttempts,
          meta: { timestamp: new Date().toISOString() }
        }
      });

      const result = await getChallengeAttempts(challengeId);

      expect(httpClient.get).toHaveBeenCalledWith(`/challenges/${challengeId}/attempts`);
      expect(result).toHaveLength(2);
      expect(result[0].score).toBe(95);
      expect(result[1].passed).toBe(false);
    });

    it('debe propagar errores cuando httpClient.get falla', async () => {
      const mockError = new Error('Unauthorized');
      vi.mocked(httpClient.get).mockRejectedValueOnce(mockError);

      await expect(getChallengeAttempts(challengeId)).rejects.toThrow('Unauthorized');
    });
  });
});
