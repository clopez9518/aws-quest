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
    expect(screen.getByText('10.0.1.0/24')).toBeInTheDocument();
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
    expect(screen.getByText('10.0.2.0/24')).toBeInTheDocument();
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
