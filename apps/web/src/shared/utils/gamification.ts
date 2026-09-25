export const XP_PER_LEVEL = 150;

export interface XpProgress {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  percentage: number;
  totalXp: number;
}

/**
 * Calcula el nivel de usuario a partir de su experiencia total acumulada:
 * Nivel = 1 + floor(TotalXP / 150)
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return 1 + Math.floor(totalXp / XP_PER_LEVEL);
}

/**
 * Desglosa el progreso de XP del usuario para renderizar medidores y barras de progreso.
 */
export function getXpProgress(totalXp: number): XpProgress {
  const normalizedXp = Math.max(0, totalXp);
  const level = calculateLevel(normalizedXp);
  const currentLevelXp = normalizedXp % XP_PER_LEVEL;
  const percentage = Math.min(100, Math.floor((currentLevelXp / XP_PER_LEVEL) * 100));

  return {
    level,
    currentLevelXp,
    xpForNextLevel: XP_PER_LEVEL,
    percentage,
    totalXp: normalizedXp
  };
}
