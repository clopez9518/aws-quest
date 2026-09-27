import React from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'underline' | 'pills';
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'segmented',
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Navegación por pestañas',
}) => {
  const containerVariants = {
    segmented: 'bg-[#0B0F19] p-1 rounded border border-[#374151] inline-flex items-center gap-1',
    underline: 'border-b border-[#374151] flex items-center gap-4',
    pills: 'inline-flex items-center gap-2',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs sm:text-sm gap-2',
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(containerVariants[variant], className)}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        const isDisabled = tab.disabled;

        let itemClasses = '';

        if (variant === 'segmented') {
          itemClasses = isActive
            ? 'bg-[#FF9900] text-[#0B0F19] font-bold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#1F2937]/60 font-medium';
        } else if (variant === 'underline') {
          itemClasses = isActive
            ? 'text-[#FF9900] border-b-2 border-[#FF9900] font-bold -mb-[1px]'
            : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent font-medium';
        } else if (variant === 'pills') {
          itemClasses = isActive
            ? 'bg-[#1F2937] text-white border border-[#FF9900] font-semibold'
            : 'bg-[#111827] text-slate-400 border border-[#374151] hover:text-slate-200 hover:bg-[#1F2937] font-medium';
        }

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            disabled={isDisabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => !isDisabled && onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center rounded transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900]',
              sizeClasses[size],
              itemClasses,
              isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
