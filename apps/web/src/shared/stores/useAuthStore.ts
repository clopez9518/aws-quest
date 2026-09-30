import { create } from 'zustand';
import { UserSession } from '../../features/auth/types/auth.types';

export const STORAGE_KEYS = {
  TOKEN: 'awsquest_auth_token',
  USER: 'awsquest_auth_user'
} as const;

export interface AuthState {
  accessToken: string | null;
  user: UserSession | null;
  isInitialized: boolean;
  isLoading: boolean;
  
  // Getters computados
  isAuthenticated: () => boolean;
  isGuest: () => boolean;
  
  // Acciones
  setSession: (token: string, user: UserSession) => void;
  updateUser: (partialUser: Partial<UserSession>) => void;
  clearSession: () => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Carga de forma segura el usuario persistido desde localStorage.
 */
function loadPersistedUser(): UserSession | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    console.error('[useAuthStore] Error parsing persisted user from localStorage:', err);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // Ignorar error al remover
    }
    return null;
  }
}

/**
 * Carga de forma segura el token persistido desde localStorage.
 */
function loadPersistedToken(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (err) {
    console.error('[useAuthStore] Error reading token from localStorage:', err);
    return null;
  }
}

const initialToken = loadPersistedToken();
const initialUser = loadPersistedUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: initialToken,
  user: initialUser,
  isInitialized: Boolean(initialToken && initialUser),
  isLoading: false,

  isAuthenticated: () => {
    const state = get();
    return Boolean(state.accessToken && state.user);
  },

  isGuest: () => {
    const state = get();
    return Boolean(state.user?.isGuest);
  },

  setSession: (token: string, user: UserSession) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    } catch (err) {
      console.error('[useAuthStore] Error persisting session to localStorage:', err);
    }
    set({ accessToken: token, user, isInitialized: true, isLoading: false });
  },

  updateUser: (partialUser: Partial<UserSession>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser: UserSession = { ...currentUser, ...partialUser };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('[useAuthStore] Error updating user in localStorage:', err);
    }
    set({ user: updatedUser });
  },

  clearSession: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (err) {
      console.error('[useAuthStore] Error clearing localStorage session:', err);
    }
    set({ accessToken: null, user: null, isInitialized: false, isLoading: false });
  },

  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setLoading: (isLoading: boolean) => set({ isLoading })
}));
