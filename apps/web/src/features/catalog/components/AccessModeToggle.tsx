import { Sparkles, Lock, Loader2 } from 'lucide-react';
import { AccessMode } from '../types/systemConfig.types';

interface AccessModeToggleProps {
  accessMode: AccessMode;
  onToggle: (mode: AccessMode) => void;
  isUpdating?: boolean;
}

export function AccessModeToggle({ accessMode, onToggle, isUpdating = false }: AccessModeToggleProps) {
  const isOpen = accessMode === 'openAccess';

  return (
    <div data-testid="access-mode-toggle" className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-sm transition-colors duration-200">
      <div className="flex items-center space-x-1.5 px-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Modo de Acceso:</span>
      </div>

      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => !isOpen && !isUpdating && onToggle('openAccess')}
          disabled={isUpdating}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isOpen
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white'
          } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
          title="Todos los desafíos desbloqueados para experimentación libre"
        >
          {isUpdating && isOpen ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-slate-950 dark:text-slate-950" />
          )}
          <span>Modo Libre</span>
        </button>

        <button
          type="button"
          onClick={() => isOpen && !isUpdating && onToggle('progressive')}
          disabled={isUpdating}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            !isOpen
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white'
          } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
          title="Desbloqueo secuencial por prerrequisito y experiencia requerida"
        >
          {isUpdating && !isOpen ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span>Progresivo</span>
        </button>
      </div>
    </div>
  );
}
