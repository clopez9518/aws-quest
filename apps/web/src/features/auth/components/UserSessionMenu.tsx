import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserSessionMenuProps {
  onOpenAuthModal: () => void;
}

export function UserSessionMenu({ onOpenAuthModal }: UserSessionMenuProps) {
  const { user, isGuest, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isGuest || !user) {
    return (
      <div className="flex items-center space-x-2">
        <div data-testid="guest-session-badge" className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
          <span>Modo Invitado</span>
        </div>

        <button
          data-testid="user-session-menu"
          onClick={onOpenAuthModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Guardar progreso</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        data-testid="user-session-menu"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <User className="w-4 h-4" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Registrado</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email || 'Sin correo'}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800/80 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
