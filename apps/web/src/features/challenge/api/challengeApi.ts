import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  ChallengeDetailResponseDto,
  UnlockHintResponseDto,
  SubmitReflectionAnswerRequestDto,
  SubmitReflectionAnswerResponseDto
} from '../types/challenge.types';

/**
 * Consulta la información completa y contexto del desafío por su identificador único.
 */
export async function getChallengeDetail(
  challengeId: string
): Promise<ChallengeDetailResponseDto> {
  const response = await httpClient.get<ApiResponse<ChallengeDetailResponseDto>>(
    `/challenges/${challengeId}`
  );
  return response.data.data;
}

/**
 * Desbloquea la siguiente pista disponible en orden secuencial para el desafío.
 */
export async function unlockNextHint(
  challengeId: string
): Promise<UnlockHintResponseDto> {
  const response = await httpClient.post<ApiResponse<UnlockHintResponseDto>>(
    `/challenges/${challengeId}/hints/unlock`
  );
  return response.data.data;
}

/**
 * Envía la respuesta del estudiante para el checkpoint de reflexión activa.
 */
export async function submitReflectionAnswer(
  challengeId: string,
  selectedOptionId: string
): Promise<SubmitReflectionAnswerResponseDto> {
  const payload: SubmitReflectionAnswerRequestDto = { selectedOptionId };
  const response = await httpClient.post<ApiResponse<SubmitReflectionAnswerResponseDto>>(
    `/challenges/${challengeId}/reflection`,
    payload
  );
  return response.data.data;
}
