import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider, NodeProps } from '@xyflow/react';
import { SubnetContainerNode } from '../SubnetContainerNode';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { AwsCanvasNode } from '../../../types/canvas.types';

function renderWithReactFlow(component: React.ReactElement) {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
}

describe('SubnetContainerNode', () => {
  const defaultSubnetProps: NodeProps<AwsCanvasNode> = {
    id: 'subnet_public_1',
    type: 'subnetContainerNode',
    data: {
      serviceCode: 'NET_SUBNET',
      name: 'Public Subnet',
      category: 'NetworkVpc',
      iconUrl: '/icons/aws/subnet.svg',
      config: {
        subnetTier: 'Public',
        cidrBlock: '10.0.1.0/24'
      },
      visualStatus: 'default',
      statusMessage: null
    },
    selected: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 80,
    positionAbsoluteY: 80,
    dragging: false,
    draggable: true,
    selectable: true,
    deletable: true
  };

  beforeEach(() => {
    useCanvasStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false
    });
  });

  it('debe renderizar el título de la Subred Pública y su bloque CIDR', () => {
    renderWithReactFlow(<SubnetContainerNode {...defaultSubnetProps} />);

    expect(screen.getByText('Public Subnet')).toBeInTheDocument();
    expect(screen.getAllByText('10.0.1.0/24').length).toBeGreaterThanOrEqual(1);
  });

  it('debe renderizar correctamente los estilos y textos para una Subred Privada', () => {
    const privateProps: NodeProps<AwsCanvasNode> = {
      ...defaultSubnetProps,
      id: 'subnet_private_1',
      data: {
        ...defaultSubnetProps.data,
        name: 'Private Subnet',
        config: {
          subnetTier: 'Private',
          cidrBlock: '10.0.2.0/24'
        }
      }
    };

    renderWithReactFlow(<SubnetContainerNode {...privateProps} />);

    expect(screen.getByText('Private Subnet')).toBeInTheDocument();
    expect(screen.getAllByText('10.0.2.0/24').length).toBeGreaterThanOrEqual(1);
  });

  it('debe permitir seleccionar un nuevo rango CIDR mediante el selector', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    renderWithReactFlow(<SubnetContainerNode {...defaultSubnetProps} />);

    const cidrSelect = screen.getByTestId('subnet-cidr-select');
    fireEvent.change(cidrSelect, { target: { value: '10.0.4.0/24' } });

    expect(updateNodeConfigSpy).toHaveBeenCalledWith('subnet_public_1', {
      cidrBlock: '10.0.4.0/24',
      cidr: '10.0.4.0/24'
    });
  });

  it('debe mostrar una alerta visual cuando el CIDR colisiona con otra subred en la misma VPC', () => {
    useCanvasStore.setState({
      nodes: [
        {
          id: 'subnet_hermana',
          type: 'subnetContainerNode',
          position: { x: 0, y: 0 },
          parentId: 'vpc_1',
          data: {
            serviceCode: 'NET_SUBNET',
            name: 'Subred Hermana',
            category: 'NetworkVpc',
            iconUrl: '',
            config: { cidrBlock: '10.0.1.0/24' }
          }
        }
      ]
    });

    const conflictingProps: NodeProps<AwsCanvasNode> = {
      ...defaultSubnetProps,
      parentId: 'vpc_1'
    };

    renderWithReactFlow(<SubnetContainerNode {...conflictingProps} />);

    expect(screen.getByTestId('subnet-cidr-warning')).toBeInTheDocument();
  });

  it('debe invocar removeNode al hacer clic en el botón de eliminar Subred', () => {
    const removeNodeSpy = vi.fn();
    useCanvasStore.setState({ removeNode: removeNodeSpy });

    renderWithReactFlow(<SubnetContainerNode {...defaultSubnetProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Subred/i });
    fireEvent.click(deleteBtn);

    expect(removeNodeSpy).toHaveBeenCalledWith('subnet_public_1');
  });

  it('debe renderizar los manejadores de redimensionamiento cuando selected es true', () => {
    renderWithReactFlow(<SubnetContainerNode {...defaultSubnetProps} selected={true} />);

    const subnetElement = screen.getByRole('region', { name: /Public Subnet/i });
    expect(subnetElement).toHaveClass('ring-2');
  });
});
