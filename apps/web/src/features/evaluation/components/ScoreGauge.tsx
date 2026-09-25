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

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Semáforo cromático
  const getColorClasses = () => {
    if (score >= 70) {
      return {
        stroke: 'stroke-emerald-500',
        text: 'text-emerald-500 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      };
    }
    if (score >= 40) {
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-500 dark:text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      };
    }
    return {
      stroke: 'stroke-rose-500',
      text: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {/* Gráfico Radial SVG */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Círculo de fondo */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Círculo animado de progreso */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${colors.stroke} transition-all duration-1000 ease-out`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Contenido Central */}
        <div className="absolute flex flex-col items-center justify-center">
          <span data-testid="score-gauge-value" className={`text-4xl font-black tracking-tight ${colors.text}`}>
            {animatedScore}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            de 100 pts
          </span>
        </div>
      </div>

      {/* Badge de Estado */}
      <div
        className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${colors.badgeBg}`}
      >
        {passed ? (
          <div data-testid="evaluation-status-pass" className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>¡Desafío Aprobado!</span>
          </div>
        ) : (
          <div data-testid="evaluation-status-fail" className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>No Aprobado (Mínimo 70 pts)</span>
          </div>
        )}
      </div>

      {/* Badges de Gamificación: XP y High Score */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {earnedXP > 0 && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-gradient-to-r from-amber-500 to-aws-orange text-white text-xs font-extrabold shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{earnedXP} XP Ganada</span>
          </div>
        )}

        {isNewHighScore && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold border border-purple-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>¡Nuevo Récord!</span>
          </div>
        )}
      </div>
    </div>
  );
};
