import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider, NodeProps } from '@xyflow/react';
import { AwsServiceNode } from '../AwsServiceNode';
import { useCanvasStore } from '../../../stores/useCanvasStore';
import { AwsCanvasNode } from '../../../types/canvas.types';

function renderWithReactFlow(component: React.ReactElement) {
  return render(<ReactFlowProvider>{component}</ReactFlowProvider>);
}

describe('AwsServiceNode', () => {
  const defaultNodeProps: NodeProps<AwsCanvasNode> = {
    id: 'node_ec2_1',
    type: 'awsServiceNode',
    data: {
      serviceCode: 'AWS_EC2',
      name: 'Amazon EC2',
      category: 'Compute',
      iconUrl: '/icons/aws/ec2.svg',
      config: {
        instanceCount: 1,
        isMultiAz: false,
        autoScaling: false,
        isPublic: false
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

  it('debe renderizar el nombre del servicio, icono y categoría correctamente', () => {
    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Compute')).toBeInTheDocument();

    const img = screen.getByRole('img', { name: /Amazon EC2/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/icons/aws/ec2.svg');
  });

  it('debe utilizar el fallback /icons/aws/default.svg ante error en carga de imagen', () => {
    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    const img = screen.getByRole('img', { name: /Amazon EC2/i });
    fireEvent.error(img);

    expect(img).toHaveAttribute('src', '/icons/aws/default.svg');
  });

  it('debe contener los Handles de entrada (Target) y salida (Source)', () => {
    const { container } = renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    const targetHandle = container.querySelector('.react-flow__handle-top[data-handleid="target-top"]');
    const sourceHandle = container.querySelector('.react-flow__handle-bottom[data-handleid="source-bottom"]');

    expect(targetHandle).toBeInTheDocument();
    expect(sourceHandle).toBeInTheDocument();
  });

  it('debe permitir alternar Auto Scaling en un nodo EC2', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    const asgBtn = screen.getByRole('button', { name: /Alternar Auto Scaling Group/i });
    expect(asgBtn).toHaveTextContent('Auto Scaling OFF');

    fireEvent.click(asgBtn);
    expect(updateNodeConfigSpy).toHaveBeenCalledWith('node_ec2_1', { autoScaling: true });
  });

  it('debe permitir cambiar la cantidad de instancias en un nodo EC2', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    const select = screen.getByRole('combobox', { name: /Cantidad de instancias EC2/i });
    fireEvent.change(select, { target: { value: '2' } });

    expect(updateNodeConfigSpy).toHaveBeenCalledWith('node_ec2_1', { instanceCount: 2 });
  });

  it('debe permitir alternar Multi-AZ y acceso público en un nodo RDS', () => {
    const updateNodeConfigSpy = vi.fn();
    useCanvasStore.setState({ updateNodeConfig: updateNodeConfigSpy });

    const rdsProps: NodeProps<AwsCanvasNode> = {
      ...defaultNodeProps,
      id: 'node_rds_1',
      data: {
        ...defaultNodeProps.data,
        serviceCode: 'AWS_RDS',
        name: 'Amazon RDS',
        category: 'Database',
        config: {
          isMultiAz: false,
          isPublic: false
        }
      }
    };

    renderWithReactFlow(<AwsServiceNode {...rdsProps} />);

    const multiAzBtn = screen.getByRole('button', { name: /Alternar Redundancia Multi-AZ/i });
    expect(multiAzBtn).toHaveTextContent('Multi-AZ OFF');

    fireEvent.click(multiAzBtn);
    expect(updateNodeConfigSpy).toHaveBeenCalledWith('node_rds_1', { isMultiAz: true });

    const publicBtn = screen.getByRole('button', { name: /Alternar acceso público/i });
    expect(publicBtn).toHaveTextContent('Privado');

    fireEvent.click(publicBtn);
    expect(updateNodeConfigSpy).toHaveBeenCalledWith('node_rds_1', { isPublic: true });
  });

  it('debe aplicar clases visuales de selección cuando selected = true', () => {
    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} selected={true} />);

    const nodeCard = screen.getByRole('region', { name: /Servicio AWS Amazon EC2/i });
    expect(nodeCard.className).toContain('border-amber-500');
    expect(nodeCard.className).toContain('ring-amber-500/40');
  });

  it('debe aplicar clases de estado error y desplegar el mensaje de diagnóstico', () => {
    const errorNodeProps = {
      ...defaultNodeProps,
      data: {
        ...defaultNodeProps.data,
        visualStatus: 'error' as const,
        statusMessage: 'Falta balanceador de carga'
      }
    };

    renderWithReactFlow(<AwsServiceNode {...errorNodeProps} />);

    const nodeCard = screen.getByRole('region', { name: /Servicio AWS Amazon EC2/i });
    expect(nodeCard.className).toContain('border-red-500');
    expect(screen.getByText('Falta balanceador de carga')).toBeInTheDocument();
  });

  it('debe aplicar clases de estado pass y desplegar el mensaje de éxito', () => {
    const passNodeProps = {
      ...defaultNodeProps,
      data: {
        ...defaultNodeProps.data,
        visualStatus: 'pass' as const,
        statusMessage: 'Instancia EC2 protegida correctamente'
      }
    };

    renderWithReactFlow(<AwsServiceNode {...passNodeProps} />);

    const nodeCard = screen.getByRole('region', { name: /Servicio AWS Amazon EC2/i });
    expect(nodeCard.className).toContain('border-emerald-500');
    expect(screen.getByText('Instancia EC2 protegida correctamente')).toBeInTheDocument();
  });

  it('debe invocar removeNode en useCanvasStore al hacer clic en el botón de eliminación', () => {
    const removeNodeSpy = vi.fn();
    useCanvasStore.setState({ removeNode: removeNodeSpy });

    renderWithReactFlow(<AwsServiceNode {...defaultNodeProps} />);

    const deleteBtn = screen.getByRole('button', { name: /Eliminar servicio del canvas/i });
    fireEvent.click(deleteBtn);

    expect(removeNodeSpy).toHaveBeenCalledTimes(1);
    expect(removeNodeSpy).toHaveBeenCalledWith('node_ec2_1');
  });
});
