import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CatalogErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function CatalogErrorState({
  message = 'Ocurrió un error al cargar el catálogo de desafíos de AWS.',
  onRetry
}: CatalogErrorStateProps) {
  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Error al conectar con la arena
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}
