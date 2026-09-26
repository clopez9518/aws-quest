import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DictionaryModal } from '../DictionaryModal';
import { useDictionaryStore } from '../../stores/useDictionaryStore';
import * as useDictionaryHooks from '../../hooks/useDictionary';
import { DictionaryTermSummary } from '../../types/dictionary.types';

vi.mock('../../hooks/useDictionary', () => ({
  useDictionaryTerms: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockTerms: DictionaryTermSummary[] = [
  {
    slug: 'amazon-ec2',
    title: 'Amazon EC2',
    category: 'service',
    serviceCode: 'AWS_EC2',
    pillar: 'CostOptimization',
    shortDefinition: 'Servidores virtuales elásticos en la nube.',
    associatedChallengesCount: 2,
    relatedTermsCount: 4,
    displayOrder: 1,
  },
  {
    slug: 'escalabilidad-horizontal',
    title: 'Escalabilidad Horizontal',
    category: 'concept',
    serviceCode: null,
    pillar: 'PerformanceEfficiency',
    shortDefinition: 'Añadir más nodos en paralelo.',
    associatedChallengesCount: 1,
    relatedTermsCount: 2,
    displayOrder: 10,
  },
];

describe('DictionaryModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDictionaryStore.setState({
      isModalOpen: false,
      isDrawerOpen: false,
      activeSlug: null,
      searchQuery: '',
      selectedCategory: 'all',
      selectedPillar: null,
      selectedIndex: 0,
    });

    vi.mocked(useDictionaryHooks.useDictionaryTerms).mockReturnValue({
      data: mockTerms,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any);
  });

  it('no debe renderizar nada cuando isModalOpen es false', () => {
    render(<DictionaryModal />, { wrapper: createWrapper() });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizarse cuando isModalOpen es true con input de búsqueda y resultados', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Busca un servicio, concepto o pilar/i)).toBeInTheDocument();
    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Escalabilidad Horizontal')).toBeInTheDocument();
  });

  it('debe actualizar el searchQuery al escribir en el input', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText(/Busca un servicio, concepto o pilar/i);
    fireEvent.change(input, { target: { value: 'ec2' } });

    expect(useDictionaryStore.getState().searchQuery).toBe('ec2');
  });

  it('debe filtrar por categoría al hacer clic en las píldoras', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    const conceptButton = screen.getByRole('button', { name: /Conceptos Cloud/i });
    fireEvent.click(conceptButton);

    expect(useDictionaryStore.getState().selectedCategory).toBe('concept');
  });

  it('debe permitir navegar con las flechas de teclado y seleccionar con Enter', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    const modal = screen.getByRole('dialog').firstElementChild as HTMLElement;

    // Flecha abajo para cambiar selección
    fireEvent.keyDown(modal, { key: 'ArrowDown' });
    expect(useDictionaryStore.getState().selectedIndex).toBe(1);

    // Enter para abrir el término seleccionado
    fireEvent.keyDown(modal, { key: 'Enter' });

    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('escalabilidad-horizontal');
  });

  it('debe abrir el drawer y cerrar el spotlight al hacer clic en un término', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    const termItem = screen.getByText('Amazon EC2');
    fireEvent.click(termItem);

    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-ec2');
  });

  it('debe cerrar el modal al hacer clic en el botón de cerrar Esc o en el backdrop', () => {
    useDictionaryStore.setState({ isModalOpen: true });
    render(<DictionaryModal />, { wrapper: createWrapper() });

    const closeBtn = screen.getByTitle(/Cerrar modal/i);
    fireEvent.click(closeBtn);

    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
  });

  it('debe responder al atajo global de teclado Ctrl+K para alternar el modal', () => {
    render(<DictionaryModal />, { wrapper: createWrapper() });

    // Abrir con Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(useDictionaryStore.getState().isModalOpen).toBe(true);

    // Cerrar con Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(useDictionaryStore.getState().isModalOpen).toBe(false);
  });
});
