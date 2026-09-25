import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { useEvaluateChallenge, applyFeedbackToCanvas } from '../useEvaluateChallenge';
import * as evaluationApi from '../../api/evaluationApi';
import { useAuthStore } from '../../../../shared/stores/useAuthStore';
import { useCanvasStore } from '../../../canvas/stores/useCanvasStore';
import {
  EvaluateArchitectureRequestDto,
  EvaluateArchitectureResponseDto,
  FeedbackItemDto
} from '../../types/evaluation.types';
import { ApiHttpError } from '../../../../shared/api/ApiHttpError';

vi.mock('../../api/evaluationApi', () => ({
  evaluateArchitecture: vi.fn(),
  getChallengeAttempts: vi.fn()
}));

describe('useEvaluateChallenge', () => {
  let queryClient: QueryClient;
  const challengeId = '7f991f85-3b9e-4c17-a065-27a96e1ef6b2';

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

  const mockPayload: EvaluateArchitectureRequestDto = {
    graph: {
      components: [
        { id: 'node_1', serviceCode: 'AWS_ALB', config: {} },
        { id: 'node_2', serviceCode: 'AWS_EC2', config: {} }
      ],
      connections: [
        { fromComponentId: 'node_1', toComponentId: 'node_2', connectionType: 'HTTP_HTTPS' }
      ]
    },
    hintsUsed: 1
  };

  const mockEvaluationResponse: EvaluateArchitectureResponseDto = {
    score: 95,
    passed: true,
    isNewHighScore: true,
    earnedXP: 95,
    currentUserXP: 250,
    currentUserLevel: 2,
    feedback: {
      summary: 'Arquitectura aprobada',
      items: [
        {
          status: 'pass',
          category: 'serviceSelection',
          title: 'Servicio Correcto',
          explanation: 'ALB es el balanceador adecuado',
          penaltyApplied: 0,
          relatedComponentIds: ['node_1']
        },
        {
          status: 'fail',
          category: 'availability',
          title: 'Falta Multi-AZ',
          explanation: 'EC2 no tiene redundancia',
          penaltyApplied: 5,
          relatedComponentIds: ['node_2']
        }
      ]
    },
    attemptId: 'att-123-uuid'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      accessToken: 'test-token',
      user: {
        id: 'user-1',
        name: 'Aprendiz',
        email: 'user@awsquest.dev',
        isGuest: false,
        totalXP: 155,
        level: 2
      },
      isInitialized: true,
      isLoading: false
    });

    useCanvasStore.setState({
      nodes: [
        {
          id: 'node_1',
          type: 'awsServiceNode',
          position: { x: 0, y: 0 },
          data: {
            serviceCode: 'AWS_ALB',
            name: 'ALB',
            category: 'Networking',
            iconUrl: '',
            config: {},
            visualStatus: 'default',
            statusMessage: null
          }
        },
        {
          id: 'node_2',
          type: 'awsServiceNode',
          position: { x: 0, y: 100 },
          data: {
            serviceCode: 'AWS_EC2',
            name: 'EC2',
            category: 'Compute',
            iconUrl: '',
            config: {},
            visualStatus: 'default',
            statusMessage: null
          }
        }
      ],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false,
      initialSemanticGraph: null,
      allowedServices: []
    });
  });

  it('debe ejecutar la mutación y sincronizar gamificación, canvas e invalidar queries en onSuccess', async () => {
    vi.mocked(evaluationApi.evaluateArchitecture).mockResolvedValueOnce(mockEvaluationResponse);
    const invalidateSpy = vi.spyOn(QueryClient.prototype, 'invalidateQueries');
    const onSuccessMock = vi.fn();

    const { result } = renderHook(
      () =>
        useEvaluateChallenge(challengeId, {
          onSuccess: onSuccessMock,
          autoApplyVisualFeedback: true
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(evaluationApi.evaluateArchitecture).toHaveBeenCalledWith(challengeId, mockPayload);
    expect(onSuccessMock).toHaveBeenCalledWith(mockEvaluationResponse);

    // 1. Verificar sincronización en useAuthStore
    const updatedUser = useAuthStore.getState().user;
    expect(updatedUser?.totalXP).toBe(250);
    expect(updatedUser?.level).toBe(2);

    // 2. Verificar invalidación de queries
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['catalog', 'units'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['challenge', 'detail', challengeId] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['evaluation', 'attempts', challengeId] });

    // 3. Verificar aplicación de feedback visual al canvas
    const canvasNodes = useCanvasStore.getState().nodes;
    const node1 = canvasNodes.find((n) => n.id === 'node_1');
    const node2 = canvasNodes.find((n) => n.id === 'node_2');

    expect(node1?.data.visualStatus).toBe('pass');
    expect(node2?.data.visualStatus).toBe('error');
    expect(node2?.data.statusMessage).toBe('EC2 no tiene redundancia');
  });

  it('debe ejecutar callback onError si la mutación falla', async () => {
    const mockError = new ApiHttpError('Error al evaluar', 400, 'INVALID_GRAPH_PAYLOAD');
    vi.mocked(evaluationApi.evaluateArchitecture).mockRejectedValueOnce(mockError);
    const onErrorMock = vi.fn();

    const { result } = renderHook(
      () =>
        useEvaluateChallenge(challengeId, {
          onError: onErrorMock
        }),
      { wrapper: createWrapper() }
    );

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(onErrorMock).toHaveBeenCalledWith(mockError);
    // Verificar que el usuario no fue modificado tras error
    expect(useAuthStore.getState().user?.totalXP).toBe(155);
  });

  describe('applyFeedbackToCanvas', () => {
    it('debe resetear los estados previos y aplicar feedback prioritario', () => {
      const items: FeedbackItemDto[] = [
        {
          status: 'warning',
          category: 'costOptimization',
          title: 'Alerta Costo',
          explanation: 'Sobredimensionado',
          penaltyApplied: 0,
          relatedComponentIds: ['node_1']
        }
      ];

      applyFeedbackToCanvas(items);

      const node1 = useCanvasStore.getState().nodes.find((n) => n.id === 'node_1');
      expect(node1?.data.visualStatus).toBe('warning');
      expect(node1?.data.statusMessage).toBe('Sobredimensionado');
    });

    it('debe ignorar items sin relatedComponentIds', () => {
      const items: FeedbackItemDto[] = [
        {
          status: 'pass',
          category: 'architecturePattern',
          title: 'Patrón Correcto',
          explanation: 'General OK',
          penaltyApplied: 0,
          relatedComponentIds: []
        }
      ];

      applyFeedbackToCanvas(items);

      const node1 = useCanvasStore.getState().nodes.find((n) => n.id === 'node_1');
      expect(node1?.data.visualStatus).toBe('default');
    });
  });
});
