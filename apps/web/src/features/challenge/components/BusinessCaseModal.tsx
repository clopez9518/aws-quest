import {
  X,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Boxes,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { ArchitectureRequirement } from '../types/challenge.types';
import { DifficultyLevel, ChallengeMode } from '../../catalog/types/catalog.types';

export interface BusinessCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  description: string;
  mode?: ChallengeMode;
  difficulty?: DifficultyLevel;
  businessScenario?: string | null;
  requirements?: ArchitectureRequirement[];
  allowedServices?: Array<{
    code: string;
    name: string;
    category?: string;
    iconUrl?: string;
  }>;
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

export function BusinessCaseModal({
  isOpen,
  onClose,
  challengeTitle,
  description,
  mode = 'builder',
  difficulty = 'easy',
  businessScenario,
  requirements = [],
  allowedServices = []
}: BusinessCaseModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const isFixMode =
    mode === 'fixArchitecture' ||
    (typeof mode === 'string' && (mode as string).toLowerCase() === 'fixarchitecture');

  const diff = difficultyLabels[difficulty] || difficultyLabels.easy;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-case-modal-title"
      data-testid="business-case-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-200"
      >
        {/* Glow decorativo Stitch (Sky/Blue) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-start justify-between shrink-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Caso de Negocio & Contexto
                </span>
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
              </div>
              <h2
                id="business-case-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1"
              >
                {challengeTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-business-case-modal"
            onClick={onClose}
            aria-label="Cerrar caso de negocio"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm custom-scrollbar relative z-10">
          {/* 1. Descripción de la Problemática del Negocio */}
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

          {/* 2. Escenario Operativo Real si existe */}
          {businessScenario && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-start space-x-3">
                <Layers className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-1.5 text-xs uppercase tracking-wider">
                    Contexto Operacional & Carga de Trabajo
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                    {businessScenario}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Requerimientos y Criterios de Aceptación */}
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

          {/* 4. Servicios Disponibles en la Solución */}
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
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-end shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/20 transition-all duration-150 cursor-pointer"
          >
            <span>¡Entendido, volver al Lienzo!</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
