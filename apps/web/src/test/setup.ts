import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';

// Limpiar localStorage antes de cada test
beforeEach(() => {
  localStorage.clear();
});

// Mock de ResizeObserver para componentes de React Flow en JSDOM
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}
