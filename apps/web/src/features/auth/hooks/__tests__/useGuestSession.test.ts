import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGuestSession } from '../useGuestSession';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';
import { authApi } from '../../api/authApi';
import { GuestSessionResponseDto } from '../../types/auth.types';

describe('useGuestSession', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    vi.restoreAllMocks();
  });

  it('debe aprovisionar automáticamente una sesión de invitado si no existe sesión previa', async () => {
    const mockGuest: GuestSessionResponseDto = {
      accessToken: 'guest-token-auto',
      user: {
        id: 'guest-1',
        name: 'Invitado_5555',
        email: null,
        isGuest: true,
        totalXP: 0,
        level: 1
      }
    };

    const createGuestSpy = vi.spyOn(authApi, 'createGuestSession').mockResolvedValue(mockGuest);

    const { result } = renderHook(() => useGuestSession());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(createGuestSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('guest-token-auto');
    expect(useAuthStore.getState().user?.name).toBe('Invitado_5555');
    expect(result.current.isGuest).toBe(true);
  });

  it('no debe llamar a createGuestSession si ya existe un usuario y token en el store', async () => {
    useAuthStore.getState().setSession('existing-token', {
      id: 'existing-user-1',
      name: 'Carlos',
      email: 'carlos@test.com',
      isGuest: false,
      totalXP: 200,
      level: 2
    });

    const createGuestSpy = vi.spyOn(authApi, 'createGuestSession');

    const { result } = renderHook(() => useGuestSession());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(createGuestSpy).not.toHaveBeenCalled();
    expect(result.current.isGuest).toBe(false);
  });
});
