import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { ProblemContextPanel } from '../ProblemContextPanel';
import { ArchitectureRequirement } from '../../types/challenge.types';
import { ServicePaletteItem } from '../../../canvas/types/canvas.types';
import * as evaluationApi from '../../../evaluation/api/evaluationApi';

vi.mock('../../../evaluation/api/evaluationApi', () => ({
  evaluateArchitecture: vi.fn(),
  getChallengeAttempts: vi.fn()
}));

const mockServices: ServicePaletteItem[] = [
  {
    code: 'AWS_EC2',
    name: 'Amazon EC2',
    category: 'Compute',
    iconUrl: '/icons/aws/ec2.svg'
  }
];

const mockRequirements: ArchitectureRequirement[] = [
  {
    id: 'req-1',
    type: 'required_service',
    title: 'Alta Disponibilidad en Cómputo',
    description: 'Debe contener al menos 2 instancias EC2 distribuidas.'
  }
];

describe('ProblemContextPanel Component', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });

    return ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('debe alternar entre el tab de Requisitos, Servicios e Historial', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce([]);

    render(
      <ProblemContextPanel
        challengeId="challenge-123"
        description="Caso de prueba empresarial en AWS"
        requirements={mockRequirements}
        allowedServices={mockServices}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    // Por defecto inicia en tab Servicios
    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();

    // Cambiar a tab Requisitos
    const reqTab = screen.getByRole('tab', { name: /requisitos/i });
    fireEvent.click(reqTab);

    expect(screen.getByText('Caso de Negocio')).toBeInTheDocument();
    expect(screen.getByText('Caso de prueba empresarial en AWS')).toBeInTheDocument();
    expect(screen.getByText('Alta Disponibilidad en Cómputo')).toBeInTheDocument();

    // Cambiar a tab Historial
    const histTab = screen.getByRole('tab', { name: /historial/i });
    fireEvent.click(histTab);

    expect(await screen.findByText('Sin envíos previos')).toBeInTheDocument();
  });

  it('debe llamar a onToggleCollapse al pulsar el botón de colapsar', () => {
    const onToggleMock = vi.fn();

    render(
      <ProblemContextPanel
        description="Caso de prueba"
        requirements={mockRequirements}
        allowedServices={mockServices}
        isCollapsed={false}
        onToggleCollapse={onToggleMock}
      />,
      { wrapper: createWrapper() }
    );

    const collapseButton = screen.getByRole('button', {
      name: /colapsar panel lateral/i
    });
    fireEvent.click(collapseButton);

    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el banner de advertencia en el tab Requisitos cuando mode es fixArchitecture', () => {
    render(
      <ProblemContextPanel
        description="Repara el monolito"
        mode="fixArchitecture"
        requirements={mockRequirements}
        allowedServices={mockServices}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    const reqTab = screen.getByRole('tab', { name: /requisitos/i });
    fireEvent.click(reqTab);

    expect(screen.getByText('Arquitectura con problemas detectados')).toBeInTheDocument();
    expect(
      screen.getByText(/Analiza la arquitectura precargada en el lienzo y corrige los problemas/i)
    ).toBeInTheDocument();
  });

  it('debe llamar a onOpenBusinessCase al hacer clic en el botón Ver modal en la pestaña Requisitos', () => {
    const onOpenBusinessCaseMock = vi.fn();

    render(
      <ProblemContextPanel
        description="Caso de prueba empresarial"
        requirements={mockRequirements}
        allowedServices={mockServices}
        isCollapsed={false}
        onToggleCollapse={vi.fn()}
        onOpenBusinessCase={onOpenBusinessCaseMock}
      />,
      { wrapper: createWrapper() }
    );

    const reqTab = screen.getByRole('tab', { name: /requisitos/i });
    fireEvent.click(reqTab);

    const openModalBtn = screen.getByRole('button', { name: /ver modal/i });
    expect(openModalBtn).toBeInTheDocument();

    fireEvent.click(openModalBtn);
    expect(onOpenBusinessCaseMock).toHaveBeenCalledTimes(1);
  });
});

