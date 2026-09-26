import React from 'react';
import { DictionaryTermSummary } from '../types/dictionary.types';
import { formatPillarLabel } from '../utils/dictionaryFormatters';
import { ArrowRight, Server, Database, Globe, Shield, Layers } from 'lucide-react';

interface DictionaryTermCardProps {
  term: DictionaryTermSummary;
  onOpenDetail: (slug: string) => void;
}

const CATEGORY_META: Record<string, { label: string; badge: string; icon: React.ReactNode }> = {
  service: {
    label: 'Servicio AWS',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <Server className="w-4 h-4 text-blue-500" />,
  },
  concept: {
    label: 'Concepto Cloud',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: <Database className="w-4 h-4 text-purple-500" />,
  },
  infrastructure: {
    label: 'Red & Seguridad',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: <Globe className="w-4 h-4 text-emerald-500" />,
  },
  'well-architected': {
    label: 'Well-Architected',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: <Shield className="w-4 h-4 text-amber-500" />,
  },
};

export const DictionaryTermCard: React.FC<DictionaryTermCardProps> = ({
  term,
  onOpenDetail,
}) => {
  const meta = CATEGORY_META[term.category] || {
    label: term.category,
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    icon: <Layers className="w-4 h-4 text-slate-500" />,
  };

  return (
    <div
      role="article"
      aria-label={`Término: ${term.title}`}
      onClick={() => onOpenDetail(term.slug)}
      className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group backdrop-blur-sm"
    >
      <div>
        {/* Top meta info & badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              {meta.icon}
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}
            >
              {meta.label}
            </span>
          </div>

          {term.serviceCode && (
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
              {term.serviceCode}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors mb-2">
          {term.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {term.shortDefinition || (term as any).summary}
        </p>
      </div>

      {/* Footer / WAF Pillars & Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-w-[70%]">
          {term.pillar && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 truncate"
            >
              {formatPillarLabel(term.pillar)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(term.slug);
          }}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors"
          aria-label={`Ver ficha técnica de ${term.title}`}
        >
          <span>Ficha</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
