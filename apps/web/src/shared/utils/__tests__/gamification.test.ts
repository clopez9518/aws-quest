import { describe, it, expect } from 'vitest';
import { calculateLevel, getXpProgress, XP_PER_LEVEL } from '../gamification';

describe('gamification utils', () => {
  it('calculateLevel debe calcular correctamente el nivel en base a XP_PER_LEVEL (150)', () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(-50)).toBe(1);
    expect(calculateLevel(100)).toBe(1);
    expect(calculateLevel(149)).toBe(1);
    expect(calculateLevel(150)).toBe(2);
    expect(calculateLevel(299)).toBe(2);
    expect(calculateLevel(300)).toBe(3);
    expect(calculateLevel(450)).toBe(4);
  });

  it('getXpProgress debe desglosar nivel, XP actual del nivel y porcentaje exacto', () => {
    const p0 = getXpProgress(0);
    expect(p0.level).toBe(1);
    expect(p0.currentLevelXp).toBe(0);
    expect(p0.xpForNextLevel).toBe(XP_PER_LEVEL);
    expect(p0.percentage).toBe(0);

    const p75 = getXpProgress(75);
    expect(p75.level).toBe(1);
    expect(p75.currentLevelXp).toBe(75);
    expect(p75.percentage).toBe(50);

    const p225 = getXpProgress(225);
    expect(p225.level).toBe(2);
    expect(p225.currentLevelXp).toBe(75);
    expect(p225.percentage).toBe(50);

    const p300 = getXpProgress(300);
    expect(p300.level).toBe(3);
    expect(p300.currentLevelXp).toBe(0);
    expect(p300.percentage).toBe(0);
  });
});
