import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider, NodeProps } from '@xyflow/react';
import { SecurityGroupNode } from '../SecurityGroupNode';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { AwsCanvasNode } from '../../../types/canvas.types';

function renderWithReactFlow(component: React.ReactElement) {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
}

describe('SecurityGroupNode', () => {
  const defaultSgProps: NodeProps<AwsCanvasNode> = {
    id: 'sg_1',
    type: 'securityGroupNode',
    data: {
      serviceCode: 'NET_SECURITY_GROUP',
      name: 'Security Group',
      category: 'Security',
      iconUrl: '/icons/aws/default.svg',
      config: {
        securityGroupRules: [
          {
            direction: 'Ingress',
            protocol: 'TCP',
            fromPort: 5432,
            toPort: 5432,
            source: 'AWS_EC2',
            description: 'PostgreSQL desde EC2'
          }
        ]
      },
      visualStatus: 'default',
      statusMessage: null
    },
    selected: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 100,
    positionAbsoluteY: 100,
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

  it('debe renderizar el título, id y las reglas configuradas', () => {
    renderWithReactFlow(<SecurityGroupNode {...defaultSgProps} />);

    expect(screen.getByText('Security Group')).toBeInTheDocument();
    expect(screen.getByText('sg_1')).toBeInTheDocument();
    expect(screen.getByText('TCP:5432')).toBeInTheDocument();
    expect(screen.getByText(/AWS_EC2/i)).toBeInTheDocument();
  });

  it('debe permitir añadir una regla mediante preset', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    renderWithReactFlow(<SecurityGroupNode {...defaultSgProps} />);

    const addBtn = screen.getByRole('button', { name: /Añadir regla seleccionada/i });
    fireEvent.click(addBtn);

    expect(updateNodeConfigSpy).toHaveBeenCalledWith('sg_1', expect.objectContaining({
      securityGroupRules: expect.arrayContaining([
        expect.objectContaining({ fromPort: 5432, protocol: 'TCP', source: 'AWS_EC2' })
      ])
    }));
  });

  it('debe permitir eliminar una regla existente', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    renderWithReactFlow(<SecurityGroupNode {...defaultSgProps} />);

    const deleteRuleBtn = screen.getByRole('button', { name: /Eliminar regla puerto 5432/i });
    fireEvent.click(deleteRuleBtn);

    expect(updateNodeConfigSpy).toHaveBeenCalledWith('sg_1', {
      securityGroupRules: []
    });
  });

  it('debe invocar removeNode al hacer clic en el botón de eliminación de Security Group', () => {
    const removeNodeSpy = vi.fn();
    useCanvasStore.setState({ removeNode: removeNodeSpy });

    renderWithReactFlow(<SecurityGroupNode {...defaultSgProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar Security Group/i });
    fireEvent.click(deleteBtn);

    expect(removeNodeSpy).toHaveBeenCalledWith('sg_1');
  });
});
