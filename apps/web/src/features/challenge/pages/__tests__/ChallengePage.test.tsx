import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChallengePage } from '../ChallengePage';
import * as useChallengeHook from '../../hooks/useChallenge';
import * as evaluationApi from '../../../evaluation/api/evaluationApi';
import { ChallengeDetailResponseDto } from '../../types/challenge.types';

vi.mock('../../hooks/useChallenge');
vi.mock('../../../evaluation/api/evaluationApi', () => ({
  evaluateArchitecture: vi.fn(),
  getChallengeAttempts: vi.fn()
}));

vi.mock('../../hooks/useUnlockHint', () => ({
  useUnlockHint: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

vi.mock('../../evaluation/hooks/useEvaluateChallenge', () => ({
  useEvaluateChallenge: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

function renderChallengePage(challengeId = 'c-101') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/challenges/${challengeId}`]}>
        <Routes>
          <Route path="/challenges/:id" element={<ChallengePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ChallengePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el Skeleton en estado de carga (isLoading = true)', () => {
    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderChallengePage();

    expect(screen.getByTestId('challenge-workspace-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar el Estado de Error cuando isError = true', () => {
    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Desafío no encontrado'),
      refetch: vi.fn()
    } as any);

    renderChallengePage();

    expect(screen.getByTestId('challenge-error-state')).toBeInTheDocument();
    expect(screen.getByText(/Desafío no encontrado/i)).toBeInTheDocument();
  });

  it('debe renderizar el Workspace completo cuando el desafío se carga con éxito', () => {
    const mockChallenge: ChallengeDetailResponseDto = {
      id: 'c-101',
      title: 'Arquitectura Web Resiliente en EC2',
      description: 'Construye servidores EC2 balanceados.',
      difficulty: 'intermediate',
      mode: 'builder',
      baseXP: 150,
      allowedServices: [
        {
          code: 'AWS_EC2',
          name: 'Amazon EC2',
          category: 'Compute',
          iconUrl: '/icons/aws/ec2.svg',
          maxInstances: 2,
          isDistractor: false
        }
      ],
      hintsSummary: {
        totalHints: 3,
        unlockedCount: 1,
        unlockedHints: [
          {
            orderIndex: 1,
            text: 'Usa una instancia EC2.',
            penaltyApplied: 5
          }
        ]
      },
      lastAttemptGraph: null
    };

    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: mockChallenge,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderChallengePage();

    expect(screen.getAllByText('Arquitectura Web Resiliente en EC2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Amazon EC2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('tab', { name: /historial/i })).toBeInTheDocument();
  });

  it('debe permitir navegar a la pestaña Historial y mostrar los intentos', async () => {
    const mockChallenge: ChallengeDetailResponseDto = {
      id: 'c-101',
      title: 'Arquitectura Web Resiliente en EC2',
      description: 'Construye servidores EC2 balanceados.',
      difficulty: 'intermediate',
      mode: 'builder',
      baseXP: 150,
      allowedServices: [],
      hintsSummary: { totalHints: 0, unlockedCount: 0, unlockedHints: [] }
    };

    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: mockChallenge,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce([
      {
        id: 'att-1',
        score: 80,
        passed: true,
        hintsUsed: 0,
        createdAt: '2026-09-21T10:00:00.000Z',
        graphSubmitted: { components: [], connections: [] }
      }
    ]);

    renderChallengePage();

    const historyTab = screen.getByRole('tab', { name: /historial/i });
    fireEvent.click(historyTab);

    expect(await screen.findByText('Intento #1')).toBeInTheDocument();
    expect(screen.getAllByText('80/100').length).toBeGreaterThanOrEqual(1);
  });

  it('debe cargar initialGraph en el canvas cuando el modo es fixArchitecture y no hay intentos previos', () => {
    const mockChallenge: ChallengeDetailResponseDto = {
      id: 'c-202',
      title: 'Reparación de Monolito sin Balanceo',
      description: 'Corrige la arquitectura incorporando un ALB.',
      difficulty: 'intermediate',
      mode: 'fixArchitecture',
      baseXP: 150,
      allowedServices: [
        {
          code: 'AWS_EC2',
          name: 'Amazon EC2',
          category: 'Compute',
          iconUrl: '/icons/aws/ec2.svg',
          maxInstances: 4,
          isDistractor: false
        },
        {
          code: 'AWS_RDS',
          name: 'Amazon RDS',
          category: 'Database',
          iconUrl: '/icons/aws/rds.svg',
          maxInstances: 1,
          isDistractor: false
        }
      ],
      hintsSummary: { totalHints: 3, unlockedCount: 0, unlockedHints: [] },
      lastAttemptGraph: null,
      initialGraph: {
        components: [
          {
            id: 'node-legacy-ec2',
            serviceCode: 'AWS_EC2',
            category: 'Compute',
            config: { instanceCount: 1, autoScaling: false }
          },
          {
            id: 'node-legacy-rds',
            serviceCode: 'AWS_RDS',
            category: 'Database',
            config: { isMultiAz: false }
          }
        ],
        connections: [
          {
            fromComponentId: 'node-legacy-ec2',
            toComponentId: 'node-legacy-rds',
            connectionType: 'DATABASE'
          }
        ]
      }
    };

    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: mockChallenge,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderChallengePage('c-202');

    expect(screen.getAllByText('Reparación de Monolito sin Balanceo').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Reparar')).toBeInTheDocument();
  });

  it('debe abrir automáticamente el Caso de Negocio al cargar por primera vez y permitir alternar con Briefing', () => {
    localStorage.clear();

    const mockChallenge: ChallengeDetailResponseDto = {
      id: 'c-303',
      title: 'Caso de Negocio FinTech',
      description: 'Migración bancaria crítica con cero tiempo de inactividad.',
      difficulty: 'hard',
      mode: 'builder',
      baseXP: 300,
      briefing: {
        keyConcept: 'Alta disponibilidad con multi-AZ',
        businessScenario: '10k transacciones bancarias concurrentes.',
        learningObjective: 'Diseñar arquitectura bancaria tolerante a fallos.',
        keyTakeaways: ['Usa subredes privadas para bases de datos.']
      },
      allowedServices: [
        {
          code: 'AWS_EC2',
          name: 'Amazon EC2',
          category: 'Compute',
          iconUrl: '/icons/aws/ec2.svg',
          maxInstances: 2,
          isDistractor: false
        }
      ],
      hintsSummary: { totalHints: 2, unlockedCount: 0, unlockedHints: [] }
    };

    vi.mocked(useChallengeHook.useChallenge).mockReturnValue({
      data: mockChallenge,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as any);

    renderChallengePage('c-303');

    // Se abre automáticamente con Caso de Negocio visible primero
    expect(screen.getByTestId('challenge-context-modal')).toBeInTheDocument();
    expect(screen.getByText('Migración bancaria crítica con cero tiempo de inactividad.')).toBeInTheDocument();

    // Cambiar a pestaña Briefing
    const briefingTab = screen.getByTestId('modal-tab-briefing');
    fireEvent.click(briefingTab);
    expect(screen.getByText('Alta disponibilidad con multi-AZ')).toBeInTheDocument();

    // Cerrar modal
    const closeBtn = screen.getByTestId('close-challenge-context-modal');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('challenge-context-modal')).not.toBeInTheDocument();

    // Reabrir desde el botón del header
    const businessCaseButton = screen.getByRole('button', { name: /abrir caso de negocio/i });
    fireEvent.click(businessCaseButton);
    expect(screen.getByTestId('challenge-context-modal')).toBeInTheDocument();
  });
});


