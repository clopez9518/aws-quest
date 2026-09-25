export function CatalogSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Cargando catálogo...">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="w-48 sm:w-72 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="w-64 sm:w-96 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="w-28 h-6 bg-slate-200 dark:bg-slate-800 rounded-full hidden sm:block" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                </div>
                <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
