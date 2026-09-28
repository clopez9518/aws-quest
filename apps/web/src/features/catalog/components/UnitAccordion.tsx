import { useState } from 'react';
import { ChevronDown, Layers, Trophy, Sparkles } from 'lucide-react';
import { UnitResponseDto } from '../types/catalog.types';
import { ChallengeCard } from './ChallengeCard';

interface UnitAccordionProps {
  unit: UnitResponseDto;
  defaultExpanded?: boolean;
}

export function UnitAccordion({ unit, defaultExpanded = true }: UnitAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const totalChallenges = unit.challenges.length;
  const completedChallenges = unit.challenges.filter(
    (c) => c.userProgress?.status === 'completed' || (c.userProgress?.highScore ?? 0) >= 70
  ).length;
  const progressPercent = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;
  const isFullyCompleted = totalChallenges > 0 && completedChallenges === totalChallenges;
  const inProgress = completedChallenges > 0 && !isFullyCompleted;

  const totalPossibleXP = unit.challenges.reduce((sum, c) => sum + (c.baseXP || 0), 0);

  return (
    <div
      data-testid="unit-accordion"
      className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] shadow-xs dark:shadow-elevation-card overflow-hidden transition-all duration-200"
    >
      {/* Cabecera del Acordeón Táctico */}
      <button
        type="button"
        id={`unit-header-${unit.id}`}
        aria-controls={`unit-content-${unit.id}`}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#171B26] transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF9900] cursor-pointer"
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#0B0F19] border border-amber-200 dark:border-[#374151] text-[#FF9900] flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-mono font-bold text-[#FF9900] uppercase tracking-wider">
                Unidad {unit.orderIndex}
              </span>
              {isFullyCompleted ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-mono">
                  <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Mastered</span>
                </span>
              ) : inProgress ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60 font-mono">
                  <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>En Curso</span>
                </span>
              ) : null}
              {totalPossibleXP > 0 && (
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  • Puntos en juego: +{totalPossibleXP.toLocaleString()} XP
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {unit.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              {unit.description}
            </p>
          </div>
        </div>

        {/* Progreso de la Unidad & Toggle Chevron */}
        <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {completedChallenges} de {totalChallenges} Desafíos
            </div>
            <div
              className="w-28 sm:w-36 h-1.5 bg-slate-100 dark:bg-[#0B0F19] rounded-full overflow-hidden border border-slate-200 dark:border-[#374151] mt-1.5"
              role="progressbar"
              aria-label={`Progreso de ${unit.title}`}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF9900] to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div
            className={`w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] flex items-center justify-center text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-slate-900 dark:text-slate-200' : 'rotate-0'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Contenido Expandible: Grid de Desafíos */}
      {isExpanded && (
        <div
          id={`unit-content-${unit.id}`}
          role="region"
          aria-labelledby={`unit-header-${unit.id}`}
          className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#374151] bg-slate-50/50 dark:bg-[#0B0F19]/40"
        >
          {unit.challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {unit.challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              No hay desafíos disponibles en esta unidad para los filtros seleccionados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
