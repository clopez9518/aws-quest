import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw, ArrowRight, LayoutGrid } from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { FeedbackList } from './FeedbackList';
import { GuestProgressBanner } from '../../auth/components/GuestProgressBanner';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { EvaluateArchitectureResponseDto } from '../types/evaluation.types';
import { ChallengeReflectionPromptDto } from '../../challenge/types/challenge.types';
import { ActiveLearningPromptCard } from '../../challenge/components/ActiveLearningPromptCard';

export interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: EvaluateArchitectureResponseDto | null;
  challengeTitle: string;
  challengeId?: string;
  reflectionPrompt?: ChallengeReflectionPromptDto | null;
  nextChallengeId?: string | null;
  onRetry?: () => void;
  onNextChallenge?: () => void;
  onRegisterClick?: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  result,
  challengeTitle,
  challengeId,
  reflectionPrompt,
  nextChallengeId,
  onRetry,
  onNextChallenge,
  onRegisterClick
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: isOpen && result !== null, onClose });

  // Bloqueo de scroll en body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !result) {
    return null;
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (onNextChallenge) {
      onNextChallenge();
    } else if (nextChallengeId) {
      onClose();
      navigate(`/challenges/${nextChallengeId}`);
    } else {
      onClose();
      navigate('/catalog');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Contenedor Modal */}
      <div
        ref={modalRef}
        data-testid="evaluation-modal"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <span className="text-xs font-bold text-aws-orange uppercase tracking-wider">
              Diagnóstico de Arquitectura
            </span>
            <h2
              id="evaluation-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {challengeTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de evaluación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo Principal: Grid de 2 Columnas */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Gauge Radial */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-center h-full">
              <ScoreGauge
                score={result.score}
                passed={result.passed}
                isNewHighScore={result.isNewHighScore}
                earnedXP={result.earnedXP}
              />
            </div>

            {/* Columna Derecha: Feedback List */}
            <div className="md:col-span-7 flex flex-col h-full min-h-0">
              <FeedbackList
                summary={result.feedback.summary}
                items={result.feedback.items}
              />
            </div>
          </div>

          {/* Bloque de Consolidación Post-Desafío (Fase 0) */}
          {result.passed && (result.feedback.keyConceptsLearned?.length || result.feedback.architecturalTradeoffs) && (
            <div data-testid="consolidation-card" className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-slate-50 dark:to-slate-900 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                <span className="text-amber-500">🎓</span>
                <span>Consolidación de Arquitectura Cloud</span>
              </div>

              {result.feedback.keyConceptsLearned && result.feedback.keyConceptsLearned.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Buenas Prácticas Demostradas:
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {result.feedback.keyConceptsLearned.map((concept, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        ✓ {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.feedback.architecturalTradeoffs && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
                  <span className="font-bold text-slate-700 dark:text-slate-200">💡 Trade-offs & Evolución: </span>
                  {result.feedback.architecturalTradeoffs}
                </p>
              )}
            </div>
          )}

          {/* Checkpoint de Reflexión Activa (Oportunidad 3 / Versión 3.0) */}
          {result.passed && challengeId && reflectionPrompt && (
            <ActiveLearningPromptCard
              challengeId={challengeId}
              prompt={reflectionPrompt}
            />
          )}

          {/* Banner de Migración de Progreso si el usuario es Invitado */}
          {user?.isGuest && onRegisterClick && (
            <GuestProgressBanner
              onRegisterClick={onRegisterClick}
              totalXp={user.totalXP}
            />
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
          {/* Acción Secundaria: Reintentar */}
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar solución</span>
          </button>

          {/* Acción Principal: Siguiente Desafío / Catálogo */}
          <div className="flex items-center gap-2">
            {result.passed ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-600 hover:to-aws-orange shadow-md transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-aws-orange"
              >
                <span>{nextChallengeId ? 'Siguiente Desafío' : 'Volver al Catálogo'}</span>
                {nextChallengeId ? <ArrowRight className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/catalog');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Explorar Catálogo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
