import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NodeInspectorPanel } from '../NodeInspectorPanel';
import { useCanvasStore } from '../../../stores/useCanvasStore';

describe('NodeInspectorPanel Component', () => {
  it('no debe renderizarse si ningún nodo está seleccionado', () => {
    useCanvasStore.setState({
      nodes: [
        {
          id: 'node-1',
          type: 'awsServiceNode',
          position: { x: 0, y: 0 },
          selected: false,
          data: {
            serviceCode: 'AWS_EC2',
            name: 'EC2 Web Server',
            category: 'Compute',
          },
        },
      ],
    });

    const { container } = render(<NodeInspectorPanel />);
    expect(container).toBeEmptyDOMElement();
  });

  it('debe renderizarse cuando un nodo está seleccionado y permitir cambiar propiedades', () => {
    useCanvasStore.setState({
      nodes: [
        {
          id: 'node-1',
          type: 'awsServiceNode',
          position: { x: 0, y: 0 },
          selected: true,
          data: {
            serviceCode: 'AWS_EC2',
            name: 'EC2 Web Server',
            category: 'Compute',
            config: {
              autoScaling: false,
              instanceCount: 1,
            },
          },
        },
      ],
    });

    render(<NodeInspectorPanel />);

    expect(screen.getByText('EC2 Web Server')).toBeInTheDocument();
    expect(screen.getByText('Propiedades')).toBeInTheDocument();
    expect(screen.getByText('Health Checks')).toBeInTheDocument();
    expect(screen.getByText('Telemetría')).toBeInTheDocument();

    // Cambiar a tab Health
    const healthTab = screen.getByRole('button', { name: /Health Checks/i });
    fireEvent.click(healthTab);

    expect(screen.getByText('2/2 Sanas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('GET /health')).toBeInTheDocument();

    // Cambiar a tab Telemetría
    const metricsTab = screen.getByRole('button', { name: /Telemetría/i });
    fireEvent.click(metricsTab);

    expect(screen.getByText('1,024 req/s')).toBeInTheDocument();
    expect(screen.getByText('14.2 ms')).toBeInTheDocument();
  });
});
