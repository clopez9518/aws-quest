import { useState } from 'react';
import {
  FileText,
  Boxes,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen
} from 'lucide-react';
import { ArchitectureRequirement } from '../types/challenge.types';
import { ChallengeMode } from '../../catalog/types/catalog.types';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { ServicePalette } from './ServicePalette';
import { AttemptHistoryList } from '../../evaluation/components/AttemptHistoryList';
import { ChallengeAttemptHistoryDto } from '../../evaluation/types/evaluation.types';

export type ContextPanelTab = 'services' | 'requirements' | 'history';

export interface ProblemContextPanelProps {
  challengeId?: string;
  description: string;
  mode?: ChallengeMode;
  requirements?: ArchitectureRequirement[];
  allowedServices: ServicePaletteItem[];
  isCollapsed: boolean;
  hasBriefing?: boolean;
  onOpenBriefing?: () => void;
  onToggleCollapse: () => void;
  onRestoreAttempt?: (attempt: ChallengeAttemptHistoryDto, attemptNumber: number) => void;
}

export function ProblemContextPanel({
  challengeId,
  description,
  mode,
  requirements = [],
  allowedServices,
  isCollapsed,
  hasBriefing = false,
  onOpenBriefing,
  onToggleCollapse,
  onRestoreAttempt
}: ProblemContextPanelProps) {
  const [activeTab, setActiveTab] = useState<ContextPanelTab>('services');

  if (isCollapsed) {
    return (
      <div className="w-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-3 z-10 shrink-0 select-none">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          title="Expandir panel lateral"
          aria-label="Expandir panel lateral"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="mt-8 flex flex-col space-y-6 text-slate-400">
          <button
            type="button"
            onClick={() => {
              setActiveTab('services');
              onToggleCollapse();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors"
            title="Abrir paleta de servicios"
            aria-label="Abrir paleta de servicios"
          >
            <Boxes className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('requirements');
              onToggleCollapse();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors"
            title="Abrir requisitos"
            aria-label="Abrir requisitos"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              onToggleCollapse();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors"
            title="Abrir historial de intentos"
            aria-label="Abrir historial de intentos"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 shrink-0 select-none transition-all"
      aria-label="Panel de Contexto y Herramientas"
    >
      {/* Cabecera con Tabs y botón de colapso */}
      <div className="h-11 border-b border-slate-200 dark:border-slate-800 px-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-1" role="tablist" aria-label="Secciones del panel">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'services'}
            aria-controls="panel-tab-content"
            id="tab-services"
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'services'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Servicios</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'requirements'}
            aria-controls="panel-tab-content"
            id="tab-requirements"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'requirements'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Requisitos</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            aria-controls="panel-tab-content"
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0"
          title="Colapsar panel lateral"
          aria-label="Colapsar panel lateral"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contenido del Tab Activo */}
      <div
        id="panel-tab-content"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 p-3 overflow-hidden"
      >
        {activeTab === 'services' && (
          <ServicePalette allowedServices={allowedServices} />
        )}

        {activeTab === 'requirements' && (
          <div className="h-full overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Aviso de Arquitectura Defectuosa en Modo FIX_ARCHITECTURE */}
            {(mode === 'fixArchitecture' ||
              (typeof mode === 'string' && mode.toLowerCase() === 'fixarchitecture')) && (
              <div
                role="status"
                aria-label="Aviso de modo reparación"
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-amber-950 dark:text-amber-100">
                    Arquitectura con problemas detectados
                  </h4>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                    Analiza la arquitectura precargada en el lienzo y corrige los problemas de diseño, disponibilidad y escalabilidad.
                  </p>
                </div>
              </div>
            )}

            {/* Botón / Banner de Acceso al Briefing */}
            {onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                data-testid="panel-briefing-button"
                className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/15 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Ver Briefing del Desafío
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Conceptos clave y escenario de negocio
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            )}

            {/* Contexto del caso de negocio */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                <span>Caso de Negocio</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                {description}
              </p>
            </div>

            {/* Requisitos y Reglas Específicas */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Requisitos de Arquitectura
              </h4>

              {requirements.length === 0 ? (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] text-center">
                  Diseña una arquitectura óptima siguiendo las mejores prácticas del AWS Well-Architected Framework.
                </div>
              ) : (
                <div className="space-y-2">
                  {requirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-1"
                    >
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        {req.type === 'anti_pattern' ? (
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                        <span className="truncate">{req.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal pl-4.5">
                        {req.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto pr-1">
            <AttemptHistoryList
              challengeId={challengeId}
              onRestoreAttempt={onRestoreAttempt ?? (() => {})}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
