import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { ApiErrorResponse, ErrorCodes } from '../types/api.types';
import { ApiHttpError } from './ApiHttpError';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// ==========================================
// REQUEST INTERCEPTOR: Inyección de Bearer JWT
// ==========================================
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Si la petición ya trae un Authorization header explícito (ej. registro con migración), no se sobreescribe
    if (!config.headers.Authorization) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR: Unwrapping y Manejo de Errores
// ==========================================
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // 1. Error de Red / Servidor Inaccesible
    if (!error.response) {
      const message = error.message === 'Network Error' 
        ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.' 
        : error.message || 'Error de conexión desconocido.';
      return Promise.reject(new ApiHttpError(message, 0, ErrorCodes.NETWORK_ERROR));
    }

    const { status, data } = error.response;

    // 2. Manejo de Token Expirado o Inválido (401 Unauthorized)
    if (status === 401) {
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken) {
        console.warn('[HttpClient] Sesión expirada o token inválido (401). Limpiando credenciales locales.');
        useAuthStore.getState().clearSession();
      }
    }

    // 3. Error Estructurado del Backend (ApiErrorResponse canónico)
    if (data && typeof data === 'object' && data.success === false && data.error) {
      const { code, message, details } = data.error;
      return Promise.reject(new ApiHttpError(message, status, code, details));
    }

    // 4. Fallback para errores HTTP no estructurados (ej. 502 Bad Gateway / 500 HTML)
    const fallbackMessage = `Error ${status}: ${error.response.statusText || 'Error en el servidor'}`;
    return Promise.reject(new ApiHttpError(fallbackMessage, status, ErrorCodes.INTERNAL_SERVER_ERROR));
  }
);
