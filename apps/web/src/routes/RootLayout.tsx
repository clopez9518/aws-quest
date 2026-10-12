import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/useAuthStore';
import { useDictionaryStore } from '../features/dictionary/stores/useDictionaryStore';
import { DictionaryModal } from '../features/dictionary/components/DictionaryModal';
import { DictionaryDrawer } from '../features/dictionary/components/DictionaryDrawer';
import { XpProgressBar } from '../shared/components/XpProgressBar';
import { UserSessionMenu } from '../features/auth/components/UserSessionMenu';
import { AuthModal } from '../features/auth/components/AuthModal';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { Search, HelpCircle } from 'lucide-react';
import {
  OnboardingTutorialModal,
  ONBOARDING_STORAGE_KEY
} from '../features/catalog/components/OnboardingTutorialModal';

export function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const openSpotlight = useDictionaryStore((state) => state.openSpotlight);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const location = useLocation();

  const isCatalog = location.pathname.startsWith('/catalog');
  const isDictionary = location.pathname.startsWith('/dictionary');

  // Comprobar si es la primera visita del usuario a la aplicación
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!completed) {
          setIsOnboardingOpen(true);
        }
      }
    } catch {
      // Ignorar restricciones en entornos sin acceso a localStorage
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#FF9900] selection:text-slate-950 overflow-hidden">
      {/* WCAG 2.4.1 (A) Skip Link accesible */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FF9900] focus:text-[#0B0F19] focus:font-bold focus:rounded focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>

      {/* Persistent Global Header - Command Console Bar */}
      <header
        role="banner"
        className="h-16 border-b border-slate-200 dark:border-[#374151]/80 bg-white dark:bg-[#111827] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-xs dark:shadow-elevation-card transition-colors"
      >
        {/* Brand & Logo con Constelación Stitch */}
        <div className="flex items-center space-x-3">
          <Link
            to="/catalog"
            className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9900] rounded-lg p-1"
            aria-label="AWS Quest - Ir al Catálogo"
          >
            {/* Emblema Constelación */}
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#171B26] border border-[#FF9900]/70 flex items-center justify-center shadow-glow-amber/20 group-hover:border-[#FF9900] group-hover:scale-105 transition-all">
              <svg className="w-5 h-5 text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L4 19h16L12 3z" stroke="currentColor" fill="none" />
                <path d="M7.5 13.5h9" stroke="currentColor" />
                <circle cx="12" cy="3" r="2" fill="#38BDF8" stroke="#38BDF8" />
                <circle cx="4" cy="19" r="2" fill="#38BDF8" stroke="#38BDF8" />
                <circle cx="20" cy="19" r="2" fill="#38BDF8" stroke="#38BDF8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white group-hover:text-[#FF9900] dark:group-hover:text-[#FFC082] transition-colors uppercase">
                  AWS Quest
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/10 text-amber-700 dark:text-[#FFC082] border border-amber-500/30 dark:border-[#FF9900]/40 rounded font-mono">
                  v2.4 Pro
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-widest font-mono uppercase block -mt-0.5">
                Architecture Arena
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links Tácticos */}
        <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Navegación principal">
          <Link
            to="/catalog"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isCatalog
                ? 'text-amber-700 dark:text-[#FFC082] bg-amber-50 dark:bg-[#1F2937] border border-amber-300 dark:border-[#374151]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937]/50'
            }`}
          >
            Itinerario & Desafíos
          </Link>
          <Link
            to="/dictionary"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isDictionary
                ? 'text-amber-700 dark:text-[#FFC082] bg-amber-50 dark:bg-[#1F2937] border border-amber-300 dark:border-[#374151]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937]/50'
            }`}
          >
            Diccionario Cloud & Pilares
          </Link>
        </nav>

        {/* Search Command Trigger, User Stats & Session Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Botón de Búsqueda Rápida Spotlight (Stitch) */}
          <button
            type="button"
            onClick={() => openSpotlight()}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-[#1F2937] hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-[#374151] transition-all cursor-pointer shadow-inner focus-visible:ring-2 focus-visible:ring-[#FF9900]"
            aria-label="Abrir glosario y diccionario (Ctrl + K)"
            title="Abrir glosario y diccionario (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#FF9900]" />
            <span className="hidden xl:inline text-slate-500 dark:text-slate-400">Buscar en glosario...</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded text-sky-600 dark:text-[#7BD0FF]">
              ⌘K
            </kbd>
          </button>

          {/* Botón de Tutorial / Ayuda */}
          <button
            type="button"
            data-testid="header-tutorial-button"
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FF9900] dark:hover:text-[#FFC082] bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] rounded-lg border border-slate-300 dark:border-[#374151] transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#FF9900]"
            title="Abrir Tutorial y Guía Rápida"
            aria-label="Abrir Tutorial de Bienvenida"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#FF9900]" />
            <span className="hidden md:inline">Tutorial</span>
          </button>

          <XpProgressBar totalXp={user?.totalXP ?? 0} />
          <ThemeToggle />
          <UserSessionMenu onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        </div>
      </header>

      {/* Main Outlet */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto focus:outline-none bg-slate-100 dark:bg-[#0B0F19]"
      >
        <Outlet />
      </main>

      {/* Modal de Onboarding / Tutorial de Bienvenida */}
      <OnboardingTutorialModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => setIsOnboardingOpen(false)}
      />

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

