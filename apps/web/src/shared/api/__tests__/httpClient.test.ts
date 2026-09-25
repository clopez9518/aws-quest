import { describe, it, expect, beforeEach, vi } from 'vitest';
import { httpClient } from '../httpClient';
import { useAuthStore } from '../../stores/useAuthStore';
import { ApiHttpError } from '../ApiHttpError';
import { ErrorCodes } from '../../types/api.types';

describe('httpClient', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    vi.restoreAllMocks();
  });

  it('debe tener configurada la baseURL y los headers por defecto', () => {
    expect(httpClient.defaults.baseURL).toBe('https://localhost:7234/api/v1');
    expect(httpClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(httpClient.defaults.headers['Accept']).toBe('application/json');
  });

  it('debe inyectar Authorization Bearer token automáticamente si existe sesión en useAuthStore', async () => {
    useAuthStore.getState().setSession('my-jwt-token-123', {
      id: 'usr-1',
      name: 'Tester',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    });

    const mockAdapter = vi.fn().mockResolvedValue({
      data: { success: true, data: { test: 'ok' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });

    httpClient.defaults.adapter = mockAdapter;

    await httpClient.get('/test-endpoint');

    expect(mockAdapter).toHaveBeenCalledTimes(1);
    const passedConfig = mockAdapter.mock.calls[0][0];
    expect(passedConfig.headers.Authorization).toBe('Bearer my-jwt-token-123');
  });

  it('no debe sobreescribir el Authorization header si la petición ya lo provee explícitamente', async () => {
    useAuthStore.getState().setSession('current-store-token', {
      id: 'usr-1',
      name: 'Tester',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    });

    const mockAdapter = vi.fn().mockResolvedValue({
      data: { success: true, data: {} },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });

    httpClient.defaults.adapter = mockAdapter;

    await httpClient.post('/auth/register', {}, {
      headers: {
        Authorization: 'Bearer explicit-guest-token'
      }
    });

    const passedConfig = mockAdapter.mock.calls[0][0];
    expect(passedConfig.headers.Authorization).toBe('Bearer explicit-guest-token');
  });

  it('debe transformar respuestas de error estructuradas (ApiErrorResponse) en instancias de ApiHttpError', async () => {
    const errorResponseData = {
      success: false,
      error: {
        code: ErrorCodes.EMAIL_ALREADY_EXISTS,
        message: 'El correo ya está registrado.',
        details: null
      }
    };

    const mockAdapter = vi.fn().mockRejectedValue({
      response: {
        status: 409,
        statusText: 'Conflict',
        data: errorResponseData
      }
    });

    httpClient.defaults.adapter = mockAdapter;

    await expect(httpClient.post('/auth/register', {})).rejects.toSatisfy((err: unknown) => {
      expect(ApiHttpError.isApiHttpError(err)).toBe(true);
      const apiErr = err as ApiHttpError;
      expect(apiErr.statusCode).toBe(409);
      expect(apiErr.code).toBe(ErrorCodes.EMAIL_ALREADY_EXISTS);
      expect(apiErr.message).toBe('El correo ya está registrado.');
      return true;
    });
  });

  it('debe capturar errores 401 y limpiar la sesión en useAuthStore', async () => {
    useAuthStore.getState().setSession('expired-token', {
      id: 'usr-expired',
      name: 'Expired',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    });

    const mockAdapter = vi.fn().mockRejectedValue({
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: {
          success: false,
          error: {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'Token expirado'
          }
        }
      }
    });

    httpClient.defaults.adapter = mockAdapter;

    await expect(httpClient.get('/auth/me')).rejects.toThrow();

    // Debe haberse limpiado la sesión
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('debe manejar errores de red devolviendo ApiHttpError con código NETWORK_ERROR', async () => {
    const mockAdapter = vi.fn().mockRejectedValue(new Error('Network Error'));

    httpClient.defaults.adapter = mockAdapter;

    await expect(httpClient.get('/any-path')).rejects.toSatisfy((err: unknown) => {
      expect(ApiHttpError.isApiHttpError(err)).toBe(true);
      const apiErr = err as ApiHttpError;
      expect(apiErr.statusCode).toBe(0);
      expect(apiErr.code).toBe(ErrorCodes.NETWORK_ERROR);
      expect(apiErr.isNetworkError).toBe(true);
      return true;
    });
  });
});
