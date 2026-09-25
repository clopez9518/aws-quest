import { useState } from 'react';
import { ChevronDown, Layers, Trophy } from 'lucide-react';
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

  return (
    <div data-testid="unit-accordion" className="rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
      {/* Cabecera del Acordeón */}
      <button
        type="button"
        id={`unit-header-${unit.id}`}
        aria-controls={`unit-content-${unit.id}`}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-2xl"
      >
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Unidad {unit.orderIndex}
              </span>
              {isFullyCompleted && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <Trophy className="w-3 h-3" />
                  <span>Completada</span>
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {unit.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {unit.description}
            </p>
          </div>
        </div>

        {/* Progreso de la Unidad & Toggle Chevron */}
        <div className="flex items-center space-x-4 self-end sm:self-center shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {completedChallenges} de {totalChallenges} Desafíos
            </div>
            <div
              className="w-28 sm:w-36 h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800 mt-1.5"
              role="progressbar"
              aria-label={`Progreso de ${unit.title}`}
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Grid de Desafíos */}
      {isExpanded && (
        <div
          id={`unit-content-${unit.id}`}
          role="region"
          aria-labelledby={`unit-header-${unit.id}`}
          className="p-5 sm:p-6 pt-2 sm:pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/30"
        >
          {unit.challenges.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No hay desafíos registrados en esta unidad.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unit.challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
