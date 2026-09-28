import { Lightbulb, AlertCircle } from 'lucide-react';
import { ChallengeHint } from '../types/challenge.types';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';

interface HintUnlockModalProps {
  isOpen: boolean;
  hint: ChallengeHint | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function HintUnlockModal({
  isOpen,
  hint,
  onClose,
  onConfirm
}: HintUnlockModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: isOpen && hint !== null, onClose });

  if (!isOpen || !hint) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-modal-title"
      data-testid="hint-unlock-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div ref={modalRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3 text-amber-500 dark:text-amber-400">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 id="hint-modal-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Desbloquear Pista #{hint.orderIndex}
            </h3>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
              Penalización: -{hint.penaltyPoints} puntos
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Esta pista te orientará en la selección o interconexión de servicios, pero restará{' '}
          <strong className="text-amber-600 dark:text-amber-400">
            {hint.penaltyPoints} puntos
          </strong>{' '}
          de tu nota máxima posible en este intento.
        </p>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>El descuento de puntos se aplicará de forma irreversible a tu intento actual.</span>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            data-testid="cancel-unlock-hint-button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Mantener Bloqueada
          </button>
          <button
            type="button"
            data-testid="confirm-unlock-hint-button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Desbloquear (-{hint.penaltyPoints} pts)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
