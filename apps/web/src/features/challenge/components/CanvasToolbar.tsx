import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface CanvasToolbarProps {
  onOpenResetModal: () => void;
  nodeCount: number;
}

export function CanvasToolbar({ onOpenResetModal, nodeCount }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1.5 p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm select-none">
      {/* Controles de Zoom */}
      <button
        type="button"
        onClick={() => zoomIn({ duration: 300 })}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Acercar (+)"
        aria-label="Acercar zoom"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => zoomOut({ duration: 300 })}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Alejar (-)"
        aria-label="Alejar zoom"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Ajustar a pantalla"
        aria-label="Ajustar vista a pantalla"
      >
        <Maximize className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:border-slate-700/80 mx-1" />

      {/* Botón Reiniciar Canvas */}
      <button
        data-testid="reset-canvas-button"
        type="button"
        onClick={onOpenResetModal}
        disabled={nodeCount === 0}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          nodeCount > 0
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
            : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
        }`}
        title={nodeCount > 0 ? 'Restablecer el canvas al estado inicial' : 'El canvas ya está vacío'}
        aria-label="Reiniciar canvas"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Reiniciar</span>
      </button>
    </div>
  );
}
