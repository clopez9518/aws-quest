import { describe, it, expect, beforeEach } from 'vitest';
import { useDictionaryStore } from '../useDictionaryStore';

describe('useDictionaryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDictionaryStore.setState({
      isModalOpen: false,
      isDrawerOpen: false,
      activeSlug: null,
      searchQuery: '',
      selectedCategory: 'all',
      selectedPillar: null,
      selectedLetter: null,
      selectedIndex: 0,
    });
  });

  it('debe inicializarse con los valores por defecto', () => {
    const state = useDictionaryStore.getState();
    expect(state.isModalOpen).toBe(false);
    expect(state.isDrawerOpen).toBe(false);
    expect(state.activeSlug).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.selectedCategory).toBe('all');
    expect(state.selectedPillar).toBeNull();
    expect(state.selectedLetter).toBeNull();
    expect(state.selectedIndex).toBe(0);
  });

  it('openSpotlight abre el modal y resetea la búsqueda o asigna búsqueda inicial', () => {
    useDictionaryStore.getState().openSpotlight('ec2');
    expect(useDictionaryStore.getState().isModalOpen).toBe(true);
    expect(useDictionaryStore.getState().searchQuery).toBe('ec2');
    expect(useDictionaryStore.getState().selectedIndex).toBe(0);
  });

  it('closeSpotlight cierra el modal y limpia la búsqueda', () => {
    useDictionaryStore.getState().openSpotlight('s3');
    useDictionaryStore.getState().closeSpotlight();
    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
    expect(useDictionaryStore.getState().searchQuery).toBe('');
  });

  it('toggleSpotlight alterna el estado del modal', () => {
    useDictionaryStore.getState().toggleSpotlight();
    expect(useDictionaryStore.getState().isModalOpen).toBe(true);

    useDictionaryStore.getState().toggleSpotlight();
    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
  });

  it('openDrawer abre el drawer y establece el activeSlug', () => {
    useDictionaryStore.getState().openDrawer('amazon-dynamodb');
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-dynamodb');
  });

  it('closeDrawer cierra el drawer y limpia el activeSlug', () => {
    useDictionaryStore.getState().openDrawer('amazon-dynamodb');
    useDictionaryStore.getState().closeDrawer();
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(false);
    expect(useDictionaryStore.getState().activeSlug).toBeNull();
  });

  it('setSearchQuery actualiza la búsqueda y reinicia selectedIndex', () => {
    useDictionaryStore.setState({ selectedIndex: 5 });
    useDictionaryStore.getState().setSearchQuery('lambda');
    expect(useDictionaryStore.getState().searchQuery).toBe('lambda');
    expect(useDictionaryStore.getState().selectedIndex).toBe(0);
  });

  it('setSelectedLetter actualiza la letra seleccionada y reinicia selectedIndex', () => {
    useDictionaryStore.setState({ selectedIndex: 5 });
    useDictionaryStore.getState().setSelectedLetter('E');
    expect(useDictionaryStore.getState().selectedLetter).toBe('E');
    expect(useDictionaryStore.getState().selectedIndex).toBe(0);
  });

  it('selectNext y selectPrev navegan cíclicamente a través de los elementos', () => {
    const totalItems = 3;
    expect(useDictionaryStore.getState().selectedIndex).toBe(0);

    useDictionaryStore.getState().selectNext(totalItems);
    expect(useDictionaryStore.getState().selectedIndex).toBe(1);

    useDictionaryStore.getState().selectNext(totalItems);
    expect(useDictionaryStore.getState().selectedIndex).toBe(2);

    useDictionaryStore.getState().selectNext(totalItems);
    expect(useDictionaryStore.getState().selectedIndex).toBe(0); // Vuelve al inicio

    useDictionaryStore.getState().selectPrev(totalItems);
    expect(useDictionaryStore.getState().selectedIndex).toBe(2); // Va al último
  });

  it('resetFilters restaura los valores iniciales de búsqueda y categorías', () => {
    useDictionaryStore.setState({
      searchQuery: 'rds',
      selectedCategory: 'service',
      selectedPillar: 'Reliability',
      selectedLetter: 'R',
      selectedIndex: 3,
    });

    useDictionaryStore.getState().resetFilters();
    const state = useDictionaryStore.getState();
    expect(state.searchQuery).toBe('');
    expect(state.selectedCategory).toBe('all');
    expect(state.selectedPillar).toBeNull();
    expect(state.selectedLetter).toBeNull();
    expect(state.selectedIndex).toBe(0);
  });
});
