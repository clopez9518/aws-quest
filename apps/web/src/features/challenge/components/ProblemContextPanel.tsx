import { useState } from 'react';
import {
  FileText,
  Boxes,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ExternalLink
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
  onOpenBusinessCase?: () => void;
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
  onOpenBusinessCase,
  onToggleCollapse,
  onRestoreAttempt
}: ProblemContextPanelProps) {
  const [activeTab, setActiveTab] = useState<ContextPanelTab>('services');

  if (isCollapsed) {
    return (
      <div className="w-10 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#374151] flex flex-col items-center py-3 z-10 shrink-0 select-none shadow-xs">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#374151] hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          title="Expandir panel lateral"
          aria-label="Expandir panel lateral"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="mt-8 flex flex-col space-y-5 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => {
              setActiveTab('services');
              onToggleCollapse();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-[#FF9900] transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-[#FF9900] transition-colors cursor-pointer"
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
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-[#FF9900] transition-colors cursor-pointer"
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
      className="w-72 sm:w-80 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#374151] flex flex-col z-10 shrink-0 select-none transition-all shadow-xs dark:shadow-elevation-card"
      aria-label="Panel de Contexto y Herramientas"
    >
      {/* Cabecera con Tabs y botón de colapso */}
      <div className="h-11 border-b border-slate-200 dark:border-[#374151] px-2.5 flex items-center justify-between bg-slate-50 dark:bg-[#111827]">
        <div className="flex items-center space-x-1" role="tablist" aria-label="Secciones del panel">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'services'}
            aria-controls="panel-tab-content"
            id="tab-services"
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'bg-white dark:bg-[#1F2937] text-[#FF9900] border border-slate-200 dark:border-[#374151] font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937]/50'
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
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-white dark:bg-[#1F2937] text-[#FF9900] border border-slate-200 dark:border-[#374151] font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937]/50'
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
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#1F2937] text-[#FF9900] border border-slate-200 dark:border-[#374151] font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1F2937]/50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg border border-slate-200 dark:border-[#374151] hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors shrink-0 cursor-pointer"
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
        className="flex-1 p-3 overflow-hidden bg-white dark:bg-[#111827]"
      >
        {activeTab === 'services' && (
          <ServicePalette allowedServices={allowedServices} />
        )}

        {activeTab === 'requirements' && (
          <div className="h-full overflow-y-auto space-y-3 pr-1 text-xs custom-scrollbar">
            {/* Aviso de Arquitectura Defectuosa en Modo FIX_ARCHITECTURE */}
            {(mode === 'fixArchitecture' ||
              (typeof mode === 'string' && mode.toLowerCase() === 'fixarchitecture')) && (
              <div
                role="status"
                aria-label="Aviso de modo reparación"
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertTriangle className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    Arquitectura con problemas detectados
                  </h4>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                    Analiza la arquitectura precargada en el lienzo y corrige los problemas identificados para restaurar el servicio.
                  </p>
                </div>
              </div>
            )}

            {/* Micro-Cápsula de Contexto */}
            {hasBriefing && onOpenBriefing && (
              <button
                type="button"
                onClick={onOpenBriefing}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-500/30 text-left transition-all hover:border-amber-400 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[#FF9900]" />
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                      Micro-Cápsula de Contexto
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                    Leer →
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                  Escenario de negocio, metas de aprendizaje y conceptos clave.
                </p>
              </button>
            )}

            {/* Enunciado del Desafío */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-[#FF9900]" />
                  <span>{mode === 'fixArchitecture' ? 'Objetivo del Incidente' : 'Caso de Negocio'}</span>
                </div>
                {onOpenBusinessCase && (
                  <button
                    type="button"
                    onClick={onOpenBusinessCase}
                    className="text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                    title="Ver caso de negocio completo en modal"
                  >
                    <span>Ver modal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Requisitos y Criterios de Aceptación */}
            {requirements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Criterios de Aceptación
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {requirements.length} requisito{requirements.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-2">
                  {requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] space-y-1 text-xs"
                    >
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-slate-200 leading-snug">
                          {req.title || (req as any).text}
                        </span>
                      </div>
                      {(req.description || (req as any).rationale) && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 leading-relaxed">
                          {req.description || (req as any).rationale}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full flex flex-col">
            <AttemptHistoryList
              challengeId={challengeId ?? ''}
              onRestoreAttempt={onRestoreAttempt}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
