import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import { AccessMode, SystemConfigResponseDto, UpdateSystemConfigRequestDto } from '../types/systemConfig.types';

/**
 * Consulta la política global de acceso activa en el sistema.
 */
export async function getSystemConfig(): Promise<SystemConfigResponseDto> {
  const response = await httpClient.get<ApiResponse<SystemConfigResponseDto>>('/system/config');
  return response.data.data;
}

/**
 * Actualiza la política global de acceso (Modo Libre vs. Progresivo).
 */
export async function updateSystemConfig(accessMode: AccessMode): Promise<SystemConfigResponseDto> {
  const payload: UpdateSystemConfigRequestDto = { accessMode };
  const response = await httpClient.patch<ApiResponse<SystemConfigResponseDto>>('/system/config', payload);
  return response.data.data;
}
