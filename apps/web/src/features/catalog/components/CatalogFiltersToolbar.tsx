import React from 'react';
import { Search } from 'lucide-react';

export type ChallengeTypeFilter = 'all' | 'builder' | 'fix';
export type ChallengeDifficultyFilter = 'all' | 'easy' | 'intermediate' | 'hard' | 'integrator';

interface CatalogFiltersToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: ChallengeTypeFilter;
  onTypeFilterChange: (t: ChallengeTypeFilter) => void;
  difficultyFilter: ChallengeDifficultyFilter;
  onDifficultyFilterChange: (d: ChallengeDifficultyFilter) => void;
  totalCounts: {
    all: number;
    builder: number;
    fix: number;
  };
}

export const CatalogFiltersToolbar: React.FC<CatalogFiltersToolbarProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
  totalCounts,
}) => {
  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
      {/* Input de Búsqueda */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por servicio (ALB, ASG, RDS, Lambda) o título..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ×
          </button>
        )}
      </div>

      {/* Filtro por Tipo de Desafío */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">
          Tipo:
        </span>
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#0B0F19] p-0.5 border border-slate-200 dark:border-[#374151] shrink-0">
          <button
            type="button"
            onClick={() => onTypeFilterChange('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Todos ({totalCounts.all})
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange('builder')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              typeFilter === 'builder'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Builder ({totalCounts.builder})
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange('fix')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              typeFilter === 'fix'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Fix Incidentes ({totalCounts.fix})</span>
          </button>
        </div>
      </div>

      {/* Filtro por Dificultad */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase shrink-0">
          Dificultad:
        </span>
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#0B0F19] p-0.5 border border-slate-200 dark:border-[#374151] shrink-0">
          <button
            type="button"
            onClick={() => onDifficultyFilterChange('all')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              difficultyFilter === 'all'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => onDifficultyFilterChange('easy')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              difficultyFilter === 'easy'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Fácil
          </button>
          <button
            type="button"
            onClick={() => onDifficultyFilterChange('intermediate')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              difficultyFilter === 'intermediate'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Intermedio
          </button>
          <button
            type="button"
            onClick={() => onDifficultyFilterChange('hard')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              difficultyFilter === 'hard'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Difícil
          </button>
          <button
            type="button"
            onClick={() => onDifficultyFilterChange('integrator')}
            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
              difficultyFilter === 'integrator'
                ? 'bg-[#FF9900] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Integrador
          </button>
        </div>
      </div>
    </div>
  );
};
