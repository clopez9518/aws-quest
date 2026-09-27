import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

export interface RestoreAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  attemptNumber: number;
  attemptScore: number;
  currentNodesCount: number;
}

export function RestoreAttemptModal({
  isOpen,
  onClose,
  onConfirm,
  attemptNumber,
  attemptScore,
  currentNodesCount
}: RestoreAttemptModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-attempt-title"
    >
      <div
        data-testid="restore-attempt-modal"
        ref={modalRef}
        className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200"
      >
        {/* Cabecera con icono de alerta */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="restore-attempt-title"
                className="text-sm font-bold text-slate-100"
              >
                ¿Cargar Intento #{attemptNumber}?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Puntaje obtenido: <span className="font-mono font-semibold text-amber-400">{attemptScore}/100 pts</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensaje de advertencia */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          Al cargar este intento previo, se <span className="font-bold text-rose-400">reemplazará la arquitectura actual</span> en el lienzo ({currentNodesCount} servicio{currentNodesCount === 1 ? '' : 's'}) por el diseño guardado en este intento.
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reemplazar y Cargar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
