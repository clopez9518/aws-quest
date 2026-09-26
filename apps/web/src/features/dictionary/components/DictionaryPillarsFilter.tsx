import React from 'react';
import { WellArchitectedPillar } from '../types/dictionary.types';
import { isPillarMatching } from '../utils/dictionaryFormatters';
import { Shield, Zap, DollarSign, Gauge, Settings, Leaf } from 'lucide-react';

interface DictionaryPillarsFilterProps {
  selectedPillar: WellArchitectedPillar | null;
  onSelectPillar: (pillar: WellArchitectedPillar | null) => void;
}

const PILLARS_CONFIG: Array<{
  key: WellArchitectedPillar;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'Security',
    label: 'Seguridad',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  {
    key: 'Reliability',
    label: 'Fiabilidad',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    key: 'PerformanceEfficiency',
    label: 'Rendimiento',
    icon: <Gauge className="w-3.5 h-3.5" />,
  },
  {
    key: 'CostOptimization',
    label: 'Costos',
    icon: <DollarSign className="w-3.5 h-3.5" />,
  },
  {
    key: 'OperationalExcellence',
    label: 'Op. Excellence',
    icon: <Settings className="w-3.5 h-3.5" />,
  },
  {
    key: 'Sustainability',
    label: 'Sostenibilidad',
    icon: <Leaf className="w-3.5 h-3.5" />,
  },
];

export const DictionaryPillarsFilter: React.FC<DictionaryPillarsFilterProps> = ({
  selectedPillar,
  onSelectPillar,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtro por Pilar Well-Architected">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
        <span>🏛️</span>
        <span>Pilares WAF:</span>
      </span>

      {PILLARS_CONFIG.map(({ key, label, icon }) => {
        const isSelected = isPillarMatching(selectedPillar, key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectPillar(isSelected ? null : key)}
            aria-pressed={isSelected}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
              isSelected
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-semibold shadow-xs shadow-amber-500/20 scale-105'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
