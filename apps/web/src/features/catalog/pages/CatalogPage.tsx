import { Layers, Sparkles, Trophy, Flame } from 'lucide-react';
import { useUnits } from '../hooks/useUnits';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { AccessModeToggle } from '../components/AccessModeToggle';
import { UnitAccordion } from '../components/UnitAccordion';
import { CatalogSkeleton } from '../components/CatalogSkeleton';
import { CatalogErrorState } from '../components/CatalogErrorState';

export function CatalogPage() {
  const { data: units, isLoading, isError, error, refetch } = useUnits();
  const { accessMode, updateAccessMode, isUpdating } = useSystemConfig();

  // Cálculo de estadísticas globales de avance
  const totalUnits = units?.length ?? 0;
  const allChallenges = units?.flatMap((u) => u.challenges) ?? [];
  const totalChallenges = allChallenges.length;
  const completedChallenges = allChallenges.filter(
    (c) => c.userProgress?.status === 'completed' || (c.userProgress?.highScore ?? 0) >= 70
  ).length;
  const earnedXP = allChallenges.reduce((acc, c) => {
    if (c.userProgress?.status === 'completed' || (c.userProgress?.highScore ?? 0) >= 70) {
      return acc + c.baseXP;
    }
    return acc;
  }, 0);

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabecera Principal y Selector de Modo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Rutas de Aprendizaje</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Catálogo de Desafíos de Arquitectura
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Diseña, conecta y evalúa arquitecturas en la nube de AWS siguiendo los pilares del Well-Architected Framework.
          </p>
        </div>

        {/* Selector de Modo de Acceso (RN-01 / CU-07) */}
        <div className="self-start md:self-auto">
          <AccessModeToggle
            accessMode={accessMode}
            onToggle={(mode) => updateAccessMode(mode)}
            isUpdating={isUpdating}
          />
        </div>
      </div>

      {/* Banner Resumen de Métricas Globales */}
      {!isLoading && !isError && totalChallenges > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="p-2 border-r border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Unidades</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">{totalUnits}</span>
          </div>
          <div className="p-2 sm:border-r border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Desafíos Totales</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">{totalChallenges}</span>
          </div>
          <div className="p-2 border-r border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Completados</span>
            <div className="inline-flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {completedChallenges}
              </span>
            </div>
          </div>
          <div className="p-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">XP de Catálogo</span>
            <div className="inline-flex items-center space-x-1">
              <Flame className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span className="text-lg font-black text-amber-800 dark:text-amber-400">
                {earnedXP} pts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal: Skeleton, Error o Lista de Unidades */}
      {isLoading ? (
        <CatalogSkeleton />
      ) : isError ? (
        <CatalogErrorState
          message={error?.message || 'No se pudo obtener la lista de desafíos de la arena.'}
          onRetry={() => refetch()}
        />
      ) : units && units.length > 0 ? (
        <div className="space-y-6">
          {units.map((unit) => (
            <UnitAccordion
              key={unit.id}
              unit={unit}
              defaultExpanded={true}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No hay unidades activas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Actualmente no hay unidades pedagógicas cargadas en el servidor.
          </p>
        </div>
      )}
    </div>
  );
}
