import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider, Position, useStoreApi } from '@xyflow/react';
import { CustomConnectionEdge } from '../CustomConnectionEdge';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { useTrafficSimulationStore } from '../../../stores/useTrafficSimulationStore';
import { ConnectionType } from '../../../types/canvas.types';

function TestEdgeContainer({ children }: { children: React.ReactNode }) {
  const store = useStoreApi();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      store.setState({ domNode: containerRef.current });
    }
  }, [store]);

  return (
    <div ref={containerRef} className="react-flow">
      <svg>{children}</svg>
      <div className="react-flow__edgelabel-renderer" />
    </div>
  );
}

function renderWithContainer(component: React.ReactElement) {
  return render(
    <ReactFlowProvider>
      <TestEdgeContainer>{component}</TestEdgeContainer>
    </ReactFlowProvider>
  );
}

describe('CustomConnectionEdge', () => {
  const defaultEdgeProps = {
    id: 'edge_1_to_2',
    source: 'node_1',
    target: 'node_2',
    sourceX: 100,
    sourceY: 100,
    targetX: 200,
    targetY: 300,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    selected: false,
    animated: true,
    data: {
      connectionType: 'HTTP_HTTPS' as ConnectionType,
      visualStatus: 'default' as const
    }
  };

  beforeEach(() => {
    useCanvasStore.setState({
      edges: [],
      selectedEdgeId: null,
      isDirty: false
    });
  });

  it('debe renderizar el trazado SVG con curva bezier y la capa de interacción', () => {
    const { container } = renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} />);

    const visiblePath = container.querySelector(`path#${defaultEdgeProps.id}`);
    expect(visiblePath).toBeInTheDocument();
    expect(visiblePath).toHaveAttribute('d');
    expect(visiblePath?.getAttribute('d')).toContain('M');

    const interactionPath = container.querySelector('path.react-flow__edge-interaction');
    expect(interactionPath).toBeInTheDocument();
    expect(interactionPath).toHaveAttribute('stroke', 'transparent');
    expect(interactionPath).toHaveAttribute('stroke-width', '20');
  });

  it('debe renderizar la animación de flujo de datos cuando animated = true', () => {
    const { container } = renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} animated={true} />);

    const visiblePath = container.querySelector(`path#${defaultEdgeProps.id}`);
    expect(visiblePath).toHaveAttribute('stroke-dasharray', '5 5');
    expect(visiblePath?.classList.contains('animate-edge-flow')).toBe(true);
  });

  it('debe renderizar el badge semántico con el tipo de conexión formateado', () => {
    renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} />);
    expect(screen.getByText('HTTP / HTTPS')).toBeInTheDocument();
  });

  it('debe formatear correctamente diferentes tipos de conexiones arquitectónicas', () => {
    const dbProps = {
      ...defaultEdgeProps,
      data: { connectionType: 'DATABASE' as ConnectionType, visualStatus: 'default' as const }
    };
    const { rerender } = renderWithContainer(<CustomConnectionEdge {...dbProps} />);
    expect(screen.getByText('Database')).toBeInTheDocument();

    const queueProps = {
      ...defaultEdgeProps,
      data: { connectionType: 'ASYNC_QUEUE' as ConnectionType, visualStatus: 'default' as const }
    };
    rerender(
      <ReactFlowProvider>
        <TestEdgeContainer>
          <CustomConnectionEdge {...queueProps} />
        </TestEdgeContainer>
      </ReactFlowProvider>
    );
    expect(screen.getByText('Async Queue')).toBeInTheDocument();
  });

  it('debe invocar removeEdge en useCanvasStore al hacer clic en el botón de eliminación', () => {
    const removeEdgeSpy = vi.fn();
    useCanvasStore.setState({ removeEdge: removeEdgeSpy });

    renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar conexión/i });
    fireEvent.click(deleteBtn);

    expect(removeEdgeSpy).toHaveBeenCalledTimes(1);
    expect(removeEdgeSpy).toHaveBeenCalledWith('edge_1_to_2');
  });

  it('debe renderizar el contenedor de la etiqueta con zIndex 1000 y pointerEvents all para evitar solapamiento', () => {
    const { container } = renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} />);
    const labelContainer = container.querySelector('.react-flow__edgelabel-renderer > div');
    expect(labelContainer).toBeInTheDocument();
    expect(labelContainer).toHaveStyle({ zIndex: '1000', pointerEvents: 'all' });
  });

  it('debe aplicar estilos visuales de selección cuando selected = true', () => {
    const { container } = renderWithContainer(
      <CustomConnectionEdge {...defaultEdgeProps} selected={true} />
    );

    const visiblePath = container.querySelector(`path#${defaultEdgeProps.id}`);
    expect(visiblePath).toHaveAttribute('stroke', '#FF9900');
    expect(visiblePath).toHaveAttribute('stroke-width', '2.5');
  });

  it('debe aplicar estilos cromáticos según el estado visual de evaluación (pass, error, warning)', () => {
    // Pass -> Emerald
    const passProps = {
      ...defaultEdgeProps,
      data: { connectionType: 'HTTP_HTTPS' as ConnectionType, visualStatus: 'pass' as const }
    };
    const { container, rerender } = renderWithContainer(<CustomConnectionEdge {...passProps} />);
    let visiblePath = container.querySelector(`path#${defaultEdgeProps.id}`);
    expect(visiblePath).toHaveAttribute('stroke', '#10B981');

    // Error -> Red
    const errorProps = {
      ...defaultEdgeProps,
      data: { connectionType: 'HTTP_HTTPS' as ConnectionType, visualStatus: 'error' as const }
    };
    rerender(
      <ReactFlowProvider>
        <TestEdgeContainer>
          <CustomConnectionEdge {...errorProps} />
        </TestEdgeContainer>
      </ReactFlowProvider>
    );
    visiblePath = container.querySelector(`path#${defaultEdgeProps.id}`);
    expect(visiblePath).toHaveAttribute('stroke', '#EF4444');
  });

  it('debe renderizar partículas SVG animadas cuando la simulación de tráfico está activa', () => {
    useTrafficSimulationStore.getState().startSimulation();

    const { container } = renderWithContainer(<CustomConnectionEdge {...defaultEdgeProps} />);
    const particles = container.querySelectorAll('circle');
    expect(particles.length).toBeGreaterThan(0);

    const animateMotions = container.querySelectorAll('animateMotion');
    expect(animateMotions.length).toBeGreaterThan(0);

    useTrafficSimulationStore.getState().stopSimulation();
  });
});
