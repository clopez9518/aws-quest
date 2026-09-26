import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';
import { SemanticGraphDto, ServicePaletteItem } from '../../canvas/types/canvas.types';

/**
 * Pista desbloqueada devuelta por la API.
 */
export interface UnlockedHintDto {
  orderIndex: number;
  text: string;
  penaltyApplied: number;
}

/**
 * Resumen de pistas sanitizado por el backend (anti-cheat).
 */
export interface HintsSummaryDto {
  totalHints: number;
  unlockedCount: number;
  unlockedHints: UnlockedHintDto[];
}

/**
 * DTO de servicio autorizado proveniente del backend.
 */
export interface ChallengeAllowedServiceDto {
  code: string;
  name: string;
  category: string;
  shortDescription?: string | null;
  iconUrl: string;
  maxInstances?: number | null;
  isDistractor: boolean;
}

/**
 * Componente o concepto clave en la micro-cápsula de contexto.
 */
export interface BriefingKeyComponentDto {
  title: string;
  description: string;
  serviceCode?: string | null;
  category?: 'concept' | 'service' | string | null;
  slug?: string | null;
}

/**
 * Micro-cápsula de contexto y briefing pre-desafío.
 */
export interface ChallengeBriefingDto {
  keyConcept: string;
  businessScenario: string;
  learningObjective: string;
  keyTakeaways: string[];
  keyComponents?: BriefingKeyComponentDto[];
  estimatedReadTime?: string;
}

/**
 * Pilares del AWS Well-Architected Framework.
 */
export type WellArchitectedPillar =
  | 'OperationalExcellence'
  | 'Security'
  | 'Reliability'
  | 'PerformanceEfficiency'
  | 'CostOptimization'
  | 'Sustainability';

/**
 * Opción pública de respuesta para el checkpoint de reflexión (sanitizada anti-cheat).
 */
export interface ReflectionOptionPublicDto {
  id: string;
  text: string;
}

/**
 * Checkpoint de reflexión activa para el desafío.
 */
export interface ChallengeReflectionPromptDto {
  question: string;
  pillar: WellArchitectedPillar;
  bonusXP: number;
  options: ReflectionOptionPublicDto[];
  isCompleted?: boolean;
  selectedOptionId?: string | null;
}

/**
 * Payload para enviar la respuesta del checkpoint de reflexión.
 */
export interface SubmitReflectionAnswerRequestDto {
  selectedOptionId: string;
}

/**
 * Explicación formativa de una opción individual tras enviar la respuesta.
 */
export interface ReflectionOptionExplanationDto {
  id: string;
  isCorrect: boolean;
  explanation: string;
}

/**
 * Respuesta del servidor tras evaluar la respuesta de reflexión.
 */
export interface SubmitReflectionAnswerResponseDto {
  isCorrect: boolean;
  bonusXpEarned: number;
  explanation: string;
  correctOptionId: string;
  currentUserXP: number;
  currentUserLevel: number;
  allExplanations: ReflectionOptionExplanationDto[];
}

/**
 * Respuesta canónica del backend para GET /api/v1/challenges/{id}.
 */
export interface ChallengeDetailResponseDto {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  allowedServices: ChallengeAllowedServiceDto[];
  hintsSummary: HintsSummaryDto;
  briefing?: ChallengeBriefingDto | null;
  reflectionPrompt?: ChallengeReflectionPromptDto | null;
  lastAttemptGraph?: SemanticGraphDto | null;
  initialGraph?: SemanticGraphDto | null;
}

/**
 * Respuesta canónica del backend para POST /api/v1/challenges/{id}/hints/unlock.
 */
export interface UnlockHintResponseDto {
  unlockedHint: UnlockedHintDto;
  totalHintsUnlocked: number;
  totalPenaltyAccumulated: number;
}

/**
 * Requisito o restricción técnica declarativa para la UI de contexto.
 */
export interface ArchitectureRequirement {
  id: string;
  type: 'required_service' | 'connection' | 'anti_pattern' | 'instance_limit';
  title: string;
  description: string;
}

/**
 * Pista individual adaptada para el componente HintDrawer.
 */
export interface ChallengeHint {
  orderIndex: number;
  text?: string | null;
  penaltyPoints: number;
  isUnlocked: boolean;
}

/**
 * Resumen de pistas consumido por el workspace.
 */
export interface ChallengeHintsSummary {
  totalHints: number;
  unlockedCount: number;
  hints: ChallengeHint[];
}

/**
 * Modelo completo del detalle del desafío para el Workspace.
 */
export interface ChallengeDetail {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  allowedServices: ServicePaletteItem[];
  hintsSummary: ChallengeHintsSummary;
  briefing?: ChallengeBriefingDto | null;
  reflectionPrompt?: ChallengeReflectionPromptDto | null;
  lastAttemptGraph?: SemanticGraphDto | null;
  initialGraph?: SemanticGraphDto | null;
  requirements?: ArchitectureRequirement[];
}
