import { useState, useEffect, useRef } from 'react';
import { Award, Zap } from 'lucide-react';
import { getXpProgress } from '../utils/gamification';

interface XpProgressBarProps {
  totalXp: number;
}

export function XpProgressBar({ totalXp }: XpProgressBarProps) {
  const { level, currentLevelXp, xpForNextLevel, percentage } = getXpProgress(totalXp);
  const [xpDelta, setXpDelta] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevXpRef = useRef(totalXp);

  // Detectar incremento de XP para disparar animación y píldora flotante
  useEffect(() => {
    const prev = prevXpRef.current;
    if (totalXp > prev) {
      const delta = totalXp - prev;
      setXpDelta(delta);
      setIsPulsing(true);

      const timer = setTimeout(() => {
        setXpDelta(null);
        setIsPulsing(false);
      }, 2500);

      prevXpRef.current = totalXp;
      return () => clearTimeout(timer);
    }
    prevXpRef.current = totalXp;
  }, [totalXp]);

  return (
    <div
      className={`relative flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/90 border px-3 py-1.5 rounded-full shadow-inner transition-all duration-300 ${
        isPulsing
          ? 'border-amber-500 ring-2 ring-amber-500/30 dark:ring-amber-400/20'
          : 'border-slate-200 dark:border-slate-700/80'
      }`}
    >
      {/* Píldora Flotante Animada (+XP) */}
      {xpDelta !== null && (
        <div
          data-testid="xp-floating-delta"
          role="status"
          aria-live="polite"
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg shadow-amber-500/30 animate-bounce flex items-center space-x-1 z-30 pointer-events-none"
        >
          <Zap className="w-2.5 h-2.5 fill-current" />
          <span>+{xpDelta} XP</span>
        </div>
      )}

      {/* Badge de Nivel */}
      <div data-testid="header-level-badge" className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
        <Award className="w-4 h-4" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          Nivel {level}
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-600 text-xs">|</span>

      {/* Barra de Progreso XP */}
      <div className="flex items-center space-x-2">
        <div className="w-24 sm:w-32 h-2 bg-slate-200 dark:bg-slate-950/80 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/50 relative">
          <div
            className={`h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 ease-out ${
              isPulsing ? 'shadow-[0_0_12px_rgba(245,158,11,0.8)] brightness-110' : 'shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            }`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-label="Progreso de experiencia para el siguiente nivel"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${currentLevelXp} de ${xpForNextLevel} XP para nivel ${level + 1}`}
          />
        </div>
        <div data-testid="header-total-xp" className="flex items-center text-[10px] font-mono font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
          <Zap className="w-2.5 h-2.5 mr-0.5 text-amber-500 dark:text-amber-400" />
          <span>{currentLevelXp}/{xpForNextLevel} XP</span>
        </div>
      </div>
    </div>
  );
}
