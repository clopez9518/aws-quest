import React, { useMemo } from 'react';
import { useDictionaryTerms, useDictionaryCategories } from '../hooks/useDictionary';
import { useDictionaryStore } from '../stores/useDictionaryStore';
import { DictionaryAlphabetBar } from '../components/DictionaryAlphabetBar';
import { DictionaryTermCard } from '../components/DictionaryTermCard';
import { DictionaryPillarsFilter } from '../components/DictionaryPillarsFilter';
import { isPillarMatching } from '../utils/dictionaryFormatters';
import { Search, X, BookOpen, AlertCircle, RefreshCw, Filter } from 'lucide-react';

export const DictionaryPage: React.FC = () => {
  const {
    searchQuery,
    selectedCategory,
    selectedPillar,
    selectedLetter,
    setSearchQuery,
    setSelectedCategory,
    setSelectedPillar,
    setSelectedLetter,
    resetFilters,
    openDrawer,
  } = useDictionaryStore();

  const { data: allTerms, isLoading, isError, refetch } = useDictionaryTerms({ limit: 200 });
  const { data: categories } = useDictionaryCategories();

  // Filtrado compuesto multidimensional
  const filteredTerms = useMemo(() => {
    if (!allTerms) return [];

    return allTerms.filter((term) => {
      // 1. Filtro por búsqueda textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (term.title || '').toLowerCase().includes(query);
        const matchesSummary = (term.shortDefinition || (term as any).summary || '').toLowerCase().includes(query);
        const matchesCode = term.serviceCode?.toLowerCase().includes(query) ?? false;
        const matchesCategory = (term.category || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesCode && !matchesCategory) {
          return false;
        }
      }

      // 2. Filtro por categoría
      if (selectedCategory !== 'all') {
        if (term.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Filtro por pilar Well-Architected
      if (selectedPillar) {
        if (!isPillarMatching(term.pillar, selectedPillar)) {
          return false;
        }
      }

      // 4. Filtro por letra inicial
      if (selectedLetter) {
        const firstLetter = term.title.trim()[0]?.toUpperCase();
        if (firstLetter !== selectedLetter) {
          return false;
        }
      }

      return true;
    });
  }, [allTerms, searchQuery, selectedCategory, selectedPillar, selectedLetter]);

  // Letras disponibles calculadas dinámicamente según el catálogo
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    if (!allTerms) return set;
    allTerms.forEach((term) => {
      const first = term.title.trim()[0]?.toUpperCase();
      if (first && /[A-Z]/.test(first)) {
        set.add(first);
      }
    });
    return set;
  }, [allTerms]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedPillar !== null ||
    selectedLetter !== null;

  return (
    <div className="w-full flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 relative">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Base de Conocimiento Arquitectónico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Diccionario AWS Quest
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Explora servicios cloud, patrones de arquitectura y pilares del Well-Architected Framework vinculados con los desafíos del juego.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center space-x-2 self-start md:self-end text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{filteredTerms.length}</span>
          <span>de</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{allTerms?.length ?? 0}</span>
          <span>términos disponibles</span>
        </div>
      </header>

      {/* Control Panel: Search, Categories & Pillars */}
      <section aria-label="Controles de búsqueda y filtros" className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por servicio (EC2, S3), concepto (Alta Disponibilidad) o palabra clave..."
            className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all text-slate-900 dark:text-slate-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Tabs & WAF Pillars */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar por categoría">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-xs shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Todos ({allTerms?.length ?? 0})
            </button>

            {categories?.map((cat) => {
              const count = allTerms?.filter((t) => t.category.toLowerCase() === cat.category.toLowerCase()).length ?? 0;
              const isSelected = selectedCategory.toLowerCase() === cat.category.toLowerCase();
              const categoryLabel = cat.label || (cat as any).displayName || cat.category;

              return (
                <button
                  key={cat.category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-xs shadow-amber-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {categoryLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* Reset Filters Shortcut Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 self-start lg:self-center cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Limpiar todos los filtros</span>
            </button>
          )}
        </div>

        {/* WAF Pillars Filter */}
        <DictionaryPillarsFilter
          selectedPillar={selectedPillar}
          onSelectPillar={setSelectedPillar}
        />

        {/* Alphabet Navigation Bar */}
        <DictionaryAlphabetBar
          selectedLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
          availableLetters={availableLetters}
        />
      </section>

      {/* Main Content Area: Grid / States */}
      <main className="flex-1 flex flex-col">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="dictionary-loading-skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-850/60 animate-pulse border border-slate-300 dark:border-slate-800"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl my-6 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-rose-700 dark:text-rose-300">
              Error al cargar el glosario
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No pudimos conectar con el servidor para obtener los términos. Por favor, intenta nuevamente.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredTerms.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl my-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No se encontraron términos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No hay resultados que coincidan con los filtros y criterios de búsqueda actuales.
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!isLoading && !isError && filteredTerms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="dictionary-terms-grid">
            {filteredTerms.map((term) => (
              <DictionaryTermCard
                key={term.slug}
                term={term}
                onOpenDetail={(slug) => openDrawer(slug)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
