import { useState, useMemo } from 'react';
import { Layers, Sparkles, Flame, Shield, Award, FilterX } from 'lucide-react';
import { useUnits } from '../hooks/useUnits';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { AccessModeToggle } from '../components/AccessModeToggle';
import { UnitAccordion } from '../components/UnitAccordion';
import { CatalogSkeleton } from '../components/CatalogSkeleton';
import { CatalogErrorState } from '../components/CatalogErrorState';
import { WavesLearningCards } from '../components/WavesLearningCards';
import {
  CatalogFiltersToolbar,
  ChallengeTypeFilter,
  ChallengeDifficultyFilter,
} from '../components/CatalogFiltersToolbar';
import { SuggestedMissionWidget } from '../components/SuggestedMissionWidget';
import { WafPillarsRadarWidget } from '../components/WafPillarsRadarWidget';
import { ArchitectCliTipWidget } from '../components/ArchitectCliTipWidget';
import { CatalogChallengeDto, UnitResponseDto } from '../types/catalog.types';

export function CatalogPage() {
  const { data: units, isLoading, isError, error, refetch } = useUnits();
  const { accessMode, updateAccessMode, isUpdating } = useSystemConfig();

  // Estados locales de filtrado
  const [selectedWave, setSelectedWave] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChallengeTypeFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<ChallengeDifficultyFilter>('all');

  // Métricas y Desafíos Consolidados
  const allChallenges = useMemo(() => units?.flatMap((u) => u.challenges) ?? [], [units]);
  const totalUnits = units?.length ?? 0;
  const totalChallenges = allChallenges.length;

  const completedChallenges = useMemo(() => {
    return allChallenges.filter(
      (c) => c.userProgress?.status === 'completed' || (c.userProgress?.highScore ?? 0) >= 70
    );
  }, [allChallenges]);

  const earnedXP = useMemo(() => {
    return completedChallenges.reduce((acc, c) => acc + (c.baseXP || 0), 0);
  }, [completedChallenges]);

  const averageScore = useMemo(() => {
    if (completedChallenges.length === 0) return 0;
    const totalScore = completedChallenges.reduce((sum, c) => sum + (c.userProgress?.highScore ?? 100), 0);
    return Math.round((totalScore / completedChallenges.length) * 10) / 10;
  }, [completedChallenges]);

  const totalCounts = useMemo(() => {
    return {
      all: totalChallenges,
      builder: allChallenges.filter((c) => c.mode === 'builder' || !c.mode).length,
      fix: allChallenges.filter((c) => c.mode === 'fixArchitecture').length,
    };
  }, [allChallenges, totalChallenges]);

  // Selección inteligente del desafío prioritario P1 para la Misión Sugerida
  const suggestedMissionChallenge = useMemo<CatalogChallengeDto | null>(() => {
    if (allChallenges.length === 0) return null;
    // 1. Prioridad: Desafío intentado con nota reprobada (< 70)
    const failedChallenge = allChallenges.find(
      (c) => (c.userProgress?.highScore ?? 100) < 70 && (c.userProgress?.highScore ?? 0) > 0 && !c.isLocked
    );
    if (failedChallenge) return failedChallenge;

    // 2. Prioridad: Primer desafío desbloqueado aún no completado
    const nextUncompleted = allChallenges.find(
      (c) => !c.isLocked && c.userProgress?.status !== 'completed' && (c.userProgress?.highScore ?? 0) < 70
    );
    if (nextUncompleted) return nextUncompleted;

    // 3. Fallback: Primer desafío
    return allChallenges[0] || null;
  }, [allChallenges]);

  // Filtrado reactivo de unidades y desafíos
  const filteredUnits = useMemo<UnitResponseDto[]>(() => {
    if (!units) return [];

    // Mapeo de rangos por ola: Ola 1 = 1-5, Ola 2 = 6-8, Ola 3 = 9-12
    const waveRanges: Record<number, [number, number]> = {
      1: [1, 5],
      2: [6, 8],
      3: [9, 12],
    };

    return units
      .filter((unit) => {
        if (selectedWave && waveRanges[selectedWave]) {
          const [min, max] = waveRanges[selectedWave];
          if (unit.orderIndex < min || unit.orderIndex > max) return false;
        }
        return true;
      })
      .map((unit) => {
        const matchingChallenges = unit.challenges.filter((challenge) => {
          // Filtro por tipo
          if (typeFilter === 'builder' && challenge.mode === 'fixArchitecture') return false;
          if (typeFilter === 'fix' && challenge.mode !== 'fixArchitecture') return false;

          // Filtro por dificultad
          if (difficultyFilter !== 'all' && challenge.difficulty !== difficultyFilter) return false;

          // Filtro por búsqueda
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesTitle = challenge.title.toLowerCase().includes(q);
            const matchesUnit = unit.title.toLowerCase().includes(q);
            if (!matchesTitle && !matchesUnit) return false;
          }

          return true;
        });

        return {
          ...unit,
          challenges: matchingChallenges,
        };
      })
      .filter((unit) => unit.challenges.length > 0 || (!searchQuery && typeFilter === 'all' && difficultyFilter === 'all'));
  }, [units, selectedWave, searchQuery, typeFilter, difficultyFilter]);

  const hasActiveFilters = Boolean(selectedWave || searchQuery || typeFilter !== 'all' || difficultyFilter !== 'all');

  const handleResetFilters = () => {
    setSelectedWave(null);
    setSearchQuery('');
    setTypeFilter('all');
    setDifficultyFilter('all');
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabecera Principal y Selector de Modo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#374151]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#FF9900] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-[#FF9900]" />
            <span>ITINERARIO OFICIAL • 3 Olas • 12 Unidades • {totalChallenges || 49} Desafíos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Catálogo de Desafíos de Arquitectura
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Entrenamiento táctico basado en incidentes de producción reales y patrones del AWS Well-Architected Framework.
          </p>
        </div>

        {/* Selector de Modo de Acceso (RN-01 / CU-07) */}
        <div className="self-start md:self-auto flex flex-col items-start md:items-end gap-2">
          <AccessModeToggle
            accessMode={accessMode}
            onToggle={(mode) => updateAccessMode(mode)}
            isUpdating={isUpdating}
          />
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
            • Motor Anti-Farm Activo
          </span>
        </div>
      </div>

      {/* Banner Resumen de Métricas Globales (Stitch Screen 1) */}
      {!isLoading && !isError && totalChallenges > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Desafíos Totales / Progreso */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Desafíos Totales
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-100">
                {completedChallenges.length}/{totalChallenges}
              </span>
              <span className="text-xs font-mono font-bold text-[#FF9900]">
                {totalChallenges > 0 ? Math.round((completedChallenges.length / totalChallenges) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden border border-[#374151] mt-2">
              <div
                className="bg-[#FF9900] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalChallenges > 0 ? (completedChallenges.length / totalChallenges) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: XP de Catálogo */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                XP de Catálogo
              </span>
              <Flame className="w-4 h-4 text-[#FF9900]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-[#FF9900]">
                {earnedXP.toLocaleString()} pts
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                x1.25 hoy
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              De {totalUnits} Unidades de Aprendizaje
            </span>
          </div>

          {/* Card 3: Récord Promedio */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Récord Promedio
              </span>
              <Award className="w-4 h-4 text-[#38BDF8]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-100">
                {averageScore > 0 ? `${averageScore}` : '--'}{' '}
                <span className="text-xs font-normal text-slate-400">/ 100</span>
              </span>
              <span className="text-[11px] font-mono text-[#38BDF8]">
                {completedChallenges.length > 0 ? `${completedChallenges.length} evaluados` : 'Sin intentos'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              Umbral mínimo de pase: 70 pts
            </span>
          </div>

          {/* Card 4: Pilares Dominados */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Pilares Dominados
              </span>
              <Shield className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-100">
                {completedChallenges.length >= 10 ? '5' : completedChallenges.length >= 5 ? '3' : '1'}{' '}
                <span className="text-xs font-normal text-slate-400">/ 5 WAF</span>
              </span>
              <span className="text-[10px] font-mono text-[#8B5CF6] bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-700/50">
                Well-Architected
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              Seguridad, Fiabilidad, Costos, Perf, Ops
            </span>
          </div>
        </div>
      )}

      {/* Selector de Olas de Aprendizaje (Stitch Screen 1) */}
      {!isLoading && !isError && units && units.length > 0 && (
        <WavesLearningCards
          units={units}
          selectedWave={selectedWave}
          onSelectWave={setSelectedWave}
        />
      )}

      {/* Barra de Filtros y Búsqueda */}
      {!isLoading && !isError && totalChallenges > 0 && (
        <CatalogFiltersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          difficultyFilter={difficultyFilter}
          onDifficultyFilterChange={setDifficultyFilter}
          totalCounts={totalCounts}
        />
      )}

      {/* Contenido Principal: 2 Columnas (Currículo + Widgets Tácticos) */}
      {isLoading ? (
        <CatalogSkeleton />
      ) : isError ? (
        <CatalogErrorState
          message={error?.message || 'No se pudo obtener la lista de desafíos de la arena.'}
          onRetry={() => refetch()}
        />
      ) : units && units.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Principal: Lista de Unidades y Desafíos */}
          <div className="lg:col-span-8 space-y-4">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit) => (
                <UnitAccordion
                  key={unit.id}
                  unit={unit}
                  defaultExpanded={true}
                />
              ))
            ) : (
              <div className="p-10 rounded-xl bg-[#111827] border border-[#374151] text-center space-y-3">
                <FilterX className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">
                  No se encontraron desafíos con los filtros aplicados
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Prueba modificando el término de búsqueda o restableciendo los filtros de dificultad y tipo.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#262A35] text-xs font-bold text-[#FF9900] border border-[#374151] transition-colors cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Columna Lateral: Widgets Tácticos (Stitch Screen 1) */}
          <div className="lg:col-span-4 space-y-4">
            <SuggestedMissionWidget topChallenge={suggestedMissionChallenge} />
            <WafPillarsRadarWidget />
            <ArchitectCliTipWidget />
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-xl bg-[#111827] border border-[#374151] text-center space-y-3 shadow-elevation-card">
          <Sparkles className="w-8 h-8 text-[#FF9900] mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            No hay unidades activas
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Actualmente no hay unidades pedagógicas cargadas en el servidor.
          </p>
        </div>
      )}
    </div>
  );
}

