import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { FeedbackItemDto, FeedbackCategory } from '../types/evaluation.types';

export interface FeedbackListProps {
  summary: string;
  items: FeedbackItemDto[];
  className?: string;
}

export type FeedbackFilterTab = 'all' | 'pass' | 'issues';

const categoryLabels: Record<FeedbackCategory, string> = {
  serviceSelection: 'Selección de Servicios',
  connection: 'Conectividad de Red',
  architecturePattern: 'Patrón Arquitectónico',
  availability: 'Alta Disponibilidad',
  security: 'Seguridad y Aislamiento',
  performance: 'Rendimiento',
  costOptimization: 'Optimización de Costos',
  hintPenalty: 'Penalización de Pistas',
  configuration: 'Configuración'
};

export const FeedbackList: React.FC<FeedbackListProps> = ({
  summary,
  items,
  className = ''
}) => {
  const [activeFilter, setActiveFilter] = useState<FeedbackFilterTab>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'pass') {
      return items.filter((item) => item.status === 'pass');
    }
    if (activeFilter === 'issues') {
      return items.filter((item) => item.status === 'fail' || item.status === 'warning');
    }
    return items;
  }, [items, activeFilter]);

  const passCount = useMemo(() => items.filter((i) => i.status === 'pass').length, [items]);
  const issueCount = useMemo(
    () => items.filter((i) => i.status === 'fail' || i.status === 'warning').length,
    [items]
  );

  const renderStatusIcon = (status: FeedbackItemDto['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  const getCardStyle = (status: FeedbackItemDto['status']) => {
    switch (status) {
      case 'pass':
        return 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20';
      case 'fail':
        return 'border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20';
      case 'info':
      default:
        return 'border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20';
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      {/* Banner de Resumen Pedagógico */}
      {summary && (
        <div className="p-3.5 mb-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
          {summary}
        </div>
      )}

      {/* Selector de Filtros */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('pass')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            activeFilter === 'pass'
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          Aciertos ({passCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('issues')}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            activeFilter === 'issues'
              ? 'bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          Observaciones ({issueCount})
        </button>
      </div>

      {/* Lista Scrolleable de Diagnósticos */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0 max-h-[340px]">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No hay elementos en esta categoría.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={`${item.category}-${index}`}
              data-testid="feedback-item"
              className={`p-3 rounded-lg border flex gap-3 items-start transition-all ${getCardStyle(
                item.status
              )}`}
            >
              {renderStatusIcon(item.status)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {categoryLabels[item.category] || item.category}
                  </span>

                  {item.penaltyApplied > 0 && (
                    <span className="text-xs font-extrabold text-rose-500">
                      -{item.penaltyApplied} pts
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {item.explanation}
                </p>

                {/* Bloque Formativo: Riesgo en Producción y Recomendación (Fase 0) */}
                {(item.productionRisk || item.formativeRecommendation) && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-[11px]">
                    {item.wellArchitectedPillar && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <span>Pilar: {item.wellArchitectedPillar}</span>
                      </div>
                    )}
                    {item.productionRisk && (
                      <div className="text-rose-700 dark:text-rose-300 leading-relaxed">
                        <span className="font-bold">💥 Riesgo en Producción:</span> {item.productionRisk}
                      </div>
                    )}
                    {item.formativeRecommendation && (
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-bold text-amber-600 dark:text-amber-400">💡 Recomendación:</span> {item.formativeRecommendation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
