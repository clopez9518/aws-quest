import { ErrorCodes } from '../types/api.types';

/**
 * Excepción personalizada para encapsular errores devueltos por la API REST
 * o fallos de red en Axios.
 */
export class ApiHttpError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isNetworkError: boolean;

  constructor(message: string, statusCode: number, code: string = ErrorCodes.INTERNAL_SERVER_ERROR, details?: unknown) {
    super(message);
    this.name = 'ApiHttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isNetworkError = statusCode === 0 || code === ErrorCodes.NETWORK_ERROR;
    Object.setPrototypeOf(this, ApiHttpError.prototype);
  }

  /**
   * Determina si el error es una instancia de ApiHttpError.
   */
  public static isApiHttpError(error: unknown): error is ApiHttpError {
    return error instanceof ApiHttpError;
  }
}
