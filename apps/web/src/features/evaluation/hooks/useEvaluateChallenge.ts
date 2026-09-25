import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluateArchitecture } from '../api/evaluationApi';
import { evaluationKeys } from './evaluationQueryKeys';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  FeedbackItemDto
} from '../types/evaluation.types';
import { challengeKeys } from '../../challenge/hooks/challengeQueryKeys';
import { catalogKeys } from '../../catalog/hooks/catalogQueryKeys';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useCanvasStore } from '../../canvas/stores/useCanvasStore';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

export interface UseEvaluateChallengeOptions {
  onSuccess?: (data: EvaluateArchitectureResponseDto) => void;
  onError?: (error: ApiHttpError) => void;
  autoApplyVisualFeedback?: boolean;
}

/**
 * Función auxiliar para colorear los nodos en el canvas en función de los diagnósticos pedagógicos.
 */
export function applyFeedbackToCanvas(feedbackItems: FeedbackItemDto[]): void {
  const canvasStore = useCanvasStore.getState();

  // Reiniciar estados visuales previos
  canvasStore.resetVisualStatuses();

  // Mapear de forma prioritaria: Errores (fail) > Advertencias (warning) > Aciertos (pass)
  feedbackItems.forEach((item) => {
    if (!item.relatedComponentIds || item.relatedComponentIds.length === 0) return;

    let nodeStatus: 'pass' | 'error' | 'warning' | 'default' = 'default';
    if (item.status === 'fail') nodeStatus = 'error';
    else if (item.status === 'warning') nodeStatus = 'warning';
    else if (item.status === 'pass') nodeStatus = 'pass';

    if (nodeStatus !== 'default') {
      item.relatedComponentIds.forEach((componentId) => {
        canvasStore.setNodeVisualStatus(componentId, nodeStatus, item.explanation);
      });
    }
  });
}

/**
 * Hook reactivo para evaluar una arquitectura contra el motor de reglas del backend.
 * Sincroniza automáticamente la gamificación (XP y nivel) en Zustand, actualiza
 * el feedback cromático en los nodos del canvas e invalida las cachés relevantes.
 * 
 * @param challengeId Identificador del desafío activo.
 * @param options Callbacks y opciones de comportamiento.
 */
export function useEvaluateChallenge(
  challengeId: string,
  options?: UseEvaluateChallengeOptions
) {
  const queryClient = useQueryClient();
  const autoApplyFeedback = options?.autoApplyVisualFeedback ?? true;

  return useMutation<EvaluateArchitectureResponseDto, ApiHttpError, EvaluateArchitectureRequestDto>({
    mutationFn: (payload: EvaluateArchitectureRequestDto) =>
      evaluateArchitecture(challengeId, payload),

    onSuccess: (data: EvaluateArchitectureResponseDto) => {
      // 1. Sincronizar automáticamente XP y Nivel en el store global de autenticación (RN-10)
      if (data.currentUserXP !== undefined && data.currentUserLevel !== undefined) {
        useAuthStore.getState().updateUser({
          totalXP: data.currentUserXP,
          level: data.currentUserLevel
        });
      }

      // 2. Aplicar feedback visual cromático a los nodos y aristas del canvas si está habilitado (RN-12)
      if (autoApplyFeedback && data.feedback?.items) {
        applyFeedbackToCanvas(data.feedback.items);
      }

      // 3. Invalidar consultas de catálogo para reflejar nuevos puntajes y estados completados (RN-02)
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });

      // 4. Invalidar detalle del desafío para refrescar HighScore y última arquitectura (CU-02)
      queryClient.invalidateQueries({ queryKey: challengeKeys.detail(challengeId) });

      // 5. Invalidar el historial de intentos para la pestaña de auditoría (CU-05)
      queryClient.invalidateQueries({ queryKey: evaluationKeys.attempts(challengeId) });

      // 6. Ejecutar callback del llamador
      options?.onSuccess?.(data);
    },

    onError: (error: ApiHttpError) => {
      options?.onError?.(error);
    }
  });
}
