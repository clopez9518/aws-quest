/**
 * Utilidades para formateo y comparación resiliente de categorías y pilares Well-Architected.
 */

export const PILLAR_DISPLAY_NAMES: Record<string, string> = {
  operationalexcellence: 'Excelencia Operativa',
  security: 'Seguridad',
  reliability: 'Fiabilidad',
  performanceefficiency: 'Rendimiento',
  costoptimization: 'Optimización de Costos',
  sustainability: 'Sostenibilidad',
};

/**
 * Devuelve el nombre legible en español para un pilar Well-Architected.
 */
export function formatPillarLabel(pillar: string | null | undefined): string {
  if (!pillar) return '';
  const clean = pillar.toLowerCase().replace(/[\s_-]/g, '');
  return PILLAR_DISPLAY_NAMES[clean] || pillar;
}

/**
 * Compara dos valores de pilares de forma insensible a mayúsculas, minúsculas, guiones o espacios.
 */
export function isPillarMatching(
  termPillar: string | null | undefined,
  targetPillar: string | null | undefined
): boolean {
  if (!termPillar || !targetPillar) return false;
  const cleanTerm = termPillar.toLowerCase().replace(/[\s_-]/g, '');
  const cleanTarget = targetPillar.toLowerCase().replace(/[\s_-]/g, '');
  return cleanTerm === cleanTarget;
}
