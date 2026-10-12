import { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  BookOpen,
  Clock,
  Target,
  Building2,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Boxes,
  AlertTriangle,
  Layers,
  Key,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useDictionaryStore } from '../../dictionary/stores/useDictionaryStore';
import { resolveDictionarySlug } from '../../dictionary/utils/dictionarySlugResolver';
import { ChallengeBriefingDto, ArchitectureRequirement } from '../types/challenge.types';
import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';

export type ChallengeContextTab = 'businessCase' | 'briefing';

export interface ChallengeContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  challengeId: string;
  description: string;
  mode?: ChallengeMode;
  difficulty?: DifficultyLevel;
  briefing?: ChallengeBriefingDto | null;
  requirements?: ArchitectureRequirement[];
  allowedServices?: Array<{
    code: string;
    name: string;
    category?: string;
    iconUrl?: string;
  }>;
  initialTab?: ChallengeContextTab;
}

const difficultyLabels: Record<DifficultyLevel, { label: string; badgeClass: string }> = {
  easy: {
    label: 'Fácil',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/50'
  },
  intermediate: {
    label: 'Intermedio',
    badgeClass: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 border-sky-300 dark:border-sky-700/50'
  },
  hard: {
    label: 'Difícil',
    badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700/50'
  },
  integrator: {
    label: 'Integrador',
    badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-700/50'
  }
};

export function ChallengeContextModal({
  isOpen,
  onClose,
  challengeTitle,
  challengeId,
  description,
  mode = 'builder',
  difficulty = 'easy',
  briefing,
  requirements = [],
  allowedServices = [],
  initialTab = 'businessCase'
}: ChallengeContextModalProps) {
  const [activeTab, setActiveTab] = useState<ChallengeContextTab>(initialTab);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);

  const openDrawer = useDictionaryStore((state) => state.openDrawer);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      const isHidden =
        localStorage.getItem(`awsquest_hide_briefing_${challengeId}`) === 'true';
      setDontShowAgain(isHidden);
    }
  }, [isOpen, initialTab, challengeId]);

  if (!isOpen) return null;

  const isFixMode =
    mode === 'fixArchitecture' ||
    (typeof mode === 'string' && (mode as string).toLowerCase() === 'fixarchitecture');

  const diff = difficultyLabels[difficulty] || difficultyLabels.easy;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`awsquest_hide_briefing_${challengeId}`, 'true');
    } else {
      localStorage.removeItem(`awsquest_hide_briefing_${challengeId}`);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-context-modal-title"
      data-testid="challenge-context-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-200"
      >
        {/* Glow decorativo según pestaña activa */}
        <div
          className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
            activeTab === 'businessCase' ? 'bg-sky-500/10' : 'bg-amber-500/10'
          }`}
        />

        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-start justify-between shrink-0 relative z-10">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${diff.badgeClass}`}>
                {diff.label}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                  isFixMode
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isFixMode ? 'Incidente / Reparación' : 'Builder / Diseño'}
              </span>
              {briefing && activeTab === 'briefing' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {briefing.estimatedReadTime || '30 seg'} de lectura
                </span>
              )}
            </div>

            <h2
              id="challenge-context-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
            >
              {challengeTitle}
            </h2>

            {/* Pestañas de Navegación Segmentadas */}
            <div
              className="mt-3 inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              role="tablist"
              aria-label="Pestañas de contexto del desafío"
            >
              <button
                type="button"
                role="tab"
                id="tab-btn-business-case"
                aria-selected={activeTab === 'businessCase'}
                aria-controls="tab-content-business-case"
                data-testid="modal-tab-business-case"
                onClick={() => setActiveTab('businessCase')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'businessCase'
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Caso de Negocio</span>
              </button>

              {briefing && (
                <button
                  type="button"
                  role="tab"
                  id="tab-btn-briefing"
                  aria-selected={activeTab === 'briefing'}
                  aria-controls="tab-content-briefing"
                  data-testid="modal-tab-briefing"
                  onClick={() => setActiveTab('briefing')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'briefing'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Briefing Técnico</span>
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            data-testid="close-challenge-context-modal"
            onClick={handleClose}
            aria-label="Cerrar ventana de contexto"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll según pestaña */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm custom-scrollbar relative z-10 flex-1">
          {/* TAB 1: CASO DE NEGOCIO */}
          {activeTab === 'businessCase' && (
            <div
              id="tab-content-business-case"
              role="tabpanel"
              aria-labelledby="tab-btn-business-case"
              className="space-y-4 animate-in fade-in duration-150"
            >
              {/* Problemática del Negocio */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40">
                <div className="flex items-start space-x-3">
                  {isFixMode ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sky-800 dark:text-sky-300 mb-1.5 text-xs uppercase tracking-wider">
                      {isFixMode ? 'Incidente de Producción y Problema Técnico' : 'Planteamiento y Necesidad del Cliente'}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Escenario Operativo si existe */}
              {briefing?.businessScenario && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start space-x-3">
                    <Layers className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-1.5 text-xs uppercase tracking-wider">
                        Contexto Operacional & Carga de Trabajo
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                        {briefing.businessScenario}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Requerimientos y Criterios de Aceptación */}
              {requirements.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      Criterios de Aceptación y Restricciones
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {requirements.length} requerimiento{requirements.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {requirements.map((req, idx) => (
                      <div
                        key={req.id || idx}
                        className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-200 block leading-snug">
                              {req.title}
                            </span>
                            {req.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                {req.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios Disponibles */}
              {allowedServices.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <Boxes className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
                      Servicios Autorizados para este Desafío
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {allowedServices.map((svc) => (
                      <span
                        key={svc.code}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-xs"
                      >
                        {svc.iconUrl && (
                          <img
                            src={svc.iconUrl}
                            alt=""
                            className="w-3.5 h-3.5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{svc.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner de acceso rápido al Briefing Técnico si existe */}
              {briefing && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-900 dark:text-amber-200 truncate">
                      ¿Deseas repasar los conceptos clave y arquitectura cloud recomendada?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('briefing')}
                    className="inline-flex items-center text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline cursor-pointer shrink-0"
                  >
                    <span>Ver Briefing</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BRIEFING TÉCNICO */}
          {activeTab === 'briefing' && briefing && (
            <div
              id="tab-content-briefing"
              role="tabpanel"
              aria-labelledby="tab-btn-briefing"
              className="space-y-4 animate-in fade-in duration-150"
            >
              {/* 1. Meta de Aprendizaje */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-700 dark:text-amber-300 mb-1 text-xs uppercase tracking-wider">
                      Meta de Aprendizaje
                    </h3>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm">
                      {briefing.learningObjective}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Escenario de Negocio Real */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-sky-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sky-700 dark:text-blue-300 mb-1 text-xs uppercase tracking-wider">
                      Escenario de Negocio Real
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {briefing.businessScenario}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Concepto Clave & Principio Cloud */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-1 text-xs uppercase tracking-wider">
                      Concepto Clave & Principio Cloud
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                      {briefing.keyConcept}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3.1. Conceptos y Componentes Clave con Glosario */}
              {briefing.keyComponents && briefing.keyComponents.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => setIsComponentsOpen((prev) => !prev)}
                    aria-expanded={isComponentsOpen}
                    aria-controls="briefing-key-components-content"
                    data-testid="briefing-key-components-toggle"
                    className="w-full px-3.5 py-3 sm:px-4 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors text-xs sm:text-sm">
                          Conceptos y componentes clave
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {briefing.keyComponents.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                      <span className="hidden sm:inline">
                        {isComponentsOpen ? 'Plegar' : 'Desplegar'}
                      </span>
                      {isComponentsOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200" />
                      )}
                    </div>
                  </button>

                  {isComponentsOpen && (
                    <div
                      id="briefing-key-components-content"
                      data-testid="briefing-key-components-list"
                      className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 space-y-2.5 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-150"
                    >
                      {briefing.keyComponents.map((item, idx) => {
                        const isService =
                          item.category === 'service' ||
                          (item.serviceCode && item.serviceCode.startsWith('AWS_'));
                        const termSlug = resolveDictionarySlug(item.serviceCode, item.title, item.slug);
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                                  <span>{item.title}</span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => openDrawer(termSlug)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer"
                                  aria-label={`Ver ${item.title} en el glosario`}
                                >
                                  <span>📖 Ver en glosario</span>
                                </button>
                              </div>
                              {item.category && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                    isService
                                      ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {isService ? 'Servicio AWS' : 'Concepto'}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Puntos Clave de Arquitectura */}
              {briefing.keyTakeaways && briefing.keyTakeaways.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                    Puntos Clave de Arquitectura
                  </h3>
                  <ul className="space-y-2">
                    {briefing.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
            />
            <span>No volver a mostrar automáticamente en este desafío</span>
          </label>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {activeTab === 'briefing' && (
              <button
                type="button"
                onClick={() => setActiveTab('businessCase')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <span>← Caso de Negocio</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-150 cursor-pointer text-xs ${
                activeTab === 'businessCase'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <span>¡Entendido, vamos al Canvas!</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
