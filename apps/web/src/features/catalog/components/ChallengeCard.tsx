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

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { id, title, difficulty, mode, baseXP, isLocked, lockReason, userProgress } = challenge;
  const diff = difficultyConfig[difficulty] || difficultyConfig.easy;
  const isCompleted = userProgress?.status === 'completed' || (userProgress?.highScore ?? 0) >= 70;
  const isFailed = (userProgress?.highScore ?? 100) < 70 && (userProgress?.highScore ?? 0) > 0;

  return (
    <div
      data-testid="challenge-card"
      className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 group relative ${
        isLocked
          ? 'bg-[#0B0F19]/60 border-[#374151]/40 opacity-70'
          : isCompleted
          ? 'bg-[#111827] border-[#374151] hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/5'
          : 'bg-[#111827] border-[#374151] hover:border-[#FF9900]/80 hover:shadow-lg hover:shadow-[#FF9900]/5'
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
                ? 'bg-rose-950/50 text-rose-300 border-rose-700/50'
                : 'bg-[#1F2937] text-slate-300 border-[#374151]'
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
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors mb-2 leading-snug line-clamp-2">
          {title}
        </h4>

        {/* Estado de Progreso o Motivo de Bloqueo */}
        {isLocked ? (
          <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F19] border border-[#374151] text-xs text-slate-400 flex items-start space-x-2">
            <Lock data-testid="lock-icon" className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <span className="leading-tight">{lockReason || 'Desafío bloqueado por política de progreso'}</span>
          </div>
        ) : isCompleted ? (
          <div data-testid="high-score-badge" className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completado</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-300">
              <span className="font-mono font-bold text-emerald-400">
                {userProgress?.highScore ?? 100}/100 pts
              </span>
              {userProgress && userProgress.hintsUsed > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ({userProgress.hintsUsed} {userProgress.hintsUsed === 1 ? 'pista' : 'pistas'})
                </span>
              )}
            </div>
          </div>
        ) : isFailed ? (
          <div className="mt-3 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-400 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Último: {userProgress?.highScore}/100</span>
            </div>
            <span className="text-[10px] text-rose-300 font-mono">Requiere Revisión</span>
          </div>
        ) : userProgress?.status === 'inProgress' ? (
          <div className="mt-3 p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 text-xs text-sky-400 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>En progreso</span>
          </div>
        ) : null}
      </div>

      {/* Botón de Acción Táctico */}
      <div className="mt-4 pt-3 border-t border-[#374151]/60">
        {isLocked ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={`Desafío ${title} bloqueado. ${lockReason || 'Desafío bloqueado'}`}
            className="w-full py-2 px-3 rounded-lg bg-[#1F2937] text-slate-500 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-not-allowed border border-[#374151]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Bloqueado</span>
          </button>
        ) : (
          <Link
            to={`/challenges/${id}`}
            aria-label={`${isCompleted ? 'Mejorar puntaje en' : 'Iniciar'} desafío ${title}`}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FF9900] ${
              isCompleted
                ? 'bg-[#1F2937] hover:bg-[#262A35] text-slate-200 border border-[#374151]'
                : 'bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-[#0B0F19] shadow-sm font-bold'
            }`}
          >
            <span>{isCompleted ? 'Mejorar Puntaje' : 'Iniciar Desafío'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

