import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outline' | 'focus';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] shadow-xs',
      elevated: 'bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] shadow-elevation-card',
      interactive:
        'bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-[#171B26] transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md',
      outline: 'bg-transparent border border-slate-200 dark:border-[#374151]',
      focus: 'bg-amber-50/60 dark:bg-[#171B26] border border-[#FF9900]/80 shadow-glow-amber/20',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl overflow-hidden', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 sm:p-5 flex flex-col gap-1 border-b border-slate-200 dark:border-[#374151]/60', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 sm:p-5', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-4 sm:p-5 border-t border-slate-200 dark:border-[#374151]/60 bg-slate-50 dark:bg-[#0E1320]/60 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';
