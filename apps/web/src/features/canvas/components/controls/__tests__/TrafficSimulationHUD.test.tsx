import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TrafficSimulationHUD } from '../TrafficSimulationHUD';
import { useTrafficSimulationStore } from '../../../stores/useTrafficSimulationStore';

describe('TrafficSimulationHUD Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useTrafficSimulationStore.getState().stopSimulation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no debe renderizarse si la simulación no está activa', () => {
    render(<TrafficSimulationHUD />);
    expect(screen.queryByTestId('traffic-simulation-hud')).not.toBeInTheDocument();
  });

  it('debe renderizarse cuando la simulación está activa', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    expect(screen.getByTestId('traffic-simulation-hud')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /panel de control de simulación de tráfico/i })).toBeInTheDocument();
  });

  it('debe permitir pausar y reanudar la simulación', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    const pauseButton = screen.getByLabelText(/pausar simulación/i);
    expect(pauseButton).toBeInTheDocument();

    fireEvent.click(pauseButton);
    expect(useTrafficSimulationStore.getState().isPaused).toBe(true);
    expect(screen.getByLabelText(/reanudar simulación/i)).toBeInTheDocument();

    const resumeButton = screen.getByLabelText(/reanudar simulación/i);
    fireEvent.click(resumeButton);
    expect(useTrafficSimulationStore.getState().isPaused).toBe(false);
  });

  it('debe cambiar de escenario al hacer clic en los botones correspondientes', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    const ddosButton = screen.getByRole('button', { name: /ataque ddos/i });
    fireEvent.click(ddosButton);
    expect(useTrafficSimulationStore.getState().activeScenario).toBe('malicious');

    const spikeButton = screen.getByRole('button', { name: /pico \(spike\)/i });
    fireEvent.click(spikeButton);
    expect(useTrafficSimulationStore.getState().activeScenario).toBe('spike');
  });

  it('debe cambiar la velocidad de simulación', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    const speed4xButton = screen.getByRole('button', { name: '4x' });
    fireEvent.click(speed4xButton);
    expect(useTrafficSimulationStore.getState().simulationSpeed).toBe(4);
  });

  it('debe cerrar la simulación al hacer clic en el botón de cerrar', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    const closeButton = screen.getByLabelText(/detener simulación de tráfico/i);
    fireEvent.click(closeButton);
    expect(useTrafficSimulationStore.getState().isSimulating).toBe(false);
  });

  it('debe actualizar métricas periódicamente mientras está activo', () => {
    useTrafficSimulationStore.getState().startSimulation();
    render(<TrafficSimulationHUD />);

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const metrics = useTrafficSimulationStore.getState().metrics;
    expect(metrics.requestsSent).toBeGreaterThan(0);
    expect(metrics.requestsDelivered).toBeGreaterThan(0);
  });
});
