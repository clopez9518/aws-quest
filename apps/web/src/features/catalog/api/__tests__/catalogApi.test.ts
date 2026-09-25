import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUnitsCatalog } from '../catalogApi';
import { httpClient } from '../../../../shared/api/httpClient';
import { UnitResponseDto } from '../../types/catalog.types';

vi.mock('../../../../shared/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe('catalogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUnitsCatalog debe llamar a GET /units y retornar la lista de unidades', async () => {
    const mockUnits: UnitResponseDto[] = [
      {
        id: 'u-1',
        title: 'Cómputo Básico',
        description: 'Fundamentos de EC2',
        orderIndex: 1,
        challenges: [
          {
            id: 'c-1',
            title: 'Servidor Web',
            difficulty: 'easy',
            mode: 'builder',
            baseXP: 100,
            requiredXP: 0,
            orderIndex: 1,
            isLocked: false,
            lockReason: null,
            userProgress: {
              status: 'completed',
              highScore: 95,
              hintsUsed: 0,
              completedAt: '2026-09-19T20:00:00Z',
            },
          },
        ],
      },
    ];

    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockUnits,
      },
    });

    const result = await getUnitsCatalog();

    expect(httpClient.get).toHaveBeenCalledWith('/units');
    expect(result).toEqual(mockUnits);
  });
});
