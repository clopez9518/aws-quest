export function ChallengeWorkspaceSkeleton() {
  return (
    <div
      data-testid="challenge-workspace-skeleton"
      className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden select-none bg-slate-50 dark:bg-slate-950 animate-pulse"
    >
      {/* Skeleton de Header */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="w-48 h-5 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="w-16 h-5 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-20 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="w-24 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="w-32 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Skeleton de Cuerpo en 3 Paneles */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Panel Lateral Izquierdo */}
        <div className="w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 space-y-3 shrink-0">
          <div className="w-full h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 pt-2">
            <div className="w-full h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-full h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Panel Central Canvas */}
        <div className="flex-1 h-full bg-slate-100/50 dark:bg-slate-950/40 relative flex items-center justify-center">
          <div className="text-xs font-mono text-slate-400 dark:text-slate-600">
            Cargando área de trabajo de arquitectura...
          </div>
        </div>
      </div>
    </div>
  );
}
