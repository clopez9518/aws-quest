export function AttemptHistorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Cargando historial de intentos">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-7 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mt-2" />
        </div>
      ))}
    </div>
  );
}
