/**
 * Metadatos de paginación devueltos en peticiones paginadas.
 */
export interface PaginationMetadataDto {
  total: number;
  page: number;
  limit: number;
}

/**
 * Metadatos de respuesta estándar de la API.
 */
export interface ApiMetaDto {
  timestamp: string;
  pagination?: PaginationMetadataDto;
}

/**
 * Envelope canónico de respuesta exitosa de la API.
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: ApiMetaDto;
}

/**
 * Detalle de error de validación de un campo específico.
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Estructura del cuerpo de error en ApiErrorResponse.
 */
export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: ValidationErrorDetail[] | Record<string, unknown> | null;
}

/**
 * Envelope canónico de respuesta de error de la API.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
}

/**
 * Catálogo de códigos de error estándar devueltos por el backend ASP.NET Core.
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CHALLENGE_NOT_FOUND: 'CHALLENGE_NOT_FOUND',
  CHALLENGE_LOCKED: 'CHALLENGE_LOCKED',
  INVALID_GRAPH_PAYLOAD: 'INVALID_GRAPH_PAYLOAD',
  SERVICE_LIMIT_EXCEEDED: 'SERVICE_LIMIT_EXCEEDED',
  ALL_HINTS_UNLOCKED: 'ALL_HINTS_UNLOCKED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
