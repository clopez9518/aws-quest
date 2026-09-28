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
    activeColor: 'bg-[#FF9900] text-slate-950 font-bold shadow-glow-amber/20'
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
        'absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none',
        'bg-white/95 dark:bg-[#111827]/95 border-slate-200 dark:border-[#374151] text-slate-900 dark:text-slate-100',
        className
      )}
    >
      {/* Botón Play / Pausa */}
      <button
        type="button"
        onClick={togglePause}
        aria-label={isPaused ? 'Reanudar simulación' : 'Pausar simulación'}
        className={cn(
          'p-1.5 rounded-xl border transition-colors cursor-pointer',
          isPaused
            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600/60 text-amber-700 dark:text-amber-300'
            : 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/60 text-emerald-700 dark:text-emerald-300'
        )}
        title={isPaused ? 'Reanudar simulación' : 'Pausar simulación'}
      >
        {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
      </button>

      {/* Selectores de Escenario */}
      <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#0B0F19] p-0.5 border border-slate-200 dark:border-[#374151]">
        {scenarioOptions.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setScenario(scenario.id)}
              className={cn(
                'px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer',
                isActive
                  ? scenario.activeColor
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              {scenario.icon}
              <span className="hidden sm:inline">{scenario.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selector de Velocidad */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] text-[10px] font-mono">
        <Gauge className="w-3 h-3 text-slate-500 dark:text-slate-400" />
        {[1, 2, 4].map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setSpeed(speed)}
            className={cn(
              'px-1.5 py-0.5 rounded transition-colors font-bold cursor-pointer',
              simulationSpeed === speed
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Métricas en Vivo */}
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] text-[11px] font-mono">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 dark:text-slate-400 font-sans">Entregados:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.requestsDelivered}</span>
        </div>
        {metrics.requestsBlocked > 0 && (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-[#374151]">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-500 dark:text-slate-400 font-sans">Bloqueados:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{metrics.requestsBlocked}</span>
          </div>
        )}
      </div>

      {/* Botón Cerrar / Finalizar Simulación */}
      <button
        type="button"
        onClick={stopSimulation}
        aria-label="Detener simulación de tráfico"
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors cursor-pointer"
        title="Detener simulación de tráfico"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
