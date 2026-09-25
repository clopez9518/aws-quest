import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { AttemptHistoryList } from '../AttemptHistoryList';
import * as evaluationApi from '../../api/evaluationApi';
import { ChallengeAttemptHistoryDto } from '../../types/evaluation.types';
import { ApiHttpError } from '../../../../shared/api/ApiHttpError';

vi.mock('../../api/evaluationApi', () => ({
  evaluateArchitecture: vi.fn(),
  getChallengeAttempts: vi.fn()
}));

describe('AttemptHistoryList Component', () => {
  let queryClient: QueryClient;
  const challengeId = '1985dcf5-840d-41cb-9348-a5254caaeb04';

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    return ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  const mockAttempts: ChallengeAttemptHistoryDto[] = [
    {
      id: 'att-2',
      score: 95,
      passed: true,
      hintsUsed: 1,
      createdAt: '2026-09-20T23:05:00.000Z',
      graphSubmitted: {
        components: [
          { id: 'node-1', serviceCode: 'AWS_ALB', config: {} },
          { id: 'node-2', serviceCode: 'AWS_EC2', config: {} }
        ],
        connections: [
          { fromComponentId: 'node-1', toComponentId: 'node-2', connectionType: 'HTTP_HTTPS' }
        ]
      }
    },
    {
      id: 'att-1',
      score: 45,
      passed: false,
      hintsUsed: 0,
      createdAt: '2026-09-20T22:30:00.000Z',
      graphSubmitted: {
        components: [{ id: 'node-1', serviceCode: 'AWS_ALB', config: {} }],
        connections: []
      }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el Skeleton de carga inicialmente', () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockReturnValue(new Promise(() => {}));

    render(<AttemptHistoryList challengeId={challengeId} onRestoreAttempt={vi.fn()} />, {
      wrapper: createWrapper()
    });

    expect(screen.getByLabelText(/Cargando historial de intentos/i)).toBeInTheDocument();
  });

  it('debe renderizar el estado de error y botón de reintento', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockRejectedValueOnce(
      new ApiHttpError('Error al conectar con la base de datos', 500, 'DB_ERROR')
    );

    render(<AttemptHistoryList challengeId={challengeId} onRestoreAttempt={vi.fn()} />, {
      wrapper: createWrapper()
    });

    expect(await screen.findByText('No se pudo cargar el historial')).toBeInTheDocument();
    expect(screen.getByText('Error al conectar con la base de datos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('debe renderizar el EmptyState cuando la lista de intentos es vacía', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce([]);

    render(<AttemptHistoryList challengeId={challengeId} onRestoreAttempt={vi.fn()} />, {
      wrapper: createWrapper()
    });

    expect(await screen.findByText('Sin envíos previos')).toBeInTheDocument();
    expect(screen.getByText(/Aún no has enviado ninguna solución/i)).toBeInTheDocument();
  });

  it('debe renderizar el listado ordenado de intentos con cabecera de récord y disparar onRestoreAttempt', async () => {
    vi.mocked(evaluationApi.getChallengeAttempts).mockResolvedValueOnce(mockAttempts);
    const onRestoreMock = vi.fn();

    render(<AttemptHistoryList challengeId={challengeId} onRestoreAttempt={onRestoreMock} />, {
      wrapper: createWrapper()
    });

    expect(await screen.findByText('2 envíos registrados')).toBeInTheDocument();
    expect(screen.getAllByText('95/100').length).toBeGreaterThanOrEqual(1);

    // Comprobar tarjetas
    expect(screen.getByText('Intento #2')).toBeInTheDocument();
    expect(screen.getByText('Intento #1')).toBeInTheDocument();

    // Clic en restaurar intento #2
    const restoreButtons = screen.getAllByRole('button', { name: /Cargar intento número/i });
    fireEvent.click(restoreButtons[0]);

    expect(onRestoreMock).toHaveBeenCalledWith(mockAttempts[0], 2);
  });
});
