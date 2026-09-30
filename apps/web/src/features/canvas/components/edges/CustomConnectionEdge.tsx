import React from 'react';
import {
  getBezierPath,
  EdgeLabelRenderer,
  EdgeProps
} from '@xyflow/react';
import { X } from 'lucide-react';
import { AwsCanvasEdge, ConnectionType } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useTrafficSimulationStore } from '../../stores/useTrafficSimulationStore';
import { evaluateEdgeTrafficFlow } from '../../utils/trafficFlowEvaluator';
import { cn } from '../../../../shared/utils/cn';

function formatConnectionType(type?: ConnectionType | string): string {
  switch (type) {
    case 'HTTP_HTTPS':
      return 'HTTP / HTTPS';
    case 'DATABASE':
      return 'Database';
    case 'ASYNC_QUEUE':
      return 'Async Queue';
    case 'INTERNAL_VPC':
      return 'Internal VPC';
    case 'STORAGE':
      return 'Storage';
    case 'SECURITY_GROUP':
    case 'ATTACHED_SECURITY_GROUP':
      return 'Security Group';
    case 'ATTACHED_VPC':
      return 'Attached VPC';
    case 'NETWORK_ROUTE':
      return 'Network Route';
    default:
      return type || 'HTTP / HTTPS';
  }
}

export function CustomConnectionEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated = true,
  data
}: EdgeProps<AwsCanvasEdge>) {
  const removeEdge = useCanvasStore((state) => state.removeEdge);
  const nodes = useCanvasStore((state) => state.nodes);

  const isSimulating = useTrafficSimulationStore((state) => state.isSimulating);
  const isPaused = useTrafficSimulationStore((state) => state.isPaused);
  const activeScenario = useTrafficSimulationStore((state) => state.activeScenario);
  const simulationSpeed = useTrafficSimulationStore((state) => state.simulationSpeed);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeEdge(id);
  };

  const visualStatus = data?.visualStatus || 'default';

  // Configuración cromática de la línea según estado de feedback
  const getStrokeColor = () => {
    if (visualStatus === 'pass') return '#10B981'; // Emerald 500
    if (visualStatus === 'error') return '#EF4444'; // Red 500
    if (visualStatus === 'warning') return '#F59E0B'; // Amber 500
    if (selected) return '#FF9900'; // AWS Orange
    return style.stroke || '#94A3B8'; // Slate 400 default
  };

  const strokeColor = getStrokeColor();
  const strokeWidth = selected ? 2.5 : 2;

  // Evaluar flujo de tráfico simulado
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  const currentEdge: AwsCanvasEdge = {
    id,
    source,
    target,
    data
  };

  const flowConfig = evaluateEdgeTrafficFlow(
    currentEdge,
    sourceNode,
    targetNode,
    activeScenario,
    simulationSpeed
  );

  return (
    <>
      {/* 1. Capa Invisible de Interacción (Hitbox amplia para facilitar clic y hover) */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        className="cursor-pointer react-flow__edge-interaction"
      />

      {/* 2. Trazado Visual Visible con animación de flujo de datos */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={animated !== false ? '5 5' : undefined}
        markerEnd={markerEnd}
        className={cn(
          'transition-all duration-200',
          animated !== false && 'animate-edge-flow'
        )}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth
        }}
      />

      {/* 2.1. Capa de Partículas Dinámicas de Tráfico (Visual Flow Simulator) */}
      {isSimulating && (
        <g data-testid="traffic-particles-group" className="pointer-events-none">
          {Array.from({ length: flowConfig.particleCount }).map((_, idx) => {
            const beginDelay = (
              idx *
              (flowConfig.baseDurationSeconds / flowConfig.particleCount)
            ).toFixed(2);

            return (
              <circle
                key={idx}
                r={flowConfig.isBlocked ? 4 : 3.5}
                fill={flowConfig.particleColor}
                style={{
                  filter: `drop-shadow(0 0 5px ${flowConfig.glowColor})`
                }}
              >
                {!isPaused && (
                  <animateMotion
                    path={edgePath}
                    dur={`${flowConfig.baseDurationSeconds}s`}
                    begin={`${beginDelay}s`}
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            );
          })}
        </g>
      )}

      {/* 3. Etiqueta Semántica Central y Botón de Eliminación Rápida */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 1000
          }}
          className={cn(
            'nodrag nopan flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-md transition-all select-none',
            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80',
            selected && 'border-amber-500 ring-1 ring-amber-500 shadow-amber-500/10'
          )}
        >
          {/* Badge del Tipo de Conexión */}
          <span className="text-[9px] font-mono font-bold tracking-tight text-slate-700 dark:text-slate-300">
            {formatConnectionType(data?.connectionType)}
          </span>

          {/* Botón de Borrado Rápido de la Conexión */}
          <button
            type="button"
            onClick={handleDelete}
            className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors focus:outline-none"
            title="Eliminar conexión"
            aria-label="Eliminar conexión"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
