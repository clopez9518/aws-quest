import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, AlertOctagon, Lightbulb, Shield } from 'lucide-react';
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
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />;
    }
  };

  const getCardStyle = (status: FeedbackItemDto['status']) => {
    switch (status) {
      case 'pass':
        return 'border-emerald-500/20 bg-emerald-950/10 dark:bg-emerald-950/20 hover:border-emerald-500/40';
      case 'fail':
        return 'border-rose-500/30 bg-rose-950/10 dark:bg-rose-950/20 hover:border-rose-500/50';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/10 dark:bg-amber-950/20 hover:border-amber-500/50';
      case 'info':
      default:
        return 'border-sky-500/20 bg-sky-950/10 dark:bg-sky-950/20 hover:border-sky-500/40';
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      {/* Banner de Resumen Pedagógico */}
      {summary && (
        <div className="p-3 mb-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 leading-relaxed">
          {summary}
        </div>
      )}

      {/* Selector de Filtros */}
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          Todos ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('pass')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeFilter === 'pass'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
              : 'text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/30'
          }`}
        >
          Aciertos ({passCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('issues')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeFilter === 'issues'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
              : 'text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30'
          }`}
        >
          Observaciones ({issueCount})
        </button>
      </div>

      {/* Lista Scrolleable de Diagnósticos */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0 max-h-[360px] custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No hay elementos en esta categoría.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={`${item.category}-${index}`}
              data-testid="feedback-item"
              className={`p-3 rounded-xl border flex gap-3 items-start transition-all ${getCardStyle(
                item.status
              )}`}
            >
              {renderStatusIcon(item.status)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {categoryLabels[item.category] || item.category}
                  </span>

                  {item.penaltyApplied > 0 && (
                    <span className="text-xs font-mono font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      -{item.penaltyApplied} pts
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-100 mb-1">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {item.explanation}
                </p>

                {/* Bloque Formativo: Riesgo en Producción y Recomendación */}
                {(item.productionRisk || item.formativeRecommendation || item.wellArchitectedPillar) && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                    {item.wellArchitectedPillar && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>Pilar: {item.wellArchitectedPillar}</span>
                      </div>
                    )}
                    {item.productionRisk && (
                      <div className="flex items-start gap-1.5 text-rose-300 leading-relaxed bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-rose-400">Riesgo en Producción: </span>
                          <span>{item.productionRisk}</span>
                        </div>
                      </div>
                    )}
                    {item.formativeRecommendation && (
                      <div className="flex items-start gap-1.5 text-slate-300 leading-relaxed bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-400">Recomendación Formativa: </span>
                          <span>{item.formativeRecommendation}</span>
                        </div>
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
