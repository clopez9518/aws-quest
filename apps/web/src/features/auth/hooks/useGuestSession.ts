import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { authApi } from '../api/authApi';

/**
 * Hook que asegura la existencia de una sesión de usuario al arrancar la app.
 * Si no existe token ni usuario en el store, aprovisiona una sesión anónima de invitado.
 * Incluye un guard de ejecución para prevenir llamadas duplicadas en React StrictMode.
 */
export function useGuestSession() {
  const { accessToken, user, isInitialized, setSession, setInitialized, setLoading } = useAuthStore();
  const initializingRef = useRef(false);

  useEffect(() => {
    // Si ya está inicializado o ya existe un token con usuario válido, marcar como listo
    if (isInitialized || (accessToken && user)) {
      if (!isInitialized) {
        setInitialized(true);
      }
      return;
    }

    // Evitar invocaciones concurrentes durante montajes dobles de StrictMode
    if (initializingRef.current) return;
    initializingRef.current = true;

    async function initializeGuest() {
      setLoading(true);
      try {
        const guestData = await authApi.createGuestSession();
        setSession(guestData.accessToken, guestData.user);
      } catch (error) {
        console.error('[useGuestSession] Error al aprovisionar sesión de invitado:', error);
        setInitialized(true); // Se marca inicializado para no bloquear la UI indefinidamente
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    }

    initializeGuest();
  }, [accessToken, user, isInitialized, setSession, setInitialized, setLoading]);

  return {
    isInitialized,
    isGuest: user?.isGuest ?? true
  };
}
