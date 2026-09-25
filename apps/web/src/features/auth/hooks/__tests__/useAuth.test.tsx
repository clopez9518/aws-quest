import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../useAuth';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';
import { authApi } from '../../api/authApi';
import { LoginResponseDto, RegisterResponseDto } from '../../types/auth.types';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    vi.restoreAllMocks();
  });

  it('debe exponer el estado de autenticación y de invitado de forma reactiva', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isGuest).toBe(false);
  });

  it('debe ejecutar login exitosamente y actualizar la sesión', async () => {
    const mockLoginResponse: LoginResponseDto = {
      accessToken: 'logged-token',
      user: {
        id: 'usr-1',
        name: 'Carlos',
        email: 'carlos@test.com',
        isGuest: false,
        totalXP: 100,
        level: 1
      }
    };

    vi.spyOn(authApi, 'login').mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.login({ email: 'carlos@test.com', password: 'Password123!' });
    });

    expect(useAuthStore.getState().accessToken).toBe('logged-token');
    expect(useAuthStore.getState().user?.name).toBe('Carlos');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().isGuest()).toBe(false);
  });

  it('debe ejecutar register enviando el token de invitado previo para migración de progreso (RN-13)', async () => {
    // Establecer estado de invitado previo
    useAuthStore.getState().setSession('guest-token-123', {
      id: 'guest-id',
      name: 'Invitado_1',
      email: null,
      isGuest: true,
      totalXP: 80,
      level: 1
    });

    const mockRegisterResponse: RegisterResponseDto = {
      accessToken: 'new-perm-token',
      user: {
        id: 'guest-id',
        name: 'Carlos Registrado',
        email: 'carlos@test.com',
        isGuest: false,
        totalXP: 80,
        level: 1
      },
      migratedProgressCount: 2
    };

    const registerSpy = vi.spyOn(authApi, 'register').mockResolvedValue(mockRegisterResponse);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.register({
        name: 'Carlos Registrado',
        email: 'carlos@test.com',
        password: 'Password123!'
      });
    });

    expect(registerSpy).toHaveBeenCalledWith(
      {
        name: 'Carlos Registrado',
        email: 'carlos@test.com',
        password: 'Password123!'
      },
      'guest-token-123'
    );

    expect(useAuthStore.getState().accessToken).toBe('new-perm-token');
    expect(useAuthStore.getState().isGuest()).toBe(false);
  });

  it('debe limpiar la sesión al invocar logout', () => {
    useAuthStore.getState().setSession('some-token', {
      id: 'u-1',
      name: 'User',
      email: 'u@test.com',
      isGuest: false,
      totalXP: 10,
      level: 1
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    act(() => {
      result.current.logout();
    });

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
