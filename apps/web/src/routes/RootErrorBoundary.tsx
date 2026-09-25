import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export function RootErrorBoundary() {
  const error = useRouteError();

  let title = 'Error inesperado';
  let message = 'Ha ocurrido un error inesperado en la interfaz visual.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText}`;
    message = error.data?.message || 'Error en la petición de navegación.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center transition-colors duration-200">
      <div className="max-w-md space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">{message}</p>
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-transparent text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recargar</span>
          </button>
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Ir al Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
