import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Lightbulb, Send, Zap, BookOpen } from 'lucide-react';
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
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
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
    text: 'text-emerald-900 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800'
  },
  intermediate: {
    label: 'Intermedio',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-900 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800'
  },
  hard: {
    label: 'Difícil',
    bg: 'bg-orange-100 dark:bg-orange-950/60',
    text: 'text-orange-900 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-800'
  },
  integrator: {
    label: 'Integrador',
    bg: 'bg-purple-100 dark:bg-purple-950/60',
    text: 'text-purple-900 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800'
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
  isSimulating,
  onToggleSimulation,
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
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Sección Izquierda: Retorno al catálogo y Título del Desafío */}
      <div className="flex items-center space-x-3 min-w-0">
        <Link
          to="/catalog"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
          aria-label="Volver al catálogo"
          title="Volver al catálogo de desafíos"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center space-x-2.5 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>

          <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
            >
              {diff.label}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
              {mode === 'fixArchitecture' ? 'Reparar' : 'Builder'}
            </span>
            <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold pl-1">
              <Zap className="w-3.5 h-3.5" />
              <span>+{baseXP} XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Cronómetro, Botón Pistas y Botón Enviar */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Cronómetro de sesión */}
        <div
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-mono text-xs"
          title="Tiempo transcurrido en el desafío"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>

        {/* Botón Simular Tráfico */}
        {onToggleSimulation && (
          <button
            data-testid="traffic-simulation-toggle-button"
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isSimulating
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            aria-label={isSimulating ? 'Detener simulación de tráfico' : 'Iniciar simulación de tráfico'}
            title="Simular flujo dinámico de paquetes y tráfico en el canvas"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span className="hidden md:inline">{isSimulating ? 'Simulando' : 'Simular'}</span>
          </button>
        )}

        {/* Botón Briefing */}
        {onOpenBriefing && (
          <button
            data-testid="briefing-trigger-button"
            type="button"
            onClick={onOpenBriefing}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            aria-label="Abrir briefing"
            title="Ver micro-cápsula de contexto y objetivos"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Briefing</span>
          </button>
        )}

        {/* Botón Pistas */}
        <button
          data-testid="hints-trigger-button"
          type="button"
          onClick={onOpenHints}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors"
          aria-label="Abrir pistas"
          title="Ver pistas disponibles"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pistas:</span>
          <span className="font-mono">
            {unlockedHintsCount}/{totalHints}
          </span>
        </button>

        {/* Botón Enviar Solución */}
        <button
          data-testid="submit-solution-button"
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            canSubmit
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Enviar solución"
          title={canSubmit ? 'Enviar arquitectura a evaluación' : 'Agrega al menos un componente al canvas para evaluar'}
        >
          {isSubmitting ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>
            {isSubmitting
              ? 'Evaluando...'
              : `Enviar solución${nodeCount > 0 ? ` (${nodeCount})` : ''}`}
          </span>
        </button>
      </div>
    </header>
  );
}
