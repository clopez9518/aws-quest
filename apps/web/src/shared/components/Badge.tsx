import React from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant =
  | 'default'
  | 'easy'
  | 'intermediate'
  | 'hard'
  | 'capstone'
  | 'security'
  | 'reliability'
  | 'cost'
  | 'operational'
  | 'performance'
  | 'sustainability'
  | 'pass'
  | 'fail'
  | 'warning'
  | 'info'
  | 'mastered'
  | 'in-progress'
  | 'in-focus'
  | 'amber'
  | 'cyan'
  | 'violet';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  dot = false,
  icon,
  children,
  ...props
}) => {
  const sizeClasses: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1 font-medium tracking-wide',
    sm: 'px-2 py-0.5 text-xs gap-1.5 font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold tracking-wide',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#374151]',
    
    // Dificultades
    easy: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60',
    intermediate: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60',
    hard: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60',
    capstone: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60',

    // Pilares AWS Well-Architected
    security: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60',
    reliability: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60',
    cost: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60',
    operational: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60',
    performance: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60',
    sustainability: 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700/60',

    // Feedback & Diagnóstico
    pass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600',
    fail: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-400 dark:border-rose-600',
    warning: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-600',
    info: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-400 dark:border-sky-600',

    // Estados de Currículum
    mastered: 'bg-sky-100 dark:bg-[#00354A] text-sky-900 dark:text-[#7BD0FF] border border-sky-300 dark:border-[#00A6E0]/60',
    'in-progress': 'bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-600/50',
    'in-focus': 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/60',

    // Acentos de Color Tácticos
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-[#FFC082] border border-amber-300 dark:border-[#FF9900]/60',
    cyan: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-[#7BD0FF] border border-sky-300 dark:border-[#38BDF8]/60',
    violet: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-[#D5C3FF] border border-purple-300 dark:border-[#8B5CF6]/60',
  };

  const dotColors: Partial<Record<BadgeVariant, string>> = {
    easy: 'bg-emerald-500 dark:bg-emerald-400',
    intermediate: 'bg-sky-500 dark:bg-sky-400',
    hard: 'bg-amber-500 dark:bg-amber-400',
    capstone: 'bg-purple-500 dark:bg-purple-400',
    security: 'bg-rose-500 dark:bg-rose-400',
    reliability: 'bg-cyan-500 dark:bg-cyan-400',
    cost: 'bg-emerald-500 dark:bg-emerald-400',
    operational: 'bg-amber-500 dark:bg-amber-400',
    performance: 'bg-blue-500 dark:bg-blue-400',
    sustainability: 'bg-teal-500 dark:bg-teal-400',
    pass: 'bg-emerald-500 dark:bg-emerald-400',
    fail: 'bg-rose-500 dark:bg-rose-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    info: 'bg-sky-500 dark:bg-sky-400',
    amber: 'bg-[#FF9900]',
    cyan: 'bg-[#0284C7] dark:bg-[#38BDF8]',
    violet: 'bg-[#8B5CF6]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full select-none shrink-0 font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || 'bg-slate-400'
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
