import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  ChallengeAttemptHistoryDto
} from '../types/evaluation.types';

/**
 * Envía una solución arquitectónica para su evaluación pedagógica en memoria.
 * Endpoint: POST /api/v1/challenges/{challengeId}/evaluate
 * 
 * @param challengeId Identificador único del desafío (UUID).
 * @param payload Grafo semántico y contador de pistas consumidas.
 * @returns Promesa con los resultados cuantitativos y cualitativos de la evaluación.
 */
export async function evaluateArchitecture(
  challengeId: string,
  payload: EvaluateArchitectureRequestDto
): Promise<EvaluateArchitectureResponseDto> {
  const response = await httpClient.post<ApiResponse<EvaluateArchitectureResponseDto>>(
    `/challenges/${challengeId}/evaluate`,
    payload
  );
  return response.data.data;
}

/**
 * Obtiene el historial cronológico de intentos realizados por el usuario en el desafío.
 * Endpoint: GET /api/v1/challenges/{challengeId}/attempts
 * 
 * @param challengeId Identificador único del desafío (UUID).
 * @returns Lista histórica de intentos ordenados de forma descendente por fecha.
 */
export async function getChallengeAttempts(
  challengeId: string
): Promise<ChallengeAttemptHistoryDto[]> {
  const response = await httpClient.get<ApiResponse<ChallengeAttemptHistoryDto[]>>(
    `/challenges/${challengeId}/attempts`
  );
  return response.data.data;
}
