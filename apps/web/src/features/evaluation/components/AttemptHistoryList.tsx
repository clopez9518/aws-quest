import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { useChallengeAttempts } from '../hooks/useChallengeAttempts';
import { ChallengeAttemptHistoryDto } from '../types/evaluation.types';
import { AttemptHistoryCard } from './AttemptHistoryCard';
import { AttemptHistoryEmptyState } from './AttemptHistoryEmptyState';
import { AttemptHistorySkeleton } from './AttemptHistorySkeleton';

export interface AttemptHistoryListProps {
  challengeId?: string;
  onRestoreAttempt: (attempt: ChallengeAttemptHistoryDto, attemptNumber: number) => void;
}

export function AttemptHistoryList({
  challengeId,
  onRestoreAttempt
}: AttemptHistoryListProps) {
  const {
    attempts,
    isLoading,
    isError,
    error,
    refetch,
    attemptsCount,
    bestScore
  } = useChallengeAttempts(challengeId);

  // 1. Estado de Carga
  if (isLoading) {
    return <AttemptHistorySkeleton />;
  }

  // 2. Estado de Error
  if (isError) {
    return (
      <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-2.5">
        <div className="flex items-center justify-center space-x-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>No se pudo cargar el historial</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {error?.message || 'Error de conexión con el servidor.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-700 hover:text-white dark:text-rose-300 dark:hover:text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  // 3. Estado Vacío
  if (attemptsCount === 0) {
    return <AttemptHistoryEmptyState />;
  }

  return (
    <div className="space-y-3">
      {/* Cabecera Resumen de Intentos y Mejor Calificación */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-medium">
          <span>{attemptsCount} {attemptsCount === 1 ? 'envío registrado' : 'envíos registrados'}</span>
        </div>

        <div className="flex items-center space-x-1 font-bold text-slate-800 dark:text-slate-200">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Récord:</span>
          <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold">
            {bestScore}/100
          </span>
        </div>
      </div>

      {/* Lista de Tarjetas de Intentos */}
      <div className="space-y-2.5">
        {attempts.map((attempt, index) => {
          // Si vienen ordenados descendentemente (el más reciente primero)
          const attemptNumber = attemptsCount - index;
          const isLatest = index === 0;

          return (
            <AttemptHistoryCard
              key={attempt.id}
              attempt={attempt}
              attemptNumber={attemptNumber}
              isLatest={isLatest}
              onRestore={(att) => onRestoreAttempt(att, attemptNumber)}
            />
          );
        })}
      </div>
    </div>
  );
}
