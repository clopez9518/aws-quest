import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-inner">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">404</h2>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Ruta no encontrada</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          La arquitectura o sección solicitada no existe en la arena de AWS Quest.
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    </div>
  );
}
