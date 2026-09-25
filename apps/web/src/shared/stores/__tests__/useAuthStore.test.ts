import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, STORAGE_KEYS } from '../useAuthStore';
import { UserSession } from '../../../features/auth/types/auth.types';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
  });

  it('debe inicializar con valores nulos y estado no autenticado por defecto', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
    expect(state.isGuest()).toBe(false);
  });

  it('debe guardar sesión, actualizar estado y sincronizar con localStorage al llamar a setSession', () => {
    const mockUser: UserSession = {
      id: 'usr-123',
      name: 'Invitado_1234',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    };
    const mockToken = 'mock-jwt-token-guest';

    useAuthStore.getState().setSession(mockToken, mockUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
    expect(state.isInitialized).toBe(true);
    expect(state.isAuthenticated()).toBe(true);
    expect(state.isGuest()).toBe(true);

    // Verificar persistencia en localStorage
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe(mockToken);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)!)).toEqual(mockUser);
  });

  it('debe actualizar parcialmente los datos del usuario manteniendo el token', () => {
    const mockUser: UserSession = {
      id: 'usr-123',
      name: 'Invitado_1234',
      email: null,
      isGuest: true,
      totalXP: 0,
      level: 1
    };
    useAuthStore.getState().setSession('token-abc', mockUser);

    useAuthStore.getState().updateUser({ totalXP: 150, level: 2 });

    const state = useAuthStore.getState();
    expect(state.user?.totalXP).toBe(150);
    expect(state.user?.level).toBe(2);
    expect(state.user?.name).toBe('Invitado_1234');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)!).totalXP).toBe(150);
  });

  it('debe limpiar el estado y el localStorage al llamar a clearSession', () => {
    const mockUser: UserSession = {
      id: 'usr-999',
      name: 'Carlos',
      email: 'carlos@test.com',
      isGuest: false,
      totalXP: 300,
      level: 3
    };
    useAuthStore.getState().setSession('token-xyz', mockUser);

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isInitialized).toBe(false);
    expect(state.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER)).toBeNull();
  });

  it('debe identificar correctamente a un usuario registrado como isGuest false', () => {
    const mockUser: UserSession = {
      id: 'usr-reg-1',
      name: 'Ana',
      email: 'ana@example.com',
      isGuest: false,
      totalXP: 500,
      level: 4
    };
    useAuthStore.getState().setSession('valid-token', mockUser);

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().isGuest()).toBe(false);
  });
});
