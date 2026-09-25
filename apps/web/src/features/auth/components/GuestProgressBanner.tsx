import React from 'react';
import { Sparkles, UserPlus, ArrowRight } from 'lucide-react';

export interface GuestProgressBannerProps {
  onRegisterClick: () => void;
  totalXp?: number;
  compact?: boolean;
  className?: string;
}

export const GuestProgressBanner: React.FC<GuestProgressBannerProps> = ({
  onRegisterClick,
  totalXp = 0,
  compact = false,
  className = ''
}) => {
  if (compact) {
    return (
      <div
        data-testid="guest-progress-banner-compact"
        className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">
            Modo Invitado ({totalXp} XP)
          </span>
        </div>
        <button
          type="button"
          data-testid="guest-progress-banner-cta"
          onClick={onRegisterClick}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-colors"
        >
          Guardar
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="guest-progress-banner"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-500/30 p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>¿Quieres conservar tu progreso?</span>
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Estás jugando como <strong className="text-amber-600 dark:text-amber-400">Invitado</strong>. Crea una cuenta gratuita para sincronizar tus <strong className="text-amber-600 dark:text-amber-400">{totalXp} XP</strong> y récords históricos.
            </p>
          </div>
        </div>

        <button
          type="button"
          data-testid="guest-progress-banner-cta"
          onClick={onRegisterClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0 active:scale-[0.98]"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Crear cuenta y migrar XP</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
