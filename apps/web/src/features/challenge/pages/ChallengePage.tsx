import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasStore } from '../../canvas/stores/useCanvasStore';
import { useTrafficSimulationStore } from '../../canvas/stores/useTrafficSimulationStore';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { ChallengeHint, ArchitectureRequirement } from '../types/challenge.types';
import { useChallenge } from '../hooks/useChallenge';
import { useUnlockHint } from '../hooks/useUnlockHint';
import { useEvaluateChallenge } from '../../evaluation/hooks/useEvaluateChallenge';
import {
  validateArchitectureForEvaluation,
  createEvaluateArchitecturePayload
} from '../../evaluation/utils/graphSerializer';
import { EvaluationModal } from '../../evaluation/components/EvaluationModal';
import { LevelUpModal } from '../../../shared/components/LevelUpModal';
import { AuthModal } from '../../auth/components/AuthModal';
import { RestoreAttemptModal } from '../../evaluation/components/RestoreAttemptModal';
import { BriefingModal } from '../components/BriefingModal';
import { BusinessCaseModal } from '../components/BusinessCaseModal';
import {
  EvaluateArchitectureResponseDto,
  ChallengeAttemptHistoryDto
} from '../../evaluation/types/evaluation.types';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { ProblemContextPanel } from '../components/ProblemContextPanel';
import { ArchitectureCanvas } from '../components/ArchitectureCanvas';
import { NodeInspectorPanel } from '../../canvas/components/controls/NodeInspectorPanel';
import { HintDrawer } from '../components/HintDrawer';
import { ChallengeWorkspaceSkeleton } from '../components/ChallengeWorkspaceSkeleton';
import { ChallengeErrorState } from '../components/ChallengeErrorState';

export function ChallengePage() {
  const { id } = useParams<{ id: string }>();

  // Consumo de datos reales desde el Backend con TanStack Query
  const {
    data: challengeDto,
    isLoading,
    isError,
    error,
    refetch
  } = useChallenge(id);

  // Hook de mutación para revelar pistas
  const { mutate: unlockHintMutation } = useUnlockHint(id ?? '');

  // Estados visuales del Workspace, Modales y Evaluación
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isHintsDrawerOpen, setIsHintsDrawerOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isBusinessCaseModalOpen, setIsBusinessCaseModalOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; totalXp: number } | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateArchitectureResponseDto | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  // Estado del modal de restauración de intento
  const [restoreModalData, setRestoreModalData] = useState<{
    isOpen: boolean;
    attempt: ChallengeAttemptHistoryDto | null;
    attemptNumber: number;
  }>({
    isOpen: false,
    attempt: null,
    attemptNumber: 0
  });

  // Referencia para comparar nivel antes y después de evaluar
  const levelBeforeEvaluationRef = useRef<number>(1);
  // Referencia para no re-inicializar el canvas cuando TanStack Query refresca el desafío
  const loadedChallengeIdRef = useRef<string | null>(null);

  // Hook de mutación para evaluar solución arquitectónica
  const { mutate: evaluateMutation, isPending: isEvaluating } = useEvaluateChallenge(id ?? '', {
    onSuccess: (data) => {
      setEvaluationResult(data);
      setIsEvaluationModalOpen(true);
      setValidationError(null);

      // Detectar si subió de nivel
      if (data.currentUserLevel && data.currentUserLevel > levelBeforeEvaluationRef.current) {
        setLevelUpData({
          newLevel: data.currentUserLevel,
          totalXp: data.currentUserXP ?? 0
        });
      }
    },
    onError: (err) => {
      setValidationError(err.message || 'Error al evaluar la arquitectura.');
    }
  });

  // Selectores y acciones del Store de Canvas
  const setAllowedServices = useCanvasStore((state) => state.setAllowedServices);
  const loadSemanticGraph = useCanvasStore((state) => state.loadSemanticGraph);
  const nodeCount = useCanvasStore((state) => state.nodes.length);

  // Selectores y acciones del Store de Simulación de Tráfico
  const isSimulating = useTrafficSimulationStore((state) => state.isSimulating);
  const startSimulation = useTrafficSimulationStore((state) => state.startSimulation);
  const stopSimulation = useTrafficSimulationStore((state) => state.stopSimulation);

  // Mapeo de servicios permitidos
  const allowedServices: ServicePaletteItem[] = useMemo(() => {
    if (!challengeDto) return [];
    return challengeDto.allowedServices.map((s) => ({
      code: s.code,
      name: s.name,
      category: s.category,
      iconUrl: s.iconUrl || '/icons/aws/default.svg',
      maxInstances: s.maxInstances,
      isDistractor: s.isDistractor
    }));
  }, [challengeDto]);

  // Mapeo de pistas secuenciales para el HintDrawer
  const hints: ChallengeHint[] = useMemo(() => {
    if (!challengeDto) return [];
    const { totalHints, unlockedHints } = challengeDto.hintsSummary;
    const result: ChallengeHint[] = [];

    for (let i = 1; i <= totalHints; i++) {
      const unlocked = unlockedHints.find((h) => h.orderIndex === i);
      if (unlocked) {
        result.push({
          orderIndex: i,
          text: unlocked.text,
          penaltyPoints: unlocked.penaltyApplied,
          isUnlocked: true
        });
      } else {
        result.push({
          orderIndex: i,
          text: null,
          penaltyPoints: i * 5,
          isUnlocked: false
        });
      }
    }

    return result;
  }, [challengeDto]);

  // Requisitos derivados de la arquitectura para el panel de contexto
  const requirements: ArchitectureRequirement[] = useMemo(() => {
    if (!challengeDto) return [];
    return [
      {
        id: 'req-1',
        type: 'required_service',
        title: 'Servicios de Arquitectura Requeridos',
        description: `Implementa la solución utilizando los servicios autorizados para el modo ${
          challengeDto.mode === 'fixArchitecture' ? 'Reparación' : 'Diseño (Builder)'
        }.`
      },
      {
        id: 'req-2',
        type: 'connection',
        title: 'Conectividad y Flujo de Datos',
        description:
          'Enlaza los componentes respetando la topología de red, zonas de disponibilidad y protocolos permitidos.'
      }
    ];
  }, [challengeDto]);

  // Inicializar canvas y briefing al recibir por primera vez o cambiar el desafío
  useEffect(() => {
    if (challengeDto) {
      if (loadedChallengeIdRef.current !== challengeDto.id) {
        setAllowedServices(allowedServices);
        const isFixMode =
          challengeDto.mode === 'fixArchitecture' ||
          (typeof challengeDto.mode === 'string' &&
            challengeDto.mode.toLowerCase() === 'fixarchitecture');
        const graphToLoad =
          challengeDto.lastAttemptGraph ??
          (isFixMode && challengeDto.initialGraph ? challengeDto.initialGraph : null);

        loadSemanticGraph(graphToLoad, allowedServices);
        loadedChallengeIdRef.current = challengeDto.id;

        // Auto-abrir briefing si existe y el usuario no lo ha silenciado
        if (challengeDto.briefing) {
          const isHidden =
            localStorage.getItem(`awsquest_hide_briefing_${challengeDto.id}`) === 'true';
          if (!isHidden) {
            setIsBriefingModalOpen(true);
          }
        }
      } else {
        setAllowedServices(allowedServices);
      }
    }
  }, [challengeDto, allowedServices, setAllowedServices, loadSemanticGraph]);

  // Manejar desbloqueo de pista
  const handleUnlockHint = () => {
    unlockHintMutation();
  };

  // Manejar envío de arquitectura al motor de evaluación
  const handleSubmit = () => {
    const nodes = useCanvasStore.getState().nodes;
    const edges = useCanvasStore.getState().edges;

    // Validación temprana en cliente (fast-fail)
    const validation = validateArchitectureForEvaluation(nodes, edges);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage);
      return;
    }

    setValidationError(null);
    levelBeforeEvaluationRef.current = useAuthStore.getState().user?.level ?? 1;
    const hintsUsedCount = challengeDto?.hintsSummary.unlockedCount ?? 0;
    const payload = createEvaluateArchitecturePayload(nodes, edges, hintsUsedCount);
    evaluateMutation(payload);
  };

  // Ejecución atómica de la restauración de un intento
  const executeRestore = (attempt: ChallengeAttemptHistoryDto, attemptNumber: number) => {
    loadSemanticGraph(attempt.graphSubmitted ?? null, allowedServices);
    useCanvasStore.getState().resetVisualStatuses();
    setValidationError(null);
    setRestoredNotice(`Intento #${attemptNumber} cargado en el lienzo (${attempt.score}/100 pts).`);

    // Desvanecer aviso tras 4 segundos
    setTimeout(() => {
      setRestoredNotice((prev) => (prev?.includes(`#${attemptNumber}`) ? null : prev));
    }, 4000);
  };

  // Manejador del clic "Cargar en Canvas" desde la tarjeta de intento
  const handleRestoreAttempt = (attempt: ChallengeAttemptHistoryDto, attemptNumber: number) => {
    const currentNodesCount = useCanvasStore.getState().nodes.length;
    if (currentNodesCount > 0) {
      setRestoreModalData({
        isOpen: true,
        attempt,
        attemptNumber
      });
    } else {
      executeRestore(attempt, attemptNumber);
    }
  };

  // Estado de Carga
  if (isLoading) {
    return <ChallengeWorkspaceSkeleton />;
  }

  // Estado de Error o Desafío No Encontrado
  if (isError || !challengeDto) {
    return <ChallengeErrorState error={error} onRetry={() => refetch()} />;
  }

  const unlockedHintsCount = challengeDto.hintsSummary.unlockedCount;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden select-none bg-slate-50 dark:bg-slate-950">
      {/* Alerta de Validación de Cliente */}
      {validationError && (
        <div
          role="alert"
          className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150"
        >
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Alerta Informativa de Intento Restaurado */}
      {restoredNotice && (
        <div
          role="status"
          className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150"
        >
          <span>{restoredNotice}</span>
          <button
            type="button"
            onClick={() => setRestoredNotice(null)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior del Workspace */}
      <WorkspaceHeader
        title={challengeDto.title}
        difficulty={challengeDto.difficulty}
        mode={challengeDto.mode}
        baseXP={challengeDto.baseXP}
        totalHints={challengeDto.hintsSummary.totalHints}
        unlockedHintsCount={unlockedHintsCount}
        nodeCount={nodeCount}
        hasBriefing={Boolean(challengeDto.briefing)}
        onOpenBriefing={() => setIsBriefingModalOpen(true)}
        onOpenBusinessCase={() => setIsBusinessCaseModalOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => (isSimulating ? stopSimulation() : startSimulation())}
        isLeftPanelCollapsed={isLeftPanelCollapsed}
        onToggleLeftPanel={() => setIsLeftPanelCollapsed((prev) => !prev)}
        onOpenHints={() => setIsHintsDrawerOpen(true)}
        onSubmit={handleSubmit}
        isSubmitting={isEvaluating}
      />

      {/* Cuerpo en 3 Paneles */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden relative">
        {/* Panel Lateral Izquierdo: Requisitos, Paleta de Servicios e Historial de Intentos */}
        <ProblemContextPanel
          challengeId={id}
          description={challengeDto.description}
          mode={challengeDto.mode}
          requirements={requirements}
          allowedServices={allowedServices}
          isCollapsed={isLeftPanelCollapsed}
          hasBriefing={Boolean(challengeDto.briefing)}
          onOpenBriefing={() => setIsBriefingModalOpen(true)}
          onOpenBusinessCase={() => setIsBusinessCaseModalOpen(true)}
          onToggleCollapse={() => setIsLeftPanelCollapsed((prev) => !prev)}
          onRestoreAttempt={handleRestoreAttempt}
        />

        {/* Panel Central: Lienzo Interactivo de React Flow */}
        <ArchitectureCanvas />

        {/* Panel Lateral de Inspección Reactivo (Stitch Screen 2 & 3) */}
        <NodeInspectorPanel />

        {/* Panel Lateral Derecho: Cajón de Pistas */}
        <HintDrawer
          isOpen={isHintsDrawerOpen}
          onClose={() => setIsHintsDrawerOpen(false)}
          hints={hints}
          unlockedCount={unlockedHintsCount}
          onUnlockHint={handleUnlockHint}
        />
      </div>

      {/* Modal de Micro-Cápsula de Contexto (Briefing) */}
      <BriefingModal
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
        challengeTitle={challengeDto.title}
        briefing={challengeDto.briefing}
        challengeId={challengeDto.id}
      />

      {/* Modal de Caso de Negocio y Requerimientos */}
      <BusinessCaseModal
        isOpen={isBusinessCaseModalOpen}
        onClose={() => setIsBusinessCaseModalOpen(false)}
        challengeTitle={challengeDto.title}
        description={challengeDto.description}
        mode={challengeDto.mode}
        difficulty={challengeDto.difficulty}
        businessScenario={challengeDto.briefing?.businessScenario}
        requirements={requirements}
        allowedServices={allowedServices}
      />

      {/* Modal de Resultados y Feedback Pedagógico */}
      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        result={evaluationResult}
        challengeTitle={challengeDto.title}
        challengeId={challengeDto.id}
        reflectionPrompt={challengeDto.reflectionPrompt}
        onRetry={() => setIsEvaluationModalOpen(false)}
        onRegisterClick={() => setIsAuthModalOpen(true)}
      />

      {/* Modal de Celebración de Nivel (Level Up) */}
      {levelUpData && (
        <LevelUpModal
          isOpen={true}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData.newLevel}
          totalXp={levelUpData.totalXp}
        />
      )}

      {/* Modal de Autenticación / Migración de Invitado */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal de Confirmación para Restaurar Intento Previo */}
      <RestoreAttemptModal
        isOpen={restoreModalData.isOpen}
        onClose={() =>
          setRestoreModalData({
            isOpen: false,
            attempt: null,
            attemptNumber: 0
          })
        }
        onConfirm={() => {
          if (restoreModalData.attempt) {
            executeRestore(restoreModalData.attempt, restoreModalData.attemptNumber);
          }
        }}
        attemptNumber={restoreModalData.attemptNumber}
        attemptScore={restoreModalData.attempt?.score ?? 0}
        currentNodesCount={nodeCount}
      />
    </div>
  );
}
