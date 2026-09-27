import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  X,
  Zap,
  ShieldAlert,
  Activity,
  Gauge,
  Sparkles
} from 'lucide-react';
import {
  useTrafficSimulationStore,
  TrafficScenario
} from '../../stores/useTrafficSimulationStore';
import { cn } from '../../../../shared/utils/cn';

export interface TrafficSimulationHUDProps {
  className?: string;
}

const scenarioOptions: {
  id: TrafficScenario;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
}[] = [
  {
    id: 'normal',
    label: 'Normal',
    icon: <Activity className="w-3.5 h-3.5" />,
    activeColor: 'bg-emerald-600 text-white shadow-emerald-500/20'
  },
  {
    id: 'spike',
    label: 'Pico (Spike)',
    icon: <Zap className="w-3.5 h-3.5" />,
    activeColor: 'bg-[#FF9900] text-[#0B0F19] font-bold shadow-glow-amber/20'
  },
  {
    id: 'malicious',
    label: 'Ataque DDoS',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    activeColor: 'bg-rose-600 text-white shadow-rose-600/20'
  },
  {
    id: 'failover',
    label: 'Failover',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    activeColor: 'bg-purple-600 text-white shadow-purple-600/20'
  }
];

export const TrafficSimulationHUD: React.FC<TrafficSimulationHUDProps> = ({
  className
}) => {
  const isSimulating = useTrafficSimulationStore((state) => state.isSimulating);
  const isPaused = useTrafficSimulationStore((state) => state.isPaused);
  const activeScenario = useTrafficSimulationStore((state) => state.activeScenario);
  const simulationSpeed = useTrafficSimulationStore((state) => state.simulationSpeed);
  const metrics = useTrafficSimulationStore((state) => state.metrics);

  const togglePause = useTrafficSimulationStore((state) => state.togglePause);
  const stopSimulation = useTrafficSimulationStore((state) => state.stopSimulation);
  const setScenario = useTrafficSimulationStore((state) => state.setScenario);
  const setSpeed = useTrafficSimulationStore((state) => state.setSpeed);
  const incrementMetrics = useTrafficSimulationStore((state) => state.incrementMetrics);

  // Simulación periódica de métricas de red
  useEffect(() => {
    if (!isSimulating || isPaused) return;

    const interval = setInterval(() => {
      const deliveredCount = activeScenario === 'spike' ? 12 : activeScenario === 'malicious' ? 4 : 6;
      const blockedCount = activeScenario === 'malicious' ? 8 : 0;
      incrementMetrics(deliveredCount, blockedCount);
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, isPaused, activeScenario, simulationSpeed, incrementMetrics]);

  if (!isSimulating) return null;

  return (
    <div
      data-testid="traffic-simulation-hud"
      role="region"
      aria-label="Panel de control de simulación de tráfico"
      className={cn(
        'absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-xl border shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none',
        'bg-[#111827]/95 border-[#374151] text-slate-100',
        className
      )}
    >
      {/* Botón Play / Pausa */}
      <button
        type="button"
        onClick={togglePause}
        aria-label={isPaused ? 'Reanudar simulación' : 'Pausar simulación'}
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg font-bold transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#FF9900] cursor-pointer',
          isPaused
            ? 'bg-[#FF9900] hover:bg-[#FFAC1C] text-[#0B0F19]'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        )}
      >
        {isPaused ? <Play className="w-4 h-4 fill-current ml-0.5" /> : <Pause className="w-4 h-4 fill-current" />}
      </button>

      {/* Divisor */}
      <div className="h-5 w-px bg-[#374151] hidden sm:block" />

      {/* Selector de Escenarios */}
      <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#374151]">
        {scenarioOptions.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setScenario(scenario.id)}
              className={cn(
                'flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all focus:outline-none cursor-pointer',
                isActive
                  ? cn(scenario.activeColor, 'shadow-md')
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {scenario.icon}
              <span className="hidden md:inline">{scenario.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divisor */}
      <div className="h-5 w-px bg-[#374151] hidden sm:block" />

      {/* Selector de Velocidad */}
      <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#374151] text-xs font-mono font-bold">
        {[1, 2, 4].map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setSpeed(speed)}
            className={cn(
              'px-2 py-0.5 rounded transition-all focus:outline-none cursor-pointer',
              simulationSpeed === speed
                ? 'bg-[#1F2937] text-white border border-[#374151] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Métricas en Vivo */}
      <div className="hidden lg:flex items-center space-x-3 px-3 py-1 rounded-lg bg-[#0B0F19] border border-[#374151] text-[11px] font-mono">
        <div className="flex items-center space-x-1 text-slate-300">
          <Gauge className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{metrics.requestsSent} req</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
          <span>✓ {metrics.requestsDelivered}</span>
        </div>
        {metrics.requestsBlocked > 0 && (
          <div className="flex items-center space-x-1 text-rose-400 font-semibold">
            <span>✕ {metrics.requestsBlocked} drop</span>
          </div>
        )}
      </div>

      {/* Botón Cerrar Simulación */}
      <button
        type="button"
        onClick={stopSimulation}
        aria-label="Detener simulación de tráfico"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1F2937] transition-colors ml-1 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

