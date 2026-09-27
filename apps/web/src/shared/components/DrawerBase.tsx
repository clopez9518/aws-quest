import React, { useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { cn } from '../utils/cn';

export interface DrawerBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const DrawerBase: React.FC<DrawerBaseProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  className,
  'aria-label': ariaLabel,
}) => {
  const drawerRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md sm:max-w-lg',
    lg: 'w-full max-w-xl sm:max-w-2xl',
    xl: 'w-full max-w-3xl sm:max-w-4xl',
  };

  const positionClasses = {
    right: 'right-0 top-0 bottom-0 border-l border-[#374151] animate-in slide-in-from-right duration-200',
    left: 'left-0 top-0 bottom-0 border-r border-[#374151] animate-in slide-in-from-left duration-200',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel || 'Panel lateral'}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0E18]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="drawer-backdrop"
      />

      {/* Panel Deslizable */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={cn(
          'fixed z-10 flex flex-col bg-[#111827] shadow-elevation-drawer outline-none',
          positionClasses[position],
          sizeClasses[size],
          className
        )}
      >
        {/* Encabezado */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#374151]/60 bg-[#171B26]/60 shrink-0">
            <div className="flex-1 pr-3">
              {title && (
                <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar panel lateral"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1F2937] rounded transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Cuerpo con Scroll */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto">{children}</div>

        {/* Pie */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-[#374151]/60 bg-[#0E1320]/60 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
