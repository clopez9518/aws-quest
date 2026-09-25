/**
 * Fábrica estandarizada de Query Keys para el módulo de evaluación.
 * Permite invalidaciones atómicas y precisas tras nuevos intentos.
 */
export const evaluationKeys = {
  all: ['evaluation'] as const,
  attemptsRoot: () => [...evaluationKeys.all, 'attempts'] as const,
  attempts: (challengeId: string) => [...evaluationKeys.attemptsRoot(), challengeId] as const
};
