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
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-700/50'
  },
  intermediate: {
    label: 'Intermedio',
    bg: 'bg-sky-950/60',
    text: 'text-sky-400',
    border: 'border-sky-700/50'
  },
  hard: {
    label: 'Difícil',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-700/50'
  },
  integrator: {
    label: 'Integrador',
    bg: 'bg-purple-950/60',
    text: 'text-purple-400',
    border: 'border-purple-700/50'
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
    <header className="h-14 bg-[#111827] border-b border-[#374151] px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Sección Izquierda: Retorno al catálogo y Título del Desafío */}
      <div className="flex items-center space-x-3 min-w-0">
        <Link
          to="/catalog"
          className="p-1.5 rounded-lg border border-[#374151] hover:bg-[#1F2937] text-slate-400 hover:text-slate-100 transition-colors shrink-0"
          aria-label="Volver al catálogo"
          title="Volver al catálogo de desafíos"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center space-x-2.5 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>

          <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
            >
              {diff.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
              mode === 'fixArchitecture'
                ? 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                : 'bg-[#1F2937] text-slate-300 border-[#374151]'
            }`}>
              {mode === 'fixArchitecture' ? 'Reparar' : 'Builder'}
            </span>
            <span className="flex items-center space-x-1 text-[#FF9900] text-xs font-mono font-bold pl-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>+{baseXP} XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Cronómetro, Botón Pistas y Botón Enviar */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Cronómetro de sesión */}
        <div
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0B0F19] border border-[#374151] text-slate-300 font-mono text-xs"
          title="Tiempo transcurrido en el desafío"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>

        {/* Botón Simular Tráfico */}
        {onToggleSimulation && (
          <button
            data-testid="traffic-simulation-toggle-button"
            type="button"
            onClick={onToggleSimulation}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              isSimulating
                ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'border-[#374151] bg-[#1F2937] hover:bg-[#262A35] text-slate-200'
            }`}
            aria-label={isSimulating ? 'Detener simulación de tráfico' : 'Iniciar simulación de tráfico'}
            title="Simular flujo dinámico de paquetes y tráfico en el canvas"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse fill-current' : 'text-[#FF9900]'}`} />
            <span className="hidden md:inline">{isSimulating ? 'Simulando' : 'Simular'}</span>
          </button>
        )}

        {/* Botón Briefing */}
        {(hasBriefing ?? true) && onOpenBriefing && (
          <button
            data-testid="briefing-trigger-button"
            type="button"
            onClick={onOpenBriefing}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-[#374151] bg-[#1F2937] hover:bg-[#262A35] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            aria-label="Abrir briefing"
            title="Ver micro-cápsula de contexto y objetivos"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF9900]" />
            <span className="hidden sm:inline">Briefing</span>
          </button>
        )}

        {/* Botón Pistas */}
        <button
          data-testid="hints-trigger-button"
          type="button"
          onClick={onOpenHints}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
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
              ? 'bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-[#0B0F19] shadow-sm shadow-[#FF9900]/20 active:scale-95 cursor-pointer'
              : 'bg-[#1F2937] text-slate-500 border border-[#374151] cursor-not-allowed opacity-60'
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

