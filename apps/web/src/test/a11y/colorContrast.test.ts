import { describe, it, expect } from 'vitest';

/**
 * Función para calcular la luminancia relativa según WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calcula el ratio de contraste entre dos colores HEX
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Auditoría de Accesibilidad: Verificación de Contraste Cromático WCAG 2.1 AA (RNF-05)', () => {
  const DARK_BG = '#0B0F19';
  const LIGHT_BG = '#FFFFFF';

  it('el texto primario en Dark Mode cumple con el ratio mínimo de 4.5:1', () => {
    const textLight = '#F8FAFC'; // slate-50
    const ratio = getContrastRatio(textLight, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('el texto primario en Light Mode cumple con el ratio mínimo de 4.5:1', () => {
    const textDark = '#0F172A'; // slate-900
    const ratio = getContrastRatio(textDark, LIGHT_BG);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('el texto secundario en Dark Mode cumple con el ratio mínimo de 4.5:1', () => {
    const textMutedDark = '#94A3B8'; // slate-400
    const ratio = getContrastRatio(textMutedDark, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('el texto secundario en Light Mode cumple con el ratio mínimo de 4.5:1', () => {
    const textMutedLight = '#475569'; // slate-600
    const ratio = getContrastRatio(textMutedLight, LIGHT_BG);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('el color de acento AWS Orange (#D97706 en light, #F59E0B en dark) cumple contraste para componentes de UI (>= 3.0:1) y texto en dark (>= 4.5:1)', () => {
    const orangeDarkTheme = '#F59E0B'; // amber-500
    const orangeLightTheme = '#D97706'; // amber-600
    const orangeTextLight = '#B45309'; // amber-700 para texto en blanco (>= 4.5:1)
    
    expect(getContrastRatio(orangeDarkTheme, DARK_BG)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(orangeLightTheme, LIGHT_BG)).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio(orangeTextLight, LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it('los estados de feedback (Pass, Fail, Warning) cumplen ratios de contraste WCAG AA', () => {
    // Feedback Pass
    expect(getContrastRatio('#047857', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // Emerald-700 en blanco
    expect(getContrastRatio('#34D399', '#0B0F19')).toBeGreaterThanOrEqual(4.5); // Emerald-400 en dark

    // Feedback Fail / Error
    expect(getContrastRatio('#BE123C', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // Rose-700 en blanco
    expect(getContrastRatio('#FB7185', '#0B0F19')).toBeGreaterThanOrEqual(4.5); // Rose-400 en dark

    // Feedback Warning
    expect(getContrastRatio('#B45309', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // Amber-700 en blanco
    expect(getContrastRatio('#FBBF24', '#0B0F19')).toBeGreaterThanOrEqual(4.5); // Amber-400 en dark
  });
});
