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
      className={`relative flex items-center space-x-2.5 bg-[#111827] border px-3 py-1.5 rounded-lg shadow-elevation-card transition-all duration-300 ${
        isPulsing
          ? 'border-[#FF9900] ring-2 ring-[#FF9900]/40 shadow-glow-amber'
          : 'border-[#374151] hover:border-slate-500'
      }`}
    >
      {/* Píldora Flotante Animada (+XP) */}
      {xpDelta !== null && (
        <div
          data-testid="xp-floating-delta"
          role="status"
          aria-live="polite"
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#FF9900] text-[#0B0F19] font-black text-[10px] shadow-lg shadow-[#FF9900]/40 animate-bounce flex items-center space-x-1 z-30 pointer-events-none"
        >
          <Zap className="w-2.5 h-2.5 fill-current" />
          <span>+{xpDelta} XP</span>
        </div>
      )}

      {/* Badge de Nivel */}
      <div data-testid="header-level-badge" className="flex items-center space-x-1.5 text-[#FFC082]">
        <div className="w-5 h-5 rounded bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
          <Award className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-100 whitespace-nowrap leading-none">
            Nivel {level}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline leading-none mt-0.5">
            {getLevelTitle(level)}
          </span>
        </div>
      </div>

      <span className="text-[#374151] text-xs">|</span>

      {/* Barra de Progreso XP */}
      <div className="flex items-center space-x-2">
        <div className="w-20 sm:w-28 h-1.5 bg-[#0B0F19] rounded-full overflow-hidden border border-[#374151]/80 relative">
          <div
            className={`h-full bg-gradient-to-r from-[#FF9900] to-[#FFC082] rounded-full transition-all duration-700 ease-out ${
              isPulsing ? 'shadow-[0_0_12px_rgba(255,153,0,0.9)] brightness-125' : 'shadow-[0_0_6px_rgba(255,153,0,0.5)]'
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
        <div
          data-testid="header-total-xp"
          className="flex items-center text-[10px] font-mono font-semibold text-[#FFC082] whitespace-nowrap"
        >
          <Zap className="w-2.5 h-2.5 mr-0.5 text-[#FF9900] fill-current" />
          <span>{currentLevelXp}/{xpForNextLevel} XP</span>
        </div>
      </div>
    </div>
  );
}

