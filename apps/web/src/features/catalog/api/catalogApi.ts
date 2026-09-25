import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import { UnitResponseDto } from '../types/catalog.types';

/**
 * Obtiene el catálogo completo de unidades y desafíos con el progreso del usuario activo.
 */
export async function getUnitsCatalog(): Promise<UnitResponseDto[]> {
  const response = await httpClient.get<ApiResponse<UnitResponseDto[]>>('/units');
  return response.data.data;
}
