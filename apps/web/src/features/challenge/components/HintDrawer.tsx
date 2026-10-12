import { useState } from 'react';
import { Lightbulb, X, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { ChallengeHint } from '../types/challenge.types';
import { HintUnlockModal } from './HintUnlockModal';

interface HintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hints: ChallengeHint[];
  unlockedCount: number;
  onUnlockHint: (orderIndex: number) => void;
}

export function HintDrawer({
  isOpen,
  onClose,
  hints,
  unlockedCount,
  onUnlockHint
}: HintDrawerProps) {
  const [pendingHintToUnlock, setPendingHintToUnlock] = useState<ChallengeHint | null>(null);

  if (!isOpen) return null;

  // Calcular penalización total acumulada hasta el momento
  const totalPenalty = hints
    .filter((h) => h.isUnlocked)
    .reduce((sum, h) => sum + h.penaltyPoints, 0);

  // La siguiente pista a desbloquear debe ser exactamente la número unlockedCount + 1 (RN-06)
  const nextHintToUnlock = hints.find((h) => h.orderIndex === unlockedCount + 1);

  return (
    <>
      {/* Fondo oscuro para dispositivos móviles o pantallas ajustadas */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs"
        aria-hidden="true"
      />

      <aside
        data-testid="hint-drawer"
        className="fixed top-14 bottom-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-30 flex flex-col shadow-2xl select-none"
        aria-label="Cajón de pistas"
      >
        {/* Cabecera del Drawer */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 bg-white/90 dark:bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Pistas Progresivas
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {unlockedCount} de {hints.length} desbloqueadas
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-hint-drawer-button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Cerrar pistas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen de Penalización */}
        {totalPenalty > 0 && (
          <div data-testid="hint-penalty-summary" className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span>Penalización acumulada:</span>
            <span className="font-mono font-bold">-{totalPenalty} pts</span>
          </div>
        )}

        {/* Lista de Pistas Secuenciales */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {hints.map((hint) => {
            const isUnlocked = hint.isUnlocked;
            const isNext = nextHintToUnlock?.orderIndex === hint.orderIndex;

            return (
              <div
                key={hint.orderIndex}
                data-testid="hint-card"
                className={`p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30 dark:border-amber-500/40 shadow-xs'
                    : isNext
                    ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-amber-500/30 shadow-xs dark:shadow-inner'
                    : 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    {isUnlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Pista #{hint.orderIndex}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isUnlocked
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20'
                        : isNext
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    -{hint.penaltyPoints} pts
                  </span>
                </div>

                {isUnlocked ? (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {hint.text}
                  </p>
                ) : isNext ? (
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Esta pista está disponible. Puedes revelarla asumiendo la penalización de puntuación.
                    </p>
                    <button
                      type="button"
                      data-testid="unlock-next-hint-button"
                      onClick={() => setPendingHintToUnlock(hint)}
                      className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm shadow-amber-500/20 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Desbloquear Pista (-{hint.penaltyPoints} pts)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                    Completa o desbloquea las pistas anteriores para acceder a esta pista (RN-06).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Modal de Confirmación de Desbloqueo */}
      <HintUnlockModal
        isOpen={pendingHintToUnlock !== null}
        hint={pendingHintToUnlock}
        onClose={() => setPendingHintToUnlock(null)}
        onConfirm={() => {
          if (pendingHintToUnlock) {
            onUnlockHint(pendingHintToUnlock.orderIndex);
          }
        }}
      />
    </>
  );
}
