import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'cyan' | 'violet';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses: Record<ButtonSize, string> = {
      xs: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
      sm: 'px-3 py-1.5 text-xs gap-1.5 font-semibold',
      md: 'px-4 py-2 text-sm gap-2 font-semibold',
      lg: 'px-5 py-2.5 text-base gap-2.5 font-bold',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[#FF9900] text-[#0B0F19] hover:bg-[#FFAC1C] active:bg-[#E68A00] focus-visible:ring-2 focus-visible:ring-[#FF9900] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19] shadow-sm',
      secondary:
        'bg-[#111827] text-slate-200 border border-[#374151] hover:bg-[#1F2937] hover:border-slate-500 hover:text-white active:bg-[#262A35] focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
      ghost:
        'bg-transparent text-slate-300 hover:bg-[#1F2937] hover:text-white active:bg-[#262A35] focus-visible:ring-2 focus-visible:ring-slate-400',
      destructive:
        'bg-rose-950/40 text-rose-300 border border-rose-800/80 hover:bg-rose-900/60 hover:text-white active:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
      cyan:
        'bg-[#00354A] text-[#7BD0FF] border border-[#00A6E0]/60 hover:bg-[#004C69] hover:text-white active:bg-[#002C3D] focus-visible:ring-2 focus-visible:ring-[#38BDF8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
      violet:
        'bg-purple-950/40 text-purple-300 border border-purple-700/60 hover:bg-purple-900/60 hover:text-white active:bg-purple-800 focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F19]',
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded transition-all duration-150 select-none cursor-pointer outline-none',
          sizeClasses[size],
          variantClasses[variant],
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none shadow-none',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            data-testid="button-spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
