import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Trophy, Sparkles } from 'lucide-react';

export interface ScoreGaugeProps {
  score: number;
  passed: boolean;
  isNewHighScore?: boolean;
  earnedXP: number;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  passed,
  isNewHighScore = false,
  earnedXP,
  className = ''
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animación del número y trazado de 0 al valor final
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Semáforo cromático
  const getColorClasses = () => {
    if (score >= 70) {
      return {
        stroke: 'stroke-emerald-500',
        text: 'text-emerald-500 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
        glow: 'from-emerald-500/10 to-transparent'
      };
    }
    if (score >= 40) {
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-500 dark:text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 shadow-amber-500/10',
        glow: 'from-amber-500/10 to-transparent'
      };
    }
    return {
      stroke: 'stroke-rose-500',
      text: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 shadow-rose-500/10',
      glow: 'from-rose-500/10 to-transparent'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`flex flex-col items-center justify-center p-5 text-center relative overflow-hidden rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 ${className}`}>
      {/* Glow ambiental */}
      <div className={`absolute inset-0 bg-radial ${colors.glow} opacity-40 pointer-events-none`} />

      {/* Gráfico Radial SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 160 160">
          {/* Círculo de fondo */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Círculo animado de progreso */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${colors.stroke} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Contenido Central */}
        <div className="absolute flex flex-col items-center justify-center">
          <span data-testid="score-gauge-value" className={`text-4xl font-mono font-black tracking-tight ${colors.text}`}>
            {animatedScore}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            de 100 pts
          </span>
        </div>
      </div>

      {/* Badge de Estado */}
      <div
        className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${colors.badgeBg}`}
      >
        {passed ? (
          <div data-testid="evaluation-status-pass" className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>¡Desafío Aprobado!</span>
          </div>
        ) : (
          <div data-testid="evaluation-status-fail" className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>No Aprobado (Mínimo 70 pts)</span>
          </div>
        )}
      </div>

      {/* Badges de Gamificación: XP y High Score */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {earnedXP > 0 && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{earnedXP} XP Ganada</span>
          </div>
        )}

        {isNewHighScore && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-500/30">
            <Trophy className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            <span>¡Nuevo Récord!</span>
          </div>
        )}
      </div>
    </div>
  );
};
