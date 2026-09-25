/**
 * Modos de acceso global al contenido educativo.
 */
export type AccessMode = 'openAccess' | 'progressive';

/**
 * DTO de respuesta con la configuración activa del sistema.
 */
export interface SystemConfigResponseDto {
  accessMode: AccessMode;
  updatedAt: string;
}

/**
 * DTO de petición para actualizar la política global de acceso.
 */
export interface UpdateSystemConfigRequestDto {
  accessMode: AccessMode;
}
