import { Link } from 'react-router-dom';
import { Lock, Zap, CheckCircle2, ArrowRight, Award } from 'lucide-react';
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

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { id, title, difficulty, mode, baseXP, isLocked, lockReason, userProgress } = challenge;
  const diff = difficultyConfig[difficulty] || difficultyConfig.easy;
  const isCompleted = userProgress?.status === 'completed' || (userProgress?.highScore ?? 0) >= 70;

  return (
    <div
      data-testid="challenge-card"
      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 ${
        isLocked
          ? 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-80'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 hover:shadow-lg dark:hover:shadow-amber-500/5'
      }`}
    >
      <div>
        {/* Badges de Cabecera: Dificultad, Modo y XP */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${diff.bg} ${diff.text} ${diff.border}`}
            >
              {diff.label}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
              {mode === 'fixArchitecture' ? 'Reparar' : 'Builder'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>+{baseXP} XP</span>
          </div>
        </div>

        {/* Título del Desafío */}
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug line-clamp-2">
          {title}
        </h4>

        {/* Estado de Progreso o Motivo de Bloqueo */}
        {isLocked ? (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-200/70 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
            <Lock data-testid="lock-icon" className="w-4 h-4 text-slate-500 dark:text-slate-500 mt-0.5 shrink-0" />
            <span className="leading-tight">{lockReason || 'Desafío bloqueado por política de progreso'}</span>
          </div>
        ) : isCompleted ? (
          <div data-testid="high-score-badge" className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completado</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                {userProgress?.highScore ?? 100}/100 pts
              </span>
              {userProgress && userProgress.hintsUsed > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  ({userProgress.hintsUsed} {userProgress.hintsUsed === 1 ? 'pista' : 'pistas'})
                </span>
              )}
            </div>
          </div>
        ) : userProgress?.status === 'inProgress' ? (
          <div className="mt-3 p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>En progreso</span>
          </div>
        ) : null}
      </div>

      {/* Botón de Acción */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {isLocked ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={`Desafío ${title} bloqueado. ${lockReason || 'Desafío bloqueado'}`}
            className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloqueado</span>
          </button>
        ) : (
          <Link
            to={`/challenges/${id}`}
            aria-label={`${isCompleted ? 'Mejorar puntaje en' : 'Iniciar'} desafío ${title}`}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <span>{isCompleted ? 'Mejorar Puntaje' : 'Iniciar Desafío'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
