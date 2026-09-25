import React, { useEffect } from 'react';
import { Trophy, Sparkles, ArrowRight, X } from 'lucide-react';

export interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp: number;
}

function getArchitectTitle(level: number): string {
  if (level <= 1) return 'Cloud Novice';
  if (level === 2) return 'Cloud Practitioner Apprentice';
  if (level === 3) return 'Solutions Architect Associate';
  if (level === 4) return 'Solutions Architect Professional';
  return 'Principal Cloud Master';
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  totalXp
}) => {
  // Atajo de teclado Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const title = getArchitectTitle(newLevel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 p-8 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow de Fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar celebración de nivel"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Corona / Trofeo con animación */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 transform -rotate-3 hover:rotate-0 transition-transform">
            <Trophy className="w-12 h-12 stroke-[2.2]" />
          </div>
          <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Título de Celebración */}
        <div className="space-y-1 mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            ¡Subiste de Nivel!
          </span>
          <h2
            id="levelup-modal-title"
            className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
          >
            Nivel {newLevel}
          </h2>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {title}
          </p>
        </div>

        {/* Mensaje de Progreso */}
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
          Has acumulado <strong className="text-amber-600 dark:text-amber-400 font-bold">{totalXp} XP</strong> diseñando arquitecturas resilientes y optimizadas en AWS.
        </p>

        {/* Botón de Continuar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <span>¡Continuar construyendo!</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
