import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DictionaryDrawer } from '../DictionaryDrawer';
import { useDictionaryStore } from '../../stores/useDictionaryStore';
import * as useDictionaryHooks from '../../hooks/useDictionary';
import { DictionaryTermDetail } from '../../types/dictionary.types';

vi.mock('../../hooks/useDictionary', () => ({
  useDictionaryTermDetail: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const mockDetail: DictionaryTermDetail = {
  slug: 'amazon-ec2',
  title: 'Amazon EC2',
  category: 'service',
  serviceCode: 'AWS_EC2',
  pillar: 'CostOptimization',
  shortDefinition: 'Servidores virtuales elásticos en la nube.',
  whatIs: 'Amazon EC2 ofrece cómputo escalable y seguro...',
  whenToUse: [
    'Cargas de trabajo monolíticas tradicionales.',
    'Procesamiento por lotes que escala con ASG.',
  ],
  tradeOffs: {
    pros: 'Control total del sistema operativo y variedad de familias.',
    cons: 'Mayor responsabilidad de mantenimiento comparado con Serverless.',
  },
  relatedTerms: [
    {
      slug: 'amazon-ebs',
      title: 'Amazon EBS',
      category: 'service',
      serviceCode: 'AWS_EBS',
    },
    {
      slug: 'auto-scaling-group',
      title: 'Auto Scaling Group',
      category: 'service',
      serviceCode: 'AWS_ASG',
    },
  ],
  associatedChallenges: [
    {
      id: 'ch-ec2-ha-1',
      title: 'Desafío EC2 Alta Disponibilidad',
      difficulty: 'Intermediate',
      baseXP: 150,
    },
  ],
  displayOrder: 1,
};

describe('DictionaryDrawer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDictionaryStore.setState({
      isDrawerOpen: false,
      activeSlug: null,
    });

    vi.mocked(useDictionaryHooks.useDictionaryTermDetail).mockReturnValue({
      data: mockDetail,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
    } as any);
  });

  it('no debe renderizar nada cuando isDrawerOpen es false', () => {
    render(<DictionaryDrawer />, { wrapper: createWrapper() });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debe renderizar la ficha técnica completa cuando isDrawerOpen es true', () => {
    useDictionaryStore.setState({ isDrawerOpen: true, activeSlug: 'amazon-ec2' });
    render(<DictionaryDrawer />, { wrapper: createWrapper() });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('AWS_EC2')).toBeInTheDocument();
    expect(screen.getByText(/Optimización de Costos/i)).toBeInTheDocument();
    expect(screen.getByText('Servidores virtuales elásticos en la nube.')).toBeInTheDocument();
    expect(screen.getByText('Cargas de trabajo monolíticas tradicionales.')).toBeInTheDocument();
    expect(screen.getByText('Control total del sistema operativo y variedad de familias.')).toBeInTheDocument();
    expect(screen.getByText('Mayor responsabilidad de mantenimiento comparado con Serverless.')).toBeInTheDocument();
  });

  it('debe permitir navegar a un término relacionado al hacer clic en su chip', () => {
    useDictionaryStore.setState({ isDrawerOpen: true, activeSlug: 'amazon-ec2' });
    render(<DictionaryDrawer />, { wrapper: createWrapper() });

    const relatedBtn = screen.getByRole('button', { name: /Amazon EBS/i });
    fireEvent.click(relatedBtn);

    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-ebs');
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
  });

  it('debe permitir navegar a un desafío asociado y cerrar el drawer', () => {
    useDictionaryStore.setState({ isDrawerOpen: true, activeSlug: 'amazon-ec2' });
    render(<DictionaryDrawer />, { wrapper: createWrapper() });

    const practiceBtn = screen.getByRole('button', { name: /Practicar/i });
    fireEvent.click(practiceBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/challenge/ch-ec2-ha-1');
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(false);
  });

  it('debe cerrar el drawer al hacer clic en el botón X o presionar Esc', () => {
    useDictionaryStore.setState({ isDrawerOpen: true, activeSlug: 'amazon-ec2' });
    render(<DictionaryDrawer />, { wrapper: createWrapper() });

    const closeBtn = screen.getByLabelText(/Cerrar ficha/i);
    fireEvent.click(closeBtn);

    expect(useDictionaryStore.getState().isDrawerOpen).toBe(false);
  });
});
