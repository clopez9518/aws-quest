import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDictionaryStore } from '../stores/useDictionaryStore';
import { useDictionaryTermDetail } from '../hooks/useDictionary';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { formatPillarLabel } from '../utils/dictionaryFormatters';

function getCategoryBadgeClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'service':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'concept':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'infrastructure':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'well-architected':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }
}

function getCategoryLabel(category: string): string {
  switch (category.toLowerCase()) {
    case 'service':
      return 'Servicio AWS';
    case 'concept':
      return 'Concepto Cloud';
    case 'infrastructure':
      return 'Infraestructura';
    case 'well-architected':
      return 'Well-Architected';
    default:
      return category;
  }
}

function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    case 'intermediate':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30';
    case 'hard':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30';
    case 'integrator':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }
}

export const DictionaryDrawer: React.FC = () => {
  const { isDrawerOpen, activeSlug, closeDrawer, openDrawer } = useDictionaryStore();
  const navigate = useNavigate();

  const drawerRef = useFocusTrap<HTMLDivElement>({
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
    autoFocus: true,
  });

  const { data: term, isLoading, isError } = useDictionaryTermDetail(activeSlug);

  if (!isDrawerOpen) return null;

  const handleChallengeClick = (challengeId: string) => {
    closeDrawer();
    navigate(`/challenge/${challengeId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeDrawer();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dictionary-drawer-title"
    >
      <div
        ref={drawerRef}
        className="w-full sm:max-w-xl md:max-w-2xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250"
      >
        {/* Encabezado del Drawer */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {term && (
                <>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getCategoryBadgeClass(
                      term.category
                    )}`}
                  >
                    {getCategoryLabel(term.category)}
                  </span>
                  {term.serviceCode && (
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {term.serviceCode}
                    </span>
                  )}
                  {term.pillar && (
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      🏛️ {formatPillarLabel(term.pillar)}
                    </span>
                  )}
                </>
              )}
            </div>
            <h2
              id="dictionary-drawer-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {isLoading ? 'Cargando término...' : term?.title || 'Ficha Técnica'}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar ficha (Esc)"
            title="Cerrar ficha (Esc)"
          >
            <span className="text-lg font-bold select-none">✕</span>
          </button>
        </div>

        {/* Cuerpo del Drawer con Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-slate-900 dark:text-slate-100">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-amber-500 border-t-transparent mb-3"></div>
              <p className="text-sm font-medium">Cargando conocimiento arquitectónico...</p>
            </div>
          ) : isError || !term ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              <span className="text-4xl block mb-2 select-none">⚠️</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No se pudo cargar el término</h3>
              <p className="text-xs mt-1 text-slate-500">
                El término solicitado no está disponible o hubo un problema de conexión.
              </p>
            </div>
          ) : (
            <>
              {/* Sección 1: Resumen y Definición Profunda (What is it?) */}
              <section aria-labelledby="section-what-is" className="space-y-2.5">
                <h3
                  id="section-what-is"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                >
                  <span>📖</span>
                  <span>¿Qué es y cómo funciona?</span>
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 leading-relaxed text-sm text-slate-800 dark:text-slate-200">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base">
                    {term.shortDefinition}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {term.whatIs}
                  </p>
                </div>
              </section>

              {/* Sección 2: ¿Cuándo usarlo? (When to use?) */}
              {term.whenToUse && term.whenToUse.length > 0 && (
                <section aria-labelledby="section-when-to-use" className="space-y-2.5">
                  <h3
                    id="section-when-to-use"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <span>🎯</span>
                    <span>Casos de uso recomendados</span>
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {term.whenToUse.map((scenario, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-slate-700 dark:text-slate-300"
                      >
                        <span className="text-sky-600 dark:text-sky-400 font-bold shrink-0 mt-0.5 select-none">✓</span>
                        <span>{scenario}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Sección 3: Matriz de Trade-Offs (Pros & Cons) */}
              {(term.tradeOffs?.pros || term.tradeOffs?.cons) && (
                <section aria-labelledby="section-trade-offs" className="space-y-3">
                  <h3
                    id="section-trade-offs"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <span>⚖️</span>
                    <span>Compensaciones de Diseño (Trade-offs)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Pros */}
                    {term.tradeOffs.pros && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                          <span>👍</span>
                          <span>Ventajas Clave</span>
                        </div>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                          {term.tradeOffs.pros}
                        </p>
                      </div>
                    )}

                    {/* Cons */}
                    {term.tradeOffs.cons && (
                      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                          <span>⚠️</span>
                          <span>Consideraciones & Límites</span>
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                          {term.tradeOffs.cons}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Sección 4: Grafo de Términos Relacionados */}
              {term.relatedTerms && term.relatedTerms.length > 0 && (
                <section aria-labelledby="section-related-terms" className="space-y-2.5">
                  <h3
                    id="section-related-terms"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <span>🔗</span>
                    <span>Términos y Servicios Relacionados</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {term.relatedTerms.map((related) => (
                      <button
                        key={related.slug}
                        type="button"
                        onClick={() => openDrawer(related.slug)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-300 dark:border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer shadow-xs"
                      >
                        <span className="text-[11px]">
                          {related.category === 'service' ? '☁️' : related.category === 'infrastructure' ? '🛡️' : '💡'}
                        </span>
                        <span>{related.title}</span>
                        <span className="text-slate-400 text-[10px]">→</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Sección 5: Desafíos Prácticos Vinculados */}
              {term.associatedChallenges && term.associatedChallenges.length > 0 && (
                <section aria-labelledby="section-associated-challenges" className="space-y-2.5">
                  <h3
                    id="section-associated-challenges"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <span>🎯</span>
                    <span>Desafíos Prácticos de AWS Quest ({term.associatedChallenges.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {term.associatedChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 gap-3"
                      >
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                            {challenge.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getDifficultyBadgeClass(
                                challenge.difficulty
                              )}`}
                            >
                              {challenge.difficulty}
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                              +{challenge.baseXP} XP
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleChallengeClick(challenge.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Practicar</span>
                          <span>→</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Pie del Drawer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-mono text-slate-700 dark:text-slate-300">
              Esc
            </kbd>
            <span>Cerrar</span>
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
