import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatExactDate } from '../date';

describe('date utilities', () => {
  const baseNow = new Date('2026-09-21T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('debe retornar "Hace un momento" para diferencias menores a 60 segundos', () => {
      const date = new Date(baseNow.getTime() - 30 * 1000).toISOString();
      expect(formatRelativeTime(date)).toBe('Hace un momento');
    });

    it('debe formatear minutos correctamente', () => {
      const date = new Date(baseNow.getTime() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date)).toBe('Hace 5 min');
    });

    it('debe formatear horas en singular y plural', () => {
      const date1 = new Date(baseNow.getTime() - 1 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date1)).toBe('Hace 1 hora');

      const date2 = new Date(baseNow.getTime() - 4 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date2)).toBe('Hace 4 horas');
    });

    it('debe formatear días en singular y plural', () => {
      const date1 = new Date(baseNow.getTime() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date1)).toBe('Hace 1 día');

      const date2 = new Date(baseNow.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(date2)).toBe('Hace 3 días');
    });

    it('debe manejar cadenas de fecha inválidas de forma segura', () => {
      expect(formatRelativeTime('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatExactDate', () => {
    it('debe formatear una fecha válida', () => {
      const formatted = formatExactDate('2026-09-21T12:00:00.000Z');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('debe retornar la cadena original si la fecha es inválida', () => {
      expect(formatExactDate('invalid-date')).toBe('invalid-date');
    });
  });
});
