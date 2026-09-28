import React, { useEffect, useMemo, useRef } from 'react';
import { useDictionaryStore } from '../stores/useDictionaryStore';
import { useDictionaryTerms } from '../hooks/useDictionary';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { DictionaryCategory, DictionaryTermSummary } from '../types/dictionary.types';
import { formatPillarLabel } from '../utils/dictionaryFormatters';

const CATEGORY_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '✨' },
  { id: 'service', label: 'Servicios AWS', icon: '☁️' },
  { id: 'concept', label: 'Conceptos Cloud', icon: '💡' },
  { id: 'infrastructure', label: 'Redes y Seguridad', icon: '🛡️' },
  { id: 'well-architected', label: 'Well-Architected', icon: '📐' },
];

function getCategoryBadgeClass(category: string): string {
  switch (category.toLowerCase()) {
    case 'service':
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60';
    case 'concept':
      return 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700/60';
    case 'infrastructure':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
    case 'well-architected':
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
    default:
      return 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#374151]';
  }
}

function getCategoryLabel(category: string): string {
  switch (category.toLowerCase()) {
    case 'service':
      return 'Servicio AWS';
    case 'concept':
      return 'Concepto';
    case 'infrastructure':
      return 'Infraestructura';
    case 'well-architected':
      return 'Well-Architected';
    default:
      return category;
  }
}

export const DictionaryModal: React.FC = () => {
  const {
    isModalOpen,
    closeSpotlight,
    openSpotlight,
    openDrawer,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrev,
  } = useDictionaryStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Escuchar atajo global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isModalOpen) {
          closeSpotlight();
        } else {
          openSpotlight();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isModalOpen, openSpotlight, closeSpotlight]);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: isModalOpen,
    onClose: closeSpotlight,
    autoFocus: false, // Manejamos autofocus específicamente en el input de búsqueda
  });

  // Query de términos con filtro de categoría y búsqueda
  const { data: terms = [], isLoading } = useDictionaryTerms({
    search: searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 100,
  });

  const filteredTerms = useMemo(() => terms, [terms]);

  // Enfocar input automáticamente cuando se abre el modal
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isModalOpen]);

  // Auto-scroll del elemento seleccionado dentro de la lista
  useEffect(() => {
    if (!listContainerRef.current) return;
    const selectedElement = listContainerRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Navegación por teclado dentro del modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectNext(filteredTerms.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectPrev(filteredTerms.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTerms.length > 0 && selectedIndex >= 0 && selectedIndex < filteredTerms.length) {
        handleSelectTerm(filteredTerms[selectedIndex]);
      }
    }
  };

  const handleSelectTerm = (term: DictionaryTermSummary) => {
    closeSpotlight();
    openDrawer(term.slug);
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeSpotlight();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dictionary-modal-title"
    >
      <div
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-elevation-modal overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in-0 zoom-in-95 duration-150 outline-none"
      >
        {/* Encabezado con Input de Búsqueda */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-[#374151]/60 bg-slate-50 dark:bg-[#171B26] shrink-0">
          <span className="text-lg mr-3 select-none text-[#FF9900]" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            id="dictionary-search-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="dictionary-results-list"
            aria-label="Buscar término en el diccionario"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base focus:outline-none font-medium"
            placeholder="Busca un servicio, concepto o pilar... (ej. EC2, S3, SPOF)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-[#1F2937] transition-colors shrink-0 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={closeSpotlight}
            className="ml-2 px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-[#0B0F19] text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-[#374151] hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1F2937] transition-colors shrink-0 cursor-pointer"
            title="Cerrar modal (Esc)"
          >
            Esc
          </button>
        </div>

        {/* Píldoras de Categoría */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-200 dark:border-[#374151]/60 overflow-x-auto no-scrollbar bg-slate-100/60 dark:bg-[#0E1320]/60 shrink-0">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as DictionaryCategory | 'all')}
                className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF9900] text-[#0B0F19] font-bold shadow-sm'
                    : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#374151] hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de Resultados */}
        <div
          ref={listContainerRef}
          id="dictionary-results-list"
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-[#374151]/40"
        >
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#FF9900] border-t-transparent mb-2"></div>
              <p>Buscando en la base de conocimiento...</p>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <span className="text-3xl block mb-2" aria-hidden="true">
                📚
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">No se encontraron términos</p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                Intenta con otra palabra clave o selecciona la pestaña &ldquo;Todos&rdquo;.
              </p>
            </div>
          ) : (
            filteredTerms.map((term, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={term.slug}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTerm(term)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group relative p-3 rounded cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-[#1F2937] border-l-4 border-[#FF9900] pl-3 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-[#171B26]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-amber-600 dark:group-hover:text-[#FFC082] transition-colors">
                          {term.title}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getCategoryBadgeClass(
                            term.category
                          )}`}
                        >
                          {getCategoryLabel(term.category)}
                        </span>
                        {term.serviceCode && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 dark:bg-[#0B0F19] text-sky-700 dark:text-[#7BD0FF] border border-slate-200 dark:border-[#374151]">
                            {term.serviceCode}
                          </span>
                        )}
                        {term.pillar && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {formatPillarLabel(term.pillar)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {term.shortDefinition}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {term.associatedChallengesCount > 0 && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1"
                          title={`${term.associatedChallengesCount} desafíos prácticos vinculados`}
                        >
                          <span>🎯</span>
                          <span>{term.associatedChallengesCount}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-sky-600 dark:text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Ver ficha →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con Atajos de Ayuda */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0E1320] border-t border-slate-200 dark:border-[#374151]/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded text-slate-700 dark:text-slate-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 font-mono font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded text-slate-700 dark:text-slate-300">
                ↓
              </kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded text-slate-700 dark:text-slate-300">
                ↵
              </kbd>
              <span>Abrir Ficha</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded text-slate-700 dark:text-slate-300">
                Esc
              </kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <div className="hidden sm:block text-slate-400 dark:text-slate-500 font-mono text-[10px]">AWS Quest Knowledge Base</div>
        </div>
      </div>
    </div>
  );
};

