import { SemanticGraphDto } from '../../canvas/types/canvas.types';

/**
 * Estado semántico de cada ítem de retroalimentación pedagógica.
 * Alineado con FeedbackItemStatus.cs en backend (serializado en camelCase).
 */
export type FeedbackItemStatus = 'pass' | 'fail' | 'warning' | 'info';

/**
 * Categorías de evaluación de arquitectura AWS según el Well-Architected Framework.
 * Alineado con FeedbackCategory.cs en backend (serializado en camelCase).
 */
export type FeedbackCategory =
  | 'serviceSelection'
  | 'connection'
  | 'architecturePattern'
  | 'availability'
  | 'security'
  | 'performance'
  | 'costOptimization'
  | 'hintPenalty'
  | 'configuration'
  | 'placement'
  | 'networkTopology'
  | 'securityGroup'
  | 'reliability';

/**
 * Diagnóstico individual de acierto, error o advertencia generado por el motor de evaluación.
 * Alineado con FeedbackItem.cs.
 */
export interface FeedbackItemDto {
  status: FeedbackItemStatus;
  category: FeedbackCategory;
  title: string;
  explanation: string;
  penaltyApplied: number;
  relatedComponentIds: string[];
  productionRisk?: string | null;
  wellArchitectedPillar?: string | null;
  formativeRecommendation?: string | null;
}

/**
 * Contenedor general de retroalimentación pedagógica.
 * Alineado con EvaluationFeedback.cs.
 */
export interface EvaluationFeedbackDto {
  summary: string;
  items: FeedbackItemDto[];
  keyConceptsLearned?: string[];
  architecturalTradeoffs?: string | null;
}

/**
 * DTO de solicitud enviado a POST /api/v1/challenges/{id}/evaluate.
 * Alineado con EvaluateArchitectureRequestDto.cs.
 */
export interface EvaluateArchitectureRequestDto {
  graph: SemanticGraphDto;
  hintsUsed: number;
}

/**
 * DTO de respuesta retornado por POST /api/v1/challenges/{id}/evaluate.
 * Alineado con EvaluateArchitectureResponseDto.cs.
 */
export interface EvaluateArchitectureResponseDto {
  score: number;
  passed: boolean;
  isNewHighScore: boolean;
  earnedXP: number;
  currentUserXP: number;
  currentUserLevel: number;
  feedback: EvaluationFeedbackDto;
  attemptId: string;
}

/**
 * DTO de auditoría histórica de un intento previo.
 * Alineado con ChallengeAttemptHistoryDto.cs devuelto por GET /api/v1/challenges/{id}/attempts.
 */
export interface ChallengeAttemptHistoryDto {
  id: string;
  score: number;
  passed: boolean;
  hintsUsed: number;
  createdAt: string;
  graphSubmitted: SemanticGraphDto;
}

/**
 * Resultado de validación rápida en cliente antes de enviar a evaluación.
 */
export interface ClientValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}
