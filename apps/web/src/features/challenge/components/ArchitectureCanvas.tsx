import { useRef, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useReactFlow,
  type OnNodeDrag
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '../../canvas/stores/useCanvasStore';
import { useTheme } from '../../../shared/hooks/useTheme';
import { nodeTypes, edgeTypes } from '../../canvas/components/canvasElementTypes';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { CanvasToolbar } from './CanvasToolbar';
import { ResetCanvasModal } from './ResetCanvasModal';
import { TrafficSimulationHUD } from '../../canvas/components/controls/TrafficSimulationHUD';

function ArchitectureCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { isDark } = useTheme();

  const nodes = useCanvasStore((state) => state.nodes);
  const edges = useCanvasStore((state) => state.edges);
  const onNodesChange = useCanvasStore((state) => state.onNodesChange);
  const onEdgesChange = useCanvasStore((state) => state.onEdgesChange);
  const onConnect = useCanvasStore((state) => state.onConnect);
  const addNode = useCanvasStore((state) => state.addNode);
  const reparentNode = useCanvasStore((state) => state.reparentNode);
  const resetCanvas = useCanvasStore((state) => state.resetCanvas);

  const { screenToFlowPosition } = useReactFlow();

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      reparentNode(node.id);
    },
    [reparentNode]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawService = event.dataTransfer.getData('application/awsquest-service');
      if (!rawService) return;

      try {
        const service: ServicePaletteItem = JSON.parse(rawService);

        let position = { x: 100, y: 100 };
        try {
          position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
          });
        } catch {
          const bounds = reactFlowWrapper.current?.getBoundingClientRect();
          if (bounds) {
            position = {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top
            };
          }
        }

        addNode(service, position);
      } catch (err) {
        console.error('Error al instanciar servicio desde drag & drop:', err);
      }
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div
      data-testid="architecture-canvas"
      ref={reactFlowWrapper}
      className="relative flex-1 min-h-0 min-w-0 h-full w-full bg-slate-100 dark:bg-[#0B0F19] overflow-hidden select-none transition-colors duration-200"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        style={{ width: '100%', height: '100%' }}
        fitView
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{
          type: 'customConnectionEdge',
          animated: true
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* Dot Grid adaptativo */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color={isDark ? 'rgba(75, 85, 99, 0.45)' : 'rgba(148, 163, 184, 0.55)'}
          className="bg-slate-100 dark:bg-[#0B0F19]"
        />

        {/* Barra flotante de herramientas */}
        <CanvasToolbar
          onOpenResetModal={() => setIsResetModalOpen(true)}
          nodeCount={nodes.length}
        />
      </ReactFlow>

      {/* HUD flotante de simulación de tráfico */}
      <TrafficSimulationHUD />

      {/* Modal de confirmación de reinicio */}
      <ResetCanvasModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetCanvas}
      />
    </div>
  );
}

export function ArchitectureCanvas() {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner />
    </ReactFlowProvider>
  );
}
