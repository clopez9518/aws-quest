import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/useAuthStore';
import { useDictionaryStore } from '../features/dictionary/stores/useDictionaryStore';
import { DictionaryModal } from '../features/dictionary/components/DictionaryModal';
import { DictionaryDrawer } from '../features/dictionary/components/DictionaryDrawer';
import { XpProgressBar } from '../shared/components/XpProgressBar';
import { UserSessionMenu } from '../features/auth/components/UserSessionMenu';
import { AuthModal } from '../features/auth/components/AuthModal';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { Cloud } from 'lucide-react';

export function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const openSpotlight = useDictionaryStore((state) => state.openSpotlight);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* WCAG 2.4.1 (A) Skip Link accesible */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-950"
      >
        Saltar al contenido principal
      </a>

      {/* Persistent Global Header */}
      <header role="banner" className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 transition-colors duration-200">
        {/* Brand & Logo */}
        <Link to="/catalog" className="flex items-center space-x-3 group" aria-label="AWS Quest - Ir al Catálogo">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors uppercase flex items-center space-x-1.5">
              <span>AWS Quest</span>
            </h1>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider font-mono">
              Architecture Arena
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center space-x-1 sm:space-x-2" aria-label="Navegación principal">
          <Link
            to="/catalog"
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Desafíos
          </Link>
          <Link
            to="/dictionary"
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Diccionario
          </Link>
        </nav>

        {/* User Stats, Dictionary Button, Theme Toggle & Session Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => openSpotlight()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition-colors shadow-xs"
            aria-label="Abrir glosario y diccionario (Ctrl + K)"
            title="Abrir glosario y diccionario (Ctrl + K)"
          >
            <span className="text-sm">📚</span>
            <span className="hidden sm:inline">Glosario</span>
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs text-slate-500">
              Ctrl K
            </kbd>
          </button>
          <XpProgressBar totalXp={user?.totalXP ?? 0} />
          <ThemeToggle />
          <UserSessionMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        </div>
      </header>

      {/* Main Outlet */}
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto focus:outline-none">
        <Outlet />
      </main>

      {/* Modal de Autenticación / Migración */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Spotlight del Diccionario */}
      <DictionaryModal />

      {/* Panel Lateral Contextual del Diccionario */}
      <DictionaryDrawer />
    </div>
  );
}
