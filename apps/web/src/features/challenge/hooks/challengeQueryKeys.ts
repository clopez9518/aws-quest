/**
 * Fábrica de claves de consulta para TanStack Query en el módulo de Desafíos.
 */
export const challengeKeys = {
  all: ['challenge'] as const,
  details: () => [...challengeKeys.all, 'detail'] as const,
  detail: (id: string) => [...challengeKeys.details(), id] as const,
  attempts: (id: string) => [...challengeKeys.all, 'attempts', id] as const,
};
