import { describe, it, expect } from 'vitest';
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
            iconUrl: '',
            config: {},
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
            iconUrl: '',
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
    expect(screen.getByText('Propiedades del Recurso')).toBeInTheDocument();
    expect(screen.getByText('Elasticidad y Cómputo EC2')).toBeInTheDocument();

    // Modificar nombre
    const nameInput = screen.getByLabelText(/Nombre del Recurso/i);
    fireEvent.change(nameInput, { target: { value: 'Frontend EC2 Fleet' } });
    expect(useCanvasStore.getState().nodes[0].data.name).toBe('Frontend EC2 Fleet');

    // Cambiar toggle auto-scaling
    const toggleButton = screen.getByRole('button', { name: /DESACTIVADO/i });
    fireEvent.click(toggleButton);
    expect(useCanvasStore.getState().nodes[0].data.config?.autoScaling).toBe(true);
  });
});
