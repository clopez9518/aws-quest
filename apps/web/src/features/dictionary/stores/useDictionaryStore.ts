import { create } from 'zustand';
import { WellArchitectedPillar } from '../types/dictionary.types';

interface DictionaryState {
  // Visibilidad de Vistas
  isModalOpen: boolean;
  isDrawerOpen: boolean;

  // Selección y Búsqueda
  activeSlug: string | null;
  searchQuery: string;
  selectedCategory: string | 'all';
  selectedPillar: WellArchitectedPillar | null;
  selectedLetter: string | null;
  selectedIndex: number;

  // Acciones
  openSpotlight: (initialSearch?: string) => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;
  
  openDrawer: (slug: string) => void;
  closeDrawer: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | 'all') => void;
  setSelectedPillar: (pillar: WellArchitectedPillar | null) => void;
  setSelectedLetter: (letter: string | null) => void;
  setSelectedIndex: (index: number) => void;
  selectNext: (totalItems: number) => void;
  selectPrev: (totalItems: number) => void;
  resetFilters: () => void;
}

export const useDictionaryStore = create<DictionaryState>((set) => ({
  isModalOpen: false,
  isDrawerOpen: false,
  activeSlug: null,
  searchQuery: '',
  selectedCategory: 'all',
  selectedPillar: null,
  selectedLetter: null,
  selectedIndex: 0,

  openSpotlight: (initialSearch = '') =>
    set({
      isModalOpen: true,
      searchQuery: initialSearch,
      selectedIndex: 0,
    }),

  closeSpotlight: () =>
    set({
      isModalOpen: false,
      searchQuery: '',
      selectedIndex: 0,
    }),

  toggleSpotlight: () =>
    set((state) => ({
      isModalOpen: !state.isModalOpen,
      searchQuery: state.isModalOpen ? '' : state.searchQuery,
      selectedIndex: 0,
    })),

  openDrawer: (slug: string) =>
    set({
      isDrawerOpen: true,
      activeSlug: slug,
    }),

  closeDrawer: () =>
    set({
      isDrawerOpen: false,
      activeSlug: null,
    }),

  setSearchQuery: (searchQuery) =>
    set({
      searchQuery,
      selectedIndex: 0, // Reiniciar cursor de selección al escribir
    }),

  setSelectedCategory: (selectedCategory) =>
    set({
      selectedCategory,
      selectedIndex: 0,
    }),

  setSelectedPillar: (selectedPillar) =>
    set({
      selectedPillar,
      selectedIndex: 0,
    }),

  setSelectedLetter: (selectedLetter) =>
    set({
      selectedLetter,
      selectedIndex: 0,
    }),

  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),

  selectNext: (totalItems) =>
    set((state) => ({
      selectedIndex: totalItems > 0 ? (state.selectedIndex + 1) % totalItems : 0,
    })),

  selectPrev: (totalItems) =>
    set((state) => ({
      selectedIndex: totalItems > 0 ? (state.selectedIndex - 1 + totalItems) % totalItems : 0,
    })),

  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      selectedPillar: null,
      selectedLetter: null,
      selectedIndex: 0,
    }),
}));
