import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider, NodeProps } from '@xyflow/react';
import { VpcContainerNode } from '../VpcContainerNode';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { AwsCanvasNode } from '../../../types/canvas.types';

function renderWithReactFlow(component: React.ReactElement) {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
}

describe('VpcContainerNode', () => {
  const defaultVpcProps: NodeProps<AwsCanvasNode> = {
    id: 'vpc_1',
    type: 'vpcContainerNode',
    data: {
      serviceCode: 'NET_VPC',
      name: 'Virtual Private Cloud (VPC)',
      category: 'NetworkVpc',
      iconUrl: '/icons/aws/vpc.svg',
      config: {
        cidrBlock: '10.0.0.0/16'
      },
      visualStatus: 'default',
      statusMessage: null
    },
    selected: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 50,
    positionAbsoluteY: 50,
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

  it('debe renderizar el título de la VPC y el badge CIDR 10.0.0.0/16', () => {
    renderWithReactFlow(<VpcContainerNode {...defaultVpcProps} />);

    expect(screen.getByText('Virtual Private Cloud (VPC)')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.0/16')).toBeInTheDocument();
  });

  it('debe invocar removeNode al hacer clic en el botón de eliminación de VPC', () => {
    const removeNodeSpy = vi.fn();
    useCanvasStore.setState({ removeNode: removeNodeSpy });

    renderWithReactFlow(<VpcContainerNode {...defaultVpcProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar VPC/i });
    fireEvent.click(deleteBtn);

    expect(removeNodeSpy).toHaveBeenCalledWith('vpc_1');
  });

  it('debe renderizar los manejadores de redimensionamiento cuando selected es true', () => {
    renderWithReactFlow(<VpcContainerNode {...defaultVpcProps} selected={true} />);

    // NodeResizer genera los elementos de resize de React Flow
    const vpcElement = screen.getByRole('region', { name: /Virtual Private Cloud/i });
    expect(vpcElement).toHaveClass('ring-2');
  });
});
