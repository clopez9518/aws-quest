import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      data-testid="theme-toggle-button"
      className={`p-2 rounded-xl border transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        isDark
          ? 'bg-slate-800/90 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:text-amber-300 shadow-inner'
          : 'bg-white border-slate-200 text-amber-500 hover:bg-slate-100 hover:text-amber-600 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
