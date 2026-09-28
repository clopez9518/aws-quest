import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ShieldAlert, Sparkles, ChevronDown, Bell } from 'lucide-react';
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
        <div
          data-testid="guest-session-badge"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/60 text-amber-800 dark:text-amber-300 text-xs font-semibold"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#FF9900]" />
          <span>Modo Invitado</span>
        </div>

        <button
          data-testid="user-session-menu"
          onClick={onOpenAuthModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF9900]"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Guardar progreso</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Botón de Notificaciones */}
      <button
        type="button"
        aria-label="Ver notificaciones del sistema"
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] border border-slate-200 dark:border-[#374151] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] shadow-xs"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B0F19]" />
      </button>

      {/* Menú de Usuario */}
      <div className="relative" ref={menuRef}>
        <button
          data-testid="user-session-menu"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2.5 p-1 pr-2.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1F2937] border border-slate-200 dark:border-[#374151] hover:border-slate-300 dark:hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF9900] cursor-pointer shadow-xs"
          aria-expanded={isOpen}
        >
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#1F2937] border border-[#FF9900]/40 flex items-center justify-center text-[#FF9900] font-bold text-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">{user.name}</p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Registrado
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-[#374151]/60 bg-slate-50 dark:bg-[#171B26]">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email || 'Sin correo'}</p>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-200 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
