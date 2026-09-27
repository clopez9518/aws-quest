import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Activity,
  DollarSign,
  Leaf,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Check
} from 'lucide-react';
import {
  ChallengeReflectionPromptDto,
  SubmitReflectionAnswerResponseDto,
  WellArchitectedPillar
} from '../types/challenge.types';
import { submitReflectionAnswer } from '../api/challengeApi';
import { useAuthStore } from '../../../shared/stores/useAuthStore';

export interface ActiveLearningPromptCardProps {
  challengeId: string;
  prompt: ChallengeReflectionPromptDto;
  onAnswerSubmitted?: (result: SubmitReflectionAnswerResponseDto) => void;
}

const pillarMetadata: Record<
  WellArchitectedPillar,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Security: {
    label: 'Seguridad',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: <Shield className="w-3.5 h-3.5" />
  },
  Reliability: {
    label: 'Fiabilidad',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: <Activity className="w-3.5 h-3.5" />
  },
  PerformanceEfficiency: {
    label: 'Rendimiento',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: <Zap className="w-3.5 h-3.5" />
  },
  CostOptimization: {
    label: 'Optimización de Costos',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: <DollarSign className="w-3.5 h-3.5" />
  },
  OperationalExcellence: {
    label: 'Excelencia Operativa',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: <Sparkles className="w-3.5 h-3.5" />
  },
  Sustainability: {
    label: 'Sostenibilidad',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    icon: <Leaf className="w-3.5 h-3.5" />
  }
};

export const ActiveLearningPromptCard: React.FC<ActiveLearningPromptCardProps> = ({
  challengeId,
  prompt,
  onAnswerSubmitted
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    prompt.selectedOptionId ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitReflectionAnswerResponseDto | null>(null);

  const updateUser = useAuthStore((state) => state.updateUser);

  const pillarInfo = pillarMetadata[prompt.pillar] ?? pillarMetadata.Reliability;
  const isAlreadyAnswered = Boolean(result || prompt.isCompleted);

  const handleSubmit = async () => {
    if (!selectedOptionId || isSubmitting || isAlreadyAnswered) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await submitReflectionAnswer(challengeId, selectedOptionId);
      setResult(response);

      if (response.bonusXpEarned > 0) {
        updateUser({
          totalXP: response.currentUserXP,
          level: response.currentUserLevel
        });
      }

      onAnswerSubmitted?.(response);
    } catch (err: unknown) {
      console.error('[ActiveLearningPromptCard] Error al enviar respuesta:', err);
      setError('No se pudo enviar tu respuesta. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="active-learning-prompt-card"
      className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-lg shadow-indigo-950/20 transition-all space-y-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header con Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reflexión Activa</span>
          </span>

          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pillarInfo.bg} ${pillarInfo.text} border ${pillarInfo.border}`}
          >
            {pillarInfo.icon}
            <span>Pilar: {pillarInfo.label}</span>
          </span>
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
          +{prompt.bonusXP || 25} Bonus XP
        </span>
      </div>

      {/* Pregunta Conceptual */}
      <div className="space-y-1 relative z-10">
        <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
          {prompt.question}
        </h4>
        <p className="text-xs text-slate-400">
          Selecciona la justificación arquitectónica más sólida para consolidar tu aprendizaje:
        </p>
      </div>

      {/* Lista de Opciones */}
      <div className="space-y-2.5 relative z-10" role="radiogroup" aria-label="Opciones de reflexión">
        {prompt.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const explanationObj = result?.allExplanations.find((e) => e.id === option.id);
          const isOptionCorrect = explanationObj?.isCorrect;
          const isRevealed = Boolean(result);

          let optionCardStyle =
            'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-850/50';

          if (isRevealed) {
            if (isOptionCorrect) {
              optionCardStyle =
                'border-emerald-500/60 bg-emerald-950/30 text-emerald-200';
            } else if (isSelected && !isOptionCorrect) {
              optionCardStyle =
                'border-rose-500/60 bg-rose-950/30 text-rose-200';
            } else {
              optionCardStyle =
                'border-slate-800/80 bg-slate-950/30 text-slate-500 opacity-60';
            }
          } else if (isSelected) {
            optionCardStyle =
              'border-indigo-500 bg-indigo-950/30 text-indigo-100 shadow-sm ring-1 ring-indigo-500/50';
          }

          return (
            <div
              key={option.id}
              onClick={() => {
                if (!isRevealed && !isSubmitting && !prompt.isCompleted) {
                  setSelectedOptionId(option.id);
                }
              }}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer ${optionCardStyle}`}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`reflection-${challengeId}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setSelectedOptionId(option.id)}
                  disabled={isRevealed || isSubmitting || Boolean(prompt.isCompleted)}
                  className="w-4 h-4 mt-0.5 text-indigo-500 focus:ring-indigo-400 border-slate-700 bg-slate-900"
                />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                  <span>{option.text}</span>

                  {/* Explicación Revelada */}
                  {explanationObj && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs font-normal border ${
                        explanationObj.isCorrect
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-800 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        {explanationObj.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Justificación Correcta!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Concepto a Mejorar</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-300">{explanationObj.explanation}</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Feedback de Error si ocurre */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Botón de Confirmación o Estado Final */}
      {!result && !prompt.isCompleted && (
        <div className="flex items-center justify-end pt-1 relative z-10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all duration-150 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Validando reflexión...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                <span>Confirmar Respuesta (+25 XP)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Banner de Éxito cuando se completa */}
      {result && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between relative z-10 ${
            result.isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {result.isCorrect ? (
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">
              {result.isCorrect
                ? `¡Excelente razonamiento! +${result.bonusXpEarned} XP añadidos a tu perfil.`
                : 'Reflexión registrada. Revisa las explicaciones para afianzar el concepto.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
