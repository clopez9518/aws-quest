import { Link } from 'react-router-dom';
import { Lock, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { ApiHttpError } from '../../../shared/api/ApiHttpError';

interface ChallengeErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
}

export function ChallengeErrorState({ error, onRetry }: ChallengeErrorStateProps) {
  let isLocked = false;
  let isNotFound = false;
  let errorMessage = 'No fue posible cargar el desafío. Intenta de nuevo más tarde.';

  if (error instanceof ApiHttpError) {
    if (error.statusCode === 403 || error.code === 'CHALLENGE_LOCKED') {
      isLocked = true;
      errorMessage =
        error.message ||
        'Este desafío se encuentra bloqueado por la política de progresión.';
    } else if (error.statusCode === 404 || error.code === 'CHALLENGE_NOT_FOUND') {
      isNotFound = true;
      errorMessage =
        error.message || 'El desafío que buscas no existe o ha sido modificado.';
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (error?.message) {
    errorMessage = error.message;
  }

  return (
    <div
      data-testid="challenge-error-state"
      className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 h-full"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-5">
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              isLocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isLocked ? <Lock className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isLocked
              ? 'Desafío Bloqueado'
              : isNotFound
              ? 'Desafío No Encontrado'
              : 'Error al Cargar el Desafío'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/catalog"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>

          {!isLocked && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
