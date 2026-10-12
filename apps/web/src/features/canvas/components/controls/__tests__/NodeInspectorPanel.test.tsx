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

  it('debe renderizar configuración de Subred cuando un nodo NET_SUBNET está seleccionado', () => {
    useCanvasStore.setState({
      nodes: [
        {
          id: 'sub-node-1',
          type: 'subnetContainerNode',
          position: { x: 0, y: 0 },
          selected: true,
          data: {
            serviceCode: 'NET_SUBNET',
            name: 'Public Subnet Alpha',
            category: 'NetworkVpc',
            iconUrl: '',
            config: {
              subnetTier: 'Public',
              cidrBlock: '10.0.1.0/24'
            }
          }
        }
      ]
    });

    render(<NodeInspectorPanel />);

    expect(screen.getByText('Configuración Subred VPC')).toBeInTheDocument();
    expect(screen.getByText('251 IPs')).toBeInTheDocument();

    // Cambiar Tier en el inspector
    const tierSelect = screen.getByLabelText(/Tipo de Acceso \(Tier\)/i);
    fireEvent.change(tierSelect, { target: { value: 'Private' } });
    expect(useCanvasStore.getState().nodes[0].data.config?.subnetTier).toBe('Private');

    // Cambiar CIDR usando preset
    const presetSelect = screen.getByLabelText(/Presets de Rango CIDR/i);
    fireEvent.change(presetSelect, { target: { value: '10.0.2.0/24' } });
    expect(useCanvasStore.getState().nodes[0].data.config?.cidrBlock).toBe('10.0.2.0/24');
  });

  it('debe renderizar configuración de VPC cuando un nodo NET_VPC está seleccionado', () => {
    useCanvasStore.setState({
      nodes: [
        {
          id: 'vpc-node-1',
          type: 'vpcContainerNode',
          position: { x: 0, y: 0 },
          selected: true,
          data: {
            serviceCode: 'NET_VPC',
            name: 'VPC Enterprise',
            category: 'NetworkVpc',
            iconUrl: '',
            config: {
              cidrBlock: '10.0.0.0/16'
            }
          }
        }
      ]
    });

    render(<NodeInspectorPanel />);

    expect(screen.getByText('Virtual Private Cloud (VPC)')).toBeInTheDocument();
    const vpcInput = screen.getByLabelText(/Bloque CIDR de la VPC/i);
    fireEvent.change(vpcInput, { target: { value: '172.16.0.0/16' } });
    expect(useCanvasStore.getState().nodes[0].data.config?.cidrBlock).toBe('172.16.0.0/16');
  });
});
