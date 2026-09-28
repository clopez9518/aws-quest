import { Link } from 'react-router-dom';
import { Lock, Zap, CheckCircle2, ArrowRight, Award, AlertCircle } from 'lucide-react';
import { CatalogChallengeDto, DifficultyLevel } from '../types/catalog.types';

interface ChallengeCardProps {
  challenge: CatalogChallengeDto;
}

const difficultyConfig: Record<
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

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { id, title, difficulty, mode, baseXP, isLocked, lockReason, userProgress } = challenge;
  const diff = difficultyConfig[difficulty as DifficultyLevel] || difficultyConfig.easy;
  const isCompleted = userProgress?.status === 'completed' || (userProgress?.highScore ?? 0) >= 70;
  const isFailed = (userProgress?.highScore ?? 100) < 70 && (userProgress?.highScore ?? 0) > 0;

  return (
    <div
      data-testid="challenge-card"
      className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 group relative ${
        isLocked
          ? 'bg-slate-50/60 dark:bg-[#0B0F19]/60 border-slate-200/60 dark:border-[#374151]/40 opacity-70'
          : isCompleted
          ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/5 shadow-xs'
          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] hover:border-[#FF9900]/80 hover:shadow-lg hover:shadow-[#FF9900]/5 shadow-xs'
      }`}
    >
      <div>
        {/* Badges de Cabecera: Dificultad, Modo y XP */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
            >
              {diff.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
              mode === 'fixArchitecture'
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
                : 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#374151]'
            }`}>
              {mode === 'fixArchitecture' ? 'Reparar' : 'Builder'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[#FF9900] text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-[#FF9900] fill-current" />
            <span>+{baseXP} XP</span>
          </div>
        </div>

        {/* Título del Desafío */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-white transition-colors mb-2 leading-snug line-clamp-2">
          {title}
        </h4>

        {/* Estado de Progreso o Motivo de Bloqueo */}
        {isLocked ? (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-2">
            <Lock data-testid="lock-icon" className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
            <span className="leading-tight">{lockReason || 'Desafío bloqueado por política de progreso'}</span>
          </div>
        ) : isCompleted ? (
          <div data-testid="high-score-badge" className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completado</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300">
              {userProgress?.hintsUsed !== undefined && userProgress.hintsUsed > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ({userProgress.hintsUsed} {userProgress.hintsUsed === 1 ? 'pista' : 'pistas'})
                </span>
              )}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {userProgress?.highScore ?? 100}/100 pts
              </span>
              <Award className="w-3.5 h-3.5 text-[#FF9900]" />
            </div>
          </div>
        ) : isFailed ? (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Reintento Recomendado</span>
            </div>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-[11px]">
              {userProgress?.highScore}/100 pts
            </span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Disponible para inicio</span>
          </div>
        )}
      </div>

      {/* Botón de Acción Táctico */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#374151]/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          ARN: #{id.substring(0, 8)}
        </span>

        {isLocked ? (
          <button
            type="button"
            disabled
            data-testid="locked-action"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-400 dark:text-slate-500 select-none cursor-not-allowed opacity-70"
            aria-label="Bloqueado"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloqueado</span>
          </button>
        ) : (
          <Link
            to={`/challenges/${id}`}
            data-testid={`challenge-link-${id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 dark:text-[#FF9900] group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors"
          >
            <span>{isCompleted ? 'Mejorar Puntaje' : 'Iniciar Desafío'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
