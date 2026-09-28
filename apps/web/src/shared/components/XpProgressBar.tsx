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

  // Título de rango según el nivel
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 8) return 'Master Cloud Architect';
    if (lvl >= 6) return 'Lead Infrastructure Architect';
    if (lvl >= 4) return 'Solutions Architect';
    if (lvl >= 2) return 'Cloud Practitioner';
    return 'Junior Cloud Architect';
  };

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
      className={`relative flex items-center space-x-2.5 bg-white dark:bg-[#111827] border px-3 py-1.5 rounded-xl shadow-xs dark:shadow-elevation-card transition-all duration-300 ${
        isPulsing
          ? 'border-[#FF9900] ring-2 ring-[#FF9900]/40 shadow-glow-amber'
          : 'border-slate-200 dark:border-[#374151] hover:border-slate-300 dark:hover:border-slate-500'
      }`}
    >
      {/* Píldora Flotante Animada (+XP) */}
      {xpDelta !== null && (
        <div
          data-testid="xp-floating-delta"
          role="status"
          aria-live="polite"
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#FF9900] text-slate-950 font-black text-[10px] shadow-lg shadow-[#FF9900]/40 animate-bounce flex items-center space-x-1 z-30 pointer-events-none"
        >
          <Zap className="w-2.5 h-2.5 fill-current" />
          <span>+{xpDelta} XP</span>
        </div>
      )}

      {/* Emblema de Nivel */}
      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#1F2937] border border-[#FF9900]/40 flex items-center justify-center text-[#FF9900] font-mono font-bold text-xs shrink-0 shadow-inner">
        {level}
      </div>

      <div className="flex flex-col min-w-[100px] sm:min-w-[130px]">
        <div className="flex items-center justify-between text-[10px] leading-tight mb-1">
          <span className="font-bold text-slate-900 dark:text-slate-200 tracking-tight flex items-center gap-1">
            <Award className="w-3 h-3 text-[#FF9900]" />
            <span>Nivel {level}</span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-normal">({getLevelTitle(level)})</span>
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {currentLevelXp}/{xpForNextLevel} XP
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-slate-100 dark:bg-[#0B0F19] h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-[#374151]">
          <div
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso del nivel ${level}`}
            className="bg-gradient-to-r from-[#FF9900] to-amber-300 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
