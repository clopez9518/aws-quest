import { describe, it, expect } from 'vitest';
import { formatPillarLabel, isPillarMatching } from '../dictionaryFormatters';

describe('dictionaryFormatters', () => {
  describe('formatPillarLabel', () => {
    it('debe devolver el nombre en español para diferentes formatos de capitalización', () => {
      expect(formatPillarLabel('CostOptimization')).toBe('Optimización de Costos');
      expect(formatPillarLabel('costOptimization')).toBe('Optimización de Costos');
      expect(formatPillarLabel('cost_optimization')).toBe('Optimización de Costos');
      expect(formatPillarLabel('Security')).toBe('Seguridad');
      expect(formatPillarLabel('security')).toBe('Seguridad');
      expect(formatPillarLabel('Reliability')).toBe('Fiabilidad');
      expect(formatPillarLabel('PerformanceEfficiency')).toBe('Rendimiento');
      expect(formatPillarLabel('OperationalExcellence')).toBe('Excelencia Operativa');
      expect(formatPillarLabel('Sustainability')).toBe('Sostenibilidad');
    });

    it('debe devolver string vacío para null o undefined', () => {
      expect(formatPillarLabel(null)).toBe('');
      expect(formatPillarLabel(undefined)).toBe('');
    });
  });

  describe('isPillarMatching', () => {
    it('debe comparar valores de pilares de forma insensible a mayúsculas y minúsculas', () => {
      expect(isPillarMatching('CostOptimization', 'costOptimization')).toBe(true);
      expect(isPillarMatching('costOptimization', 'CostOptimization')).toBe(true);
      expect(isPillarMatching('security', 'Security')).toBe(true);
      expect(isPillarMatching('PerformanceEfficiency', 'performanceefficiency')).toBe(true);
      expect(isPillarMatching('CostOptimization', 'Security')).toBe(false);
    });

    it('debe devolver false si alguno es null o undefined', () => {
      expect(isPillarMatching(null, 'Security')).toBe(false);
      expect(isPillarMatching('Security', null)).toBe(false);
      expect(isPillarMatching(null, null)).toBe(false);
    });
  });
});
