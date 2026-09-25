import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpClient } from '../../../../shared/api/httpClient';
import { getChallengeDetail, unlockNextHint } from '../challengeApi';
import { ChallengeDetailResponseDto, UnlockHintResponseDto } from '../../types/challenge.types';

vi.mock('../../../../shared/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('challengeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getChallengeDetail debe invocar GET /challenges/{id} y retornar la información del desafío', async () => {
    const mockDetail: ChallengeDetailResponseDto = {
      id: 'challenge-123',
      title: 'Servidor Web Básico en EC2',
      description: 'Prueba de desafío',
      difficulty: 'easy',
      mode: 'builder',
      baseXP: 100,
      allowedServices: [
        {
          code: 'AWS_EC2',
          name: 'Amazon EC2',
          category: 'Compute',
          iconUrl: '/icons/aws/ec2.svg',
          maxInstances: 1,
          isDistractor: false
        }
      ],
      hintsSummary: {
        totalHints: 2,
        unlockedCount: 0,
        unlockedHints: []
      },
      lastAttemptGraph: null
    };

    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockDetail }
    });

    const result = await getChallengeDetail('challenge-123');

    expect(httpClient.get).toHaveBeenCalledWith('/challenges/challenge-123');
    expect(result).toEqual(mockDetail);
  });

  it('unlockNextHint debe invocar POST /challenges/{id}/hints/unlock y retornar la pista desbloqueada', async () => {
    const mockUnlockResult: UnlockHintResponseDto = {
      unlockedHint: {
        orderIndex: 1,
        text: 'Selecciona EC2 del panel lateral.',
        penaltyApplied: 5
      },
      totalHintsUnlocked: 1,
      totalPenaltyAccumulated: 5
    };

    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: { success: true, data: mockUnlockResult }
    });

    const result = await unlockNextHint('challenge-123');

    expect(httpClient.post).toHaveBeenCalledWith('/challenges/challenge-123/hints/unlock');
    expect(result).toEqual(mockUnlockResult);
  });
});
