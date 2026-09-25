/**
 * Representación del usuario dentro del estado de la aplicación y tokens.
 */
export interface UserSession {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
  totalXP: number;
  level: number;
}

/**
 * DTO de usuario devuelto por la API.
 */
export interface UserDto {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
  totalXP: number;
  level: number;
}

/**
 * DTO de respuesta para la creación de una sesión de invitado (POST /auth/guest).
 */
export interface GuestSessionResponseDto {
  accessToken: string;
  user: UserDto;
}

/**
 * DTO de petición para el registro de usuario (POST /auth/register).
 */
export interface RegisterRequestDto {
  email: string;
  password: string;
  name: string;
}

/**
 * DTO de respuesta tras el registro exitoso con migración (POST /auth/register).
 */
export interface RegisterResponseDto {
  accessToken: string;
  user: UserDto;
  migratedProgressCount: number;
}

/**
 * DTO de petición para el inicio de sesión (POST /auth/login).
 */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/**
 * DTO de respuesta tras el inicio de sesión exitoso (POST /auth/login).
 */
export interface LoginResponseDto {
  accessToken: string;
  user: UserDto;
}

/**
 * DTO de perfil del usuario actual (GET /auth/me).
 */
export interface UserProfileDto {
  id: string;
  name: string;
  email: string | null;
  isGuest: boolean;
  totalXP: number;
  level: number;
  completedChallengesCount: number;
}
