import { create } from 'zustand';

export type TrafficScenario = 'normal' | 'spike' | 'malicious' | 'failover';

export interface TrafficMetrics {
  requestsSent: number;
  requestsDelivered: number;
  requestsBlocked: number;
  avgLatencyMs: number;
}

export interface TrafficSimulationState {
  isSimulating: boolean;
  isPaused: boolean;
  activeScenario: TrafficScenario;
  simulationSpeed: number; // 1, 2, 4
  metrics: TrafficMetrics;

  // Acciones
  startSimulation: () => void;
  stopSimulation: () => void;
  togglePause: () => void;
  setScenario: (scenario: TrafficScenario) => void;
  setSpeed: (speed: number) => void;
  incrementMetrics: (delivered: number, blocked: number) => void;
  resetMetrics: () => void;
}

const initialMetrics: TrafficMetrics = {
  requestsSent: 0,
  requestsDelivered: 0,
  requestsBlocked: 0,
  avgLatencyMs: 24
};

export const useTrafficSimulationStore = create<TrafficSimulationState>((set) => ({
  isSimulating: false,
  isPaused: false,
  activeScenario: 'normal',
  simulationSpeed: 1,
  metrics: { ...initialMetrics },

  startSimulation: () =>
    set({
      isSimulating: true,
      isPaused: false,
      metrics: { ...initialMetrics }
    }),

  stopSimulation: () =>
    set({
      isSimulating: false,
      isPaused: false,
      metrics: { ...initialMetrics }
    }),

  togglePause: () =>
    set((state) => ({
      isPaused: !state.isPaused
    })),

  setScenario: (scenario: TrafficScenario) =>
    set((state) => ({
      activeScenario: scenario,
      metrics: {
        ...state.metrics,
        avgLatencyMs: scenario === 'spike' ? 68 : scenario === 'malicious' ? 12 : 24
      }
    })),

  setSpeed: (speed: number) =>
    set({
      simulationSpeed: speed
    }),

  incrementMetrics: (delivered: number, blocked: number) =>
    set((state) => {
      const totalSent = state.metrics.requestsSent + delivered + blocked;
      return {
        metrics: {
          ...state.metrics,
          requestsSent: totalSent,
          requestsDelivered: state.metrics.requestsDelivered + delivered,
          requestsBlocked: state.metrics.requestsBlocked + blocked
        }
      };
    }),

  resetMetrics: () =>
    set({
      metrics: { ...initialMetrics }
    })
}));
