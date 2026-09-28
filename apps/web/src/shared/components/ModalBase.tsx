import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { cn } from '../utils/cn';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const ModalBase: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  className,
  'aria-label': ariaLabel,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : ariaLabel || 'Diálogo modal'}
    >
      {/* Backdrop con Blur */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      {/* Contenedor del Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-2xl shadow-2xl z-10 my-8 overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-150',
          sizeClasses[size],
          className
        )}
      >
        {/* Encabezado */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-[#374151]/60 bg-slate-50/80 dark:bg-[#171B26]/50">
            <div className="flex-1 pr-4">
              {title && (
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937] rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]"
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

        {/* Cuerpo */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto text-slate-900 dark:text-slate-100">{children}</div>

        {/* Pie */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#374151]/60 bg-slate-50/80 dark:bg-[#0E1320]/60 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
