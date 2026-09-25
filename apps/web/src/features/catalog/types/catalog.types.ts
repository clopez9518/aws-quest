/**
 * Niveles de dificultad del desafío.
 */
export type DifficultyLevel = 'easy' | 'intermediate' | 'hard' | 'integrator';

/**
 * Modalidad de resolución del desafío.
 */
export type ChallengeMode = 'builder' | 'fixArchitecture';

/**
 * Estado de progreso del usuario en un desafío específico.
 */
export type ProgressStatus = 'notStarted' | 'inProgress' | 'completed';

/**
 * Resumen del progreso y mejor puntuación del usuario en un desafío.
 */
export interface ChallengeProgressSummaryDto {
  status: ProgressStatus;
  highScore: number;
  hintsUsed: number;
  completedAt?: string | null;
}

/**
 * DTO de desafío en la vista de catálogo.
 */
export interface CatalogChallengeDto {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  requiredXP: number;
  orderIndex: number;
  isLocked: boolean;
  lockReason?: string | null;
  userProgress?: ChallengeProgressSummaryDto | null;
}

/**
 * DTO de unidad temática con sus desafíos ordenados.
 */
export interface UnitResponseDto {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  challenges: CatalogChallengeDto[];
}
