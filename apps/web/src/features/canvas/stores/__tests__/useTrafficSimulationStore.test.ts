import { describe, it, expect, beforeEach } from 'vitest';
import { useTrafficSimulationStore } from '../useTrafficSimulationStore';

describe('useTrafficSimulationStore', () => {
  beforeEach(() => {
    useTrafficSimulationStore.getState().stopSimulation();
  });

  it('debe inicializarse con los valores por defecto', () => {
    const state = useTrafficSimulationStore.getState();
    expect(state.isSimulating).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.activeScenario).toBe('normal');
    expect(state.simulationSpeed).toBe(1);
    expect(state.metrics).toEqual({
      requestsSent: 0,
      requestsDelivered: 0,
      requestsBlocked: 0,
      avgLatencyMs: 24
    });
  });

  it('debe iniciar y detener la simulación', () => {
    const store = useTrafficSimulationStore.getState();
    store.startSimulation();
    expect(useTrafficSimulationStore.getState().isSimulating).toBe(true);
    expect(useTrafficSimulationStore.getState().isPaused).toBe(false);

    useTrafficSimulationStore.getState().stopSimulation();
    expect(useTrafficSimulationStore.getState().isSimulating).toBe(false);
    expect(useTrafficSimulationStore.getState().isPaused).toBe(false);
  });

  it('debe pausar y reanudar la simulación', () => {
    const store = useTrafficSimulationStore.getState();
    store.startSimulation();
    expect(useTrafficSimulationStore.getState().isPaused).toBe(false);

    useTrafficSimulationStore.getState().togglePause();
    expect(useTrafficSimulationStore.getState().isPaused).toBe(true);

    useTrafficSimulationStore.getState().togglePause();
    expect(useTrafficSimulationStore.getState().isPaused).toBe(false);
  });

  it('debe cambiar el escenario activo y actualizar la latencia esperada', () => {
    const store = useTrafficSimulationStore.getState();
    store.startSimulation();

    store.setScenario('malicious');
    expect(useTrafficSimulationStore.getState().activeScenario).toBe('malicious');
    expect(useTrafficSimulationStore.getState().metrics.avgLatencyMs).toBe(12);

    store.setScenario('spike');
    expect(useTrafficSimulationStore.getState().activeScenario).toBe('spike');
    expect(useTrafficSimulationStore.getState().metrics.avgLatencyMs).toBe(68);

    store.resetMetrics();
    expect(useTrafficSimulationStore.getState().metrics).toEqual({
      requestsSent: 0,
      requestsDelivered: 0,
      requestsBlocked: 0,
      avgLatencyMs: 24
    });
  });

  it('debe cambiar la velocidad de simulación', () => {
    const store = useTrafficSimulationStore.getState();
    store.setSpeed(2);
    expect(useTrafficSimulationStore.getState().simulationSpeed).toBe(2);

    store.setSpeed(4);
    expect(useTrafficSimulationStore.getState().simulationSpeed).toBe(4);
  });

  it('debe acumular métricas correctamente', () => {
    const store = useTrafficSimulationStore.getState();
    store.incrementMetrics(10, 3);
    const metrics = useTrafficSimulationStore.getState().metrics;
    expect(metrics.requestsDelivered).toBe(10);
    expect(metrics.requestsBlocked).toBe(3);
    expect(metrics.requestsSent).toBe(13);

    store.incrementMetrics(5, 1);
    const nextMetrics = useTrafficSimulationStore.getState().metrics;
    expect(nextMetrics.requestsDelivered).toBe(15);
    expect(nextMetrics.requestsBlocked).toBe(4);
    expect(nextMetrics.requestsSent).toBe(19);
  });
});
