import { RotateCcw, Clock, Lightbulb, Box, Share2, CheckCircle2, XCircle } from 'lucide-react';
import { ChallengeAttemptHistoryDto } from '../types/evaluation.types';
import { formatRelativeTime, formatExactDate } from '../../../shared/utils/date';

export interface AttemptHistoryCardProps {
  attempt: ChallengeAttemptHistoryDto;
  attemptNumber: number;
  isLatest: boolean;
  onRestore: (attempt: ChallengeAttemptHistoryDto) => void;
}

export function AttemptHistoryCard({
  attempt,
  attemptNumber,
  isLatest,
  onRestore
}: AttemptHistoryCardProps) {
  const componentsCount = attempt.graphSubmitted?.components?.length ?? 0;
  const connectionsCount = attempt.graphSubmitted?.connections?.length ?? 0;

  const isPassed = attempt.passed;

  return (
    <div data-testid="attempt-history-card" className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xs space-y-2.5 transition-all hover:border-slate-700">
      {/* Cabecera: Número de intento, Badge de reciente y Estado/Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="text-xs font-bold text-slate-100">
            Intento #{attemptNumber}
          </span>
          {isLatest && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Reciente
            </span>
          )}
        </div>

        {/* Badge de Aprobado / No Aprobado y Score */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <span
            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${
              isPassed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isPassed ? (
              <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
            ) : (
              <XCircle className="w-2.5 h-2.5 shrink-0" />
            )}
            <span>{isPassed ? 'Aprobado' : 'No Aprobado'}</span>
          </span>

          <span
            className={`text-xs font-mono font-extrabold ${
              isPassed
                ? 'text-emerald-400'
                : 'text-rose-400'
            }`}
          >
            {attempt.score}/100
          </span>
        </div>
      </div>

      {/* Metadatos: Tiempo, Pistas, Nodos y Conexiones */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-0.5">
        <div
          className="flex items-center space-x-1 truncate"
          title={formatExactDate(attempt.createdAt)}
        >
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{formatRelativeTime(attempt.createdAt)}</span>
        </div>

        <div className="flex items-center space-x-1 truncate">
          <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            {attempt.hintsUsed === 0
              ? 'Sin pistas'
              : `${attempt.hintsUsed} ${attempt.hintsUsed === 1 ? 'pista' : 'pistas'}`}
          </span>
        </div>

        <div className="flex items-center space-x-1 truncate">
          <Box className="w-3 h-3 text-sky-400 shrink-0" />
          <span>
            {componentsCount} {componentsCount === 1 ? 'servicio' : 'servicios'}
          </span>
        </div>

        <div className="flex items-center space-x-1 truncate">
          <Share2 className="w-3 h-3 text-indigo-400 shrink-0" />
          <span>
            {connectionsCount} {connectionsCount === 1 ? 'conexión' : 'conexiones'}
          </span>
        </div>
      </div>

      {/* Botón de Restauración */}
      <button
        type="button"
        data-testid="restore-attempt-button"
        onClick={() => onRestore(attempt)}
        aria-label={`Cargar intento número ${attemptNumber} con calificación ${attempt.score} en el lienzo`}
        className="w-full mt-1.5 flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700/80 hover:border-amber-400 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Cargar en Canvas</span>
      </button>
    </div>
  );
}
