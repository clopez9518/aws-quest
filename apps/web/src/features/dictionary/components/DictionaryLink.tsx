import React from 'react';
import { useDictionaryStore } from '../stores/useDictionaryStore';

export interface DictionaryLinkProps {
  slug: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const DictionaryLink: React.FC<DictionaryLinkProps> = ({
  slug,
  label,
  children,
  className = '',
  showIcon = false,
}) => {
  const openDrawer = useDictionaryStore((state) => state.openDrawer);

  const displayText = children ?? label ?? slug;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openDrawer(slug);
      }}
      className={`inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors cursor-pointer text-inherit ${className}`}
      aria-label={`Ver ${label ?? displayText} en el glosario`}
      title={`Ver ${label ?? displayText} en el glosario`}
    >
      {showIcon && <span className="text-[11px] select-none">📖</span>}
      <span>{displayText}</span>
    </button>
  );
};
