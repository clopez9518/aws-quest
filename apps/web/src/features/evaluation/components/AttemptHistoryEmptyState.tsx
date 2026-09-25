import { History } from 'lucide-react';

export function AttemptHistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
        <History className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Sin envíos previos
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
          Aún no has enviado ninguna solución para este desafío. Diseña tu arquitectura y presiona <span className="font-semibold text-amber-600 dark:text-amber-400">"Enviar solución"</span>.
        </p>
      </div>
    </div>
  );
}
