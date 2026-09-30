import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Lightbulb, Send, Zap, BookOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';

interface WorkspaceHeaderProps {
  title: string;
  difficulty: DifficultyLevel;
  mode: ChallengeMode;
  baseXP: number;
  totalHints: number;
  unlockedHintsCount: number;
  nodeCount: number;
  hasBriefing?: boolean;
  onOpenBriefing?: () => void;
  showSimulation?: boolean;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  isLeftPanelCollapsed?: boolean;
  onToggleLeftPanel?: () => void;
  onOpenHints: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const difficultyBadges: Record<
  DifficultyLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  easy: {
    label: 'Fácil',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-700/50'
  },
  intermediate: {
    label: 'Intermedio',
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    text: 'text-sky-800 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-700/50'
  },
  hard: {
    label: 'Difícil',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700/50'
  },
  integrator: {
    label: 'Integrador',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-800 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-700/50'
  }
};

export function WorkspaceHeader({
  title,
  difficulty,
  mode,
  baseXP,
  totalHints,
  unlockedHintsCount,
  nodeCount,
  hasBriefing,
  onOpenBriefing,
  showSimulation = false,
  isSimulating,
  onToggleSimulation,
  isLeftPanelCollapsed = false,
  onToggleLeftPanel,
  onOpenHints,
  onSubmit,
  isSubmitting = false
}: WorkspaceHeaderProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const diff = difficultyBadges[difficulty] || difficultyBadges.easy;
  const canSubmit = nodeCount > 0 && !isSubmitting;

  return (
    <header className="h-14 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#374151] px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 select-none shadow-xs">
      {/* Sección Izquierda: Retorno al catálogo y Título del Desafío */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <Link
          to="/catalog"
          className="p-1.5 rounded-xl border border-slate-200 dark:border-[#374151] hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
          aria-label="Volver al catálogo"
          title="Volver al catálogo de desafíos"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {onToggleLeftPanel && (
          <button
            type="button"
            onClick={onToggleLeftPanel}
            aria-label={isLeftPanelCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
            title={isLeftPanelCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-[#374151] hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0 cursor-pointer hidden md:flex items-center justify-center"
          >
            {isLeftPanelCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#FF9900]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {title}
            </h1>
            <span
              className={`hidden xs:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
            >
              {diff.label}
            </span>
            <span className={`hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold border ${
              mode === 'fixArchitecture'
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
                : 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#374151]'
            }`}>
              {mode === 'fixArchitecture' ? 'Reparar' : 'Builder'}
            </span>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Micro-cápsula, Simulación, Pistas, Timer y Evaluación */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Micro-Cápsula de Contexto (Briefing) */}
        {(hasBriefing ?? Boolean(onOpenBriefing)) && onOpenBriefing && (
          <button
            type="button"
            data-testid="briefing-button"
            onClick={onOpenBriefing}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Abrir Micro-Cápsula de Contexto y Objetivos"
            aria-label="Abrir briefing"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF9900]" />
            <span className="hidden sm:inline">Briefing</span>
          </button>
        )}

        {/* Simulador de Tráfico Táctico (Oculto en UI por ahora) */}
        {showSimulation && onToggleSimulation && (
          <button
            type="button"
            data-testid="traffic-simulation-toggle"
            onClick={onToggleSimulation}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              isSimulating
                ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-400 dark:border-sky-500 text-sky-800 dark:text-sky-300 shadow-glow-cyan/20 animate-pulse'
                : 'bg-slate-100 dark:bg-[#1F2937] border-slate-200 dark:border-[#374151] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#262A35]'
            }`}
            title="Simular flujo de tráfico de red en vivo"
            aria-label={isSimulating ? 'Detener simulación de tráfico' : 'Iniciar simulación de tráfico'}
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-sky-600 dark:text-[#38BDF8] fill-current' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Simulando' : 'Simular'}</span>
          </button>
        )}

        {/* Cronómetro */}
        <div
          data-testid="workspace-timer"
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] text-xs font-mono text-slate-700 dark:text-slate-300"
          title="Tiempo transcurrido en el desafío"
        >
          <Clock className="w-3.5 h-3.5 text-[#FF9900]" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>

        {/* Recompensa XP Base */}
        <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-xs font-mono font-bold text-amber-800 dark:text-[#FF9900]">
          <span>+{baseXP} XP</span>
        </div>

        {/* Botón de Pistas */}
        <button
          type="button"
          data-testid="hints-button"
          onClick={onOpenHints}
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            unlockedHintsCount > 0
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600/60 text-amber-800 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-[#1F2937] border-slate-200 dark:border-[#374151] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#262A35]'
          }`}
          title="Ver pistas disponibles (-puntos)"
          aria-label="Abrir pistas"
        >
          <Lightbulb className={`w-3.5 h-3.5 ${unlockedHintsCount > 0 ? 'text-amber-600 dark:text-amber-400 fill-current' : 'text-slate-400'}`} />
          <span>Pistas</span>
          <span className="font-mono text-[10px] bg-white dark:bg-[#0B0F19] px-1 rounded border border-slate-200 dark:border-[#374151]">
            {unlockedHintsCount}/{totalHints}
          </span>
        </button>

        {/* Botón Principal de Validación / Evaluación */}
        <button
          type="button"
          data-testid="evaluate-solution-button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:from-amber-600 active:to-amber-700 text-slate-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-200 dark:bg-[#1F2937] text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-[#374151] cursor-not-allowed opacity-60'
          }`}
          title={nodeCount === 0 ? 'Agrega al menos un servicio al canvas para evaluar' : 'Enviar arquitectura a evaluación'}
          aria-label="Enviar solución"
        >
          <Send className="w-3.5 h-3.5 fill-current" />
          <span>{isSubmitting ? 'Evaluando...' : nodeCount > 0 ? `Enviar solución (${nodeCount})` : 'Enviar solución'}</span>
        </button>
      </div>
    </header>
  );
}
