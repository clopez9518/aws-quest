import { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Clock,
  Target,
  Building2,
  Lightbulb,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { ChallengeBriefingDto } from '../types/challenge.types';

export interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  briefing?: ChallengeBriefingDto | null;
  challengeId: string;
}

export function BriefingModal({
  isOpen,
  onClose,
  challengeTitle,
  briefing,
  challengeId
}: BriefingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      const isHidden = localStorage.getItem(`awsquest_hide_briefing_${challengeId}`) === 'true';
      setDontShowAgain(isHidden);
    }
  }, [isOpen, challengeId]);

  if (!isOpen || !briefing) return null;

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
      aria-labelledby="briefing-modal-title"
      data-testid="briefing-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-200"
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Micro-Cápsula de Contexto
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {briefing.estimatedReadTime || '30 seg'} de lectura
                </span>
              </div>
              <h2
                id="briefing-modal-title"
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5"
              >
                {challengeTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar briefing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm">
          {/* 1. Meta de Aprendizaje */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Meta de Aprendizaje
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {briefing.learningObjective}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Escenario de Negocio Real */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Escenario de Negocio Real
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {briefing.businessScenario}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Concepto Clave & Principio Cloud */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Concepto Clave & Principio Cloud
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {briefing.keyConcept}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Puntos Clave de Arquitectura (Takeaways) */}
          {briefing.keyTakeaways && briefing.keyTakeaways.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2.5 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Puntos Clave de Arquitectura
              </h3>
              <ul className="space-y-2">
                {briefing.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 dark:bg-slate-800"
            />
            <span>No volver a mostrar automáticamente en este desafío</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-150"
          >
            <span>¡Entendido, vamos al Canvas!</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
