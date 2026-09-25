import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSystemConfig, updateSystemConfig } from '../systemConfigApi';
import { httpClient } from '../../../../shared/api/httpClient';
import { SystemConfigResponseDto } from '../../types/systemConfig.types';

vi.mock('../../../../shared/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('systemConfigApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSystemConfig debe llamar a GET /system/config y retornar la política activa', async () => {
    const mockConfig: SystemConfigResponseDto = {
      accessMode: 'openAccess',
      updatedAt: '2026-09-19T20:00:00Z',
    };

    vi.mocked(httpClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockConfig,
      },
    });

    const result = await getSystemConfig();

    expect(httpClient.get).toHaveBeenCalledWith('/system/config');
    expect(result).toEqual(mockConfig);
  });

  it('updateSystemConfig debe llamar a PATCH /system/config con el nuevo accessMode', async () => {
    const mockUpdated: SystemConfigResponseDto = {
      accessMode: 'progressive',
      updatedAt: '2026-09-19T21:00:00Z',
    };

    vi.mocked(httpClient.patch).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockUpdated,
      },
    });

    const result = await updateSystemConfig('progressive');

    expect(httpClient.patch).toHaveBeenCalledWith('/system/config', { accessMode: 'progressive' });
    expect(result).toEqual(mockUpdated);
  });
});
