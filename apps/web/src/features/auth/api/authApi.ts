import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  GuestSessionResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  UserProfileDto
} from '../types/auth.types';

export const authApi = {
  /**
   * Crea una sesión anónima en Modo Invitado.
   * POST /api/v1/auth/guest
   */
  async createGuestSession(): Promise<GuestSessionResponseDto> {
    const response = await httpClient.post<ApiResponse<GuestSessionResponseDto>>('/auth/guest');
    return response.data.data;
  },

  /**
   * Registra una cuenta de usuario permanente.
   * Si se provee guestToken, se incluye en Authorization header para migración atómica (RN-13 / CU-08).
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequestDto, guestToken?: string | null): Promise<RegisterResponseDto> {
    const headers: Record<string, string> = {};
    if (guestToken) {
      headers.Authorization = `Bearer ${guestToken}`;
    }

    const response = await httpClient.post<ApiResponse<RegisterResponseDto>>('/auth/register', data, {
      headers: Object.keys(headers).length > 0 ? headers : undefined
    });
    return response.data.data;
  },

  /**
   * Inicia sesión con credenciales de usuario registrado.
   * POST /api/v1/auth/login
   */
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await httpClient.post<ApiResponse<LoginResponseDto>>('/auth/login', data);
    return response.data.data;
  },

  /**
   * Consulta el perfil y progreso acumulado del usuario actual.
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<UserProfileDto> {
    const response = await httpClient.get<ApiResponse<UserProfileDto>>('/auth/me');
    return response.data.data;
  }
};
