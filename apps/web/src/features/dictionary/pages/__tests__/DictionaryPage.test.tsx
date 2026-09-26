import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DictionaryPage } from '../DictionaryPage';
import { useDictionaryStore } from '../../stores/useDictionaryStore';
import * as dictionaryHooks from '../../hooks/useDictionary';
import { DictionaryTermSummary, DictionaryCategoryCount } from '../../types/dictionary.types';

vi.mock('../../hooks/useDictionary', () => ({
  useDictionaryTerms: vi.fn(),
  useDictionaryCategories: vi.fn(),
}));

describe('DictionaryPage Component', () => {
  const mockTerms: DictionaryTermSummary[] = [
    {
      slug: 'amazon-ec2',
      title: 'Amazon EC2',
      serviceCode: 'AWS_EC2',
      category: 'service',
      shortDefinition: 'Servidor virtual elástico en la nube.',
      pillar: 'Reliability',
      associatedChallengesCount: 1,
      relatedTermsCount: 2,
      displayOrder: 1,
    },
    {
      slug: 'amazon-s3',
      title: 'Amazon S3',
      serviceCode: 'AWS_S3',
      category: 'storage',
      shortDefinition: 'Almacenamiento de objetos altamente escalable.',
      pillar: 'Security',
      associatedChallengesCount: 1,
      relatedTermsCount: 1,
      displayOrder: 2,
    },
    {
      slug: 'alta-disponibilidad',
      title: 'Alta Disponibilidad',
      serviceCode: null,
      category: 'concept',
      shortDefinition: 'Capacidad de un sistema de mantenerse operativo.',
      pillar: 'Reliability',
      associatedChallengesCount: 1,
      relatedTermsCount: 1,
      displayOrder: 3,
    },
  ];

  const mockCategories: DictionaryCategoryCount[] = [
    { category: 'service', label: 'Servicios AWS', count: 1 },
    { category: 'storage', label: 'Almacenamiento', count: 1 },
    { category: 'concept', label: 'Conceptos Cloud', count: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
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

    vi.mocked(dictionaryHooks.useDictionaryTerms).mockReturnValue({
      data: mockTerms,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(dictionaryHooks.useDictionaryCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
    } as any);
  });

  it('debe renderizar la cabecera, contador y grid de términos iniciales', () => {
    render(<DictionaryPage />);

    expect(screen.getByRole('heading', { level: 1, name: /Diccionario AWS Quest/i })).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getByText(/términos disponibles/i)).toBeInTheDocument();

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText('Alta Disponibilidad')).toBeInTheDocument();
  });

  it('debe filtrar los términos al escribir en el buscador', () => {
    render(<DictionaryPage />);

    const searchInput = screen.getByPlaceholderText(/Buscar por servicio/i);
    fireEvent.change(searchInput, { target: { value: 'S3' } });

    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
    expect(screen.queryByText('Alta Disponibilidad')).not.toBeInTheDocument();
  });

  it('debe filtrar los términos al seleccionar una categoría', () => {
    render(<DictionaryPage />);

    const conceptTab = screen.getByRole('tab', { name: /Conceptos Cloud/i });
    fireEvent.click(conceptTab);

    expect(screen.getByText('Alta Disponibilidad')).toBeInTheDocument();
    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
    expect(screen.queryByText('Amazon S3')).not.toBeInTheDocument();
  });

  it('debe filtrar los términos al seleccionar una letra en la barra alfabética', () => {
    render(<DictionaryPage />);

    const letterAButton = screen.getByRole('button', { name: /Filtrar por letra A/i });
    fireEvent.click(letterAButton);

    // Amazon EC2, Amazon S3, Alta Disponibilidad todos inician con 'A'
    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText('Alta Disponibilidad')).toBeInTheDocument();
  });

  it('debe filtrar los términos al seleccionar un pilar Well-Architected', () => {
    render(<DictionaryPage />);

    const securityPillar = screen.getByRole('button', { name: /Seguridad/i });
    fireEvent.click(securityPillar);

    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
    expect(screen.queryByText('Alta Disponibilidad')).not.toBeInTheDocument();
  });

  it('debe abrir el DictionaryDrawer al hacer clic en una tarjeta', () => {
    render(<DictionaryPage />);

    const ec2Card = screen.getByRole('article', { name: /Término: Amazon EC2/i });
    fireEvent.click(ec2Card);

    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-ec2');
  });

  it('debe mostrar el estado vacío y botón para limpiar filtros si no hay coincidencias', () => {
    render(<DictionaryPage />);

    const searchInput = screen.getByPlaceholderText(/Buscar por servicio/i);
    fireEvent.change(searchInput, { target: { value: 'termino-inexistente-xyz' } });

    expect(screen.getByText(/No se encontraron términos/i)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(clearButton);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
  });

  it('debe renderizar el skeleton de carga cuando isLoading es true', () => {
    vi.mocked(dictionaryHooks.useDictionaryTerms).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<DictionaryPage />);

    expect(screen.getByTestId('dictionary-loading-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar el mensaje de error cuando isError es true', () => {
    vi.mocked(dictionaryHooks.useDictionaryTerms).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    render(<DictionaryPage />);

    expect(screen.getByText(/Error al cargar el glosario/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });
});
