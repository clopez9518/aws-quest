import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';

interface ResetCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetCanvasModal({
  isOpen,
  onClose,
  onConfirm
}: ResetCanvasModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      data-testid="reset-canvas-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
    >
      <div ref={modalRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="reset-modal-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ¿Reiniciar el Canvas?
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Se restablecerán todos los componentes y conexiones a su estado inicial. Todos los cambios no evaluados se perderán.
        </p>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-rose-600/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirmar Reinicio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
