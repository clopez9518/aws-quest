import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  XYPosition
} from '@xyflow/react';
import {
  CanvasStore,
  AwsCanvasNode,
  AwsCanvasEdge,
  AwsCanvasNodeType,
  ConnectionType,
  ComponentConfig,
  AwsServiceNodeData,
  NodeVisualStatus,
  SemanticGraphDto,
  ServicePaletteItem,
  SubnetTier
} from '../types/canvas.types';

const LAYER_MAP: Record<string, number> = {
  Edge: 0,
  Security: 0,
  Compute: 1,
  Integration: 1,
  Database: 2,
  Storage: 2,
  Analytics: 2,
  Networking: 0,
  Network: 0
};

/**
 * Resuelve el tipo de nodo en React Flow en base al código de servicio AWS.
 */
export function resolveNodeType(serviceCode: string): AwsCanvasNodeType {
  switch (serviceCode.toUpperCase()) {
    case 'NET_VPC':
      return 'vpcContainerNode';
    case 'NET_SUBNET':
      return 'subnetContainerNode';
    case 'NET_IGW':
    case 'NET_NAT_GATEWAY':
    case 'NET_ROUTE_TABLE':
    case 'NET_NACL':
      return 'gatewayNode';
    case 'NET_SECURITY_GROUP':
      return 'securityGroupNode';
    default:
      return 'awsServiceNode';
  }
}

/**
 * Infiere el tipo de conexión semántica en base al servicio y categoría de origen y destino.
 */
function inferConnectionType(
  sourceNode?: AwsCanvasNode,
  targetNode?: AwsCanvasNode
): ConnectionType {
  if (!targetNode) return 'HTTP_HTTPS';

  const targetCategory = targetNode.data.category?.toLowerCase() || '';
  const targetCode = targetNode.data.serviceCode?.toUpperCase() || '';
  const sourceCode = sourceNode?.data.serviceCode?.toUpperCase() || '';

  // Conexión VPC <-> Internet Gateway / NAT Gateway
  if (
    (sourceCode === 'NET_VPC' && (targetCode === 'NET_IGW' || targetCode === 'NET_NAT_GATEWAY')) ||
    ((sourceCode === 'NET_IGW' || sourceCode === 'NET_NAT_GATEWAY') && targetCode === 'NET_VPC')
  ) {
    return 'ATTACHED_VPC';
  }

  // Conexión Security Group
  if (sourceCode === 'NET_SECURITY_GROUP' || targetCode === 'NET_SECURITY_GROUP') {
    return 'ATTACHED_SECURITY_GROUP';
  }

  // Conexión Route Table
  if (sourceCode === 'NET_ROUTE_TABLE' || targetCode === 'NET_ROUTE_TABLE') {
    return 'NETWORK_ROUTE';
  }

  // Conexión Gateway (NAT Gateway, IGW a otros)
  if (targetCode === 'NET_IGW' || targetCode === 'NET_NAT_GATEWAY' || sourceCode === 'NET_IGW' || sourceCode === 'NET_NAT_GATEWAY') {
    return 'NETWORK_ROUTE';
  }

  if (targetCategory === 'database' || targetCode === 'AWS_RDS' || targetCode === 'AWS_DYNAMODB' || targetCode === 'AWS_ELASTICACHE') {
    return 'DATABASE';
  }

  if (sourceCode === 'AWS_SQS' || targetCode === 'AWS_SQS' || sourceCode === 'AWS_SNS' || targetCode === 'AWS_SNS' || sourceCode === 'AWS_EVENTBRIDGE' || targetCode === 'AWS_EVENTBRIDGE') {
    return 'ASYNC_QUEUE';
  }

  if (targetCategory === 'storage' || targetCode === 'AWS_S3') {
    return 'STORAGE';
  }

  if (targetCode === 'NET_VPC' || targetCode === 'NET_SUBNET') {
    return 'INTERNAL_VPC';
  }

  return 'HTTP_HTTPS';
}

/**
 * Calcula la posición absoluta en el canvas sumando las coordenadas relativas de toda la jerarquía de ancestros.
 */
export function getAbsolutePosition(nodes: AwsCanvasNode[], node: AwsCanvasNode): XYPosition {
  let x = node.position.x;
  let y = node.position.y;
  let currentParentId = node.parentId;

  while (currentParentId) {
    const parentNode = nodes.find((n) => n.id === currentParentId);
    if (!parentNode) break;
    x += parentNode.position.x;
    y += parentNode.position.y;
    currentParentId = parentNode.parentId;
  }

  return { x, y };
}

/**
 * Determina si una posición absoluta colisiona con el área delimitada de un nodo contenedor.
 */
function findContainerAtPosition(
  nodes: AwsCanvasNode[],
  pos: XYPosition,
  containerType: 'vpcContainerNode' | 'subnetContainerNode'
): AwsCanvasNode | undefined {
  const defaultWidths: Record<string, number> = {
    vpcContainerNode: 620,
    subnetContainerNode: 280
  };
  const defaultHeights: Record<string, number> = {
    vpcContainerNode: 420,
    subnetContainerNode: 280
  };

  const matchingContainers = nodes.filter((n) => n.type === containerType);

  for (const n of matchingContainers) {
    const absPos = getAbsolutePosition(nodes, n);
    const w = (n.measured?.width ?? (n.style?.width as number) ?? (n.width as number)) || defaultWidths[containerType] || 300;
    const h = (n.measured?.height ?? (n.style?.height as number) ?? (n.height as number)) || defaultHeights[containerType] || 280;

    if (
      pos.x >= absPos.x &&
      pos.x <= absPos.x + w &&
      pos.y >= absPos.y &&
      pos.y <= absPos.y + h
    ) {
      return n;
    }
  }

  return undefined;
}

/**
 * Colecta recursivamente todos los IDs de nodos hijos contenidos dentro de un nodo padre.
 */
function collectDescendantNodeIds(nodes: AwsCanvasNode[], parentId: string): Set<string> {
  const result = new Set<string>();
  const queue = [parentId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const node of nodes) {
      if (node.parentId === currentId && !result.has(node.id)) {
        result.add(node.id);
        queue.push(node.id);
      }
    }
  }

  return result;
}

export const useCanvasStore = create<CanvasStore>()((set, get) => ({
  // ─── Estado Base ─────────────────────────────────────────────────────────────
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isDirty: false,
  initialSemanticGraph: null,
  allowedServices: [],

  // ─── Event Handlers de React Flow ──────────────────────────────────────────
  onNodesChange: (changes: NodeChange<AwsCanvasNode>[]) => {
    const updatedNodes = applyNodeChanges(changes, get().nodes);
    const hasModifications = changes.some(
      (c) => c.type === 'position' || c.type === 'remove' || c.type === 'dimensions'
    );
    set({
      nodes: updatedNodes,
      isDirty: hasModifications ? true : get().isDirty
    });
  },

  onEdgesChange: (changes: EdgeChange<AwsCanvasEdge>[]) => {
    const updatedEdges = applyEdgeChanges(changes, get().edges);
    const hasModifications = changes.some((c) => c.type === 'remove');
    set({
      edges: updatedEdges,
      isDirty: hasModifications ? true : get().isDirty
    });
  },

  onConnect: (
    connection: Connection | { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }
  ): boolean => {
    const { source, target } = connection;

    if (!source || !target || source === target) {
      return false;
    }

    const alreadyConnected = get().edges.some(
      (e) => e.source === source && e.target === target
    );
    if (alreadyConnected) {
      return false;
    }

    const sourceNode = get().nodes.find((n) => n.id === source);
    const targetNode = get().nodes.find((n) => n.id === target);
    const connectionType = inferConnectionType(sourceNode, targetNode);

    const newEdge: AwsCanvasEdge = {
      id: `edge_${source}_to_${target}_${Date.now()}`,
      type: 'customConnectionEdge',
      source,
      target,
      sourceHandle: connection.sourceHandle ?? 'source-bottom',
      targetHandle: connection.targetHandle ?? 'target-top',
      animated: true,
      data: {
        connectionType,
        visualStatus: 'default'
      }
    };

    set({
      edges: addEdge(newEdge, get().edges) as AwsCanvasEdge[],
      isDirty: true
    });

    return true;
  },

  // ─── Gestión de Nodos ───────────────────────────────────────────────────────
  addNode: (service: ServicePaletteItem, position: XYPosition): boolean => {
    if (!get().canAddService(service.code)) {
      return false;
    }

    const sanitizedCode = service.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newNodeId = `node_${sanitizedCode}_${Date.now()}_${randomSuffix}`;
    const nodeType = resolveNodeType(service.code);

    let parentId: string | undefined = undefined;
    let nodePosition = { ...position };
    let extent: 'parent' | undefined = undefined;

    // Hit Testing para anidación automática según PlacementScope y Tipo de Nodo
    if (service.code.toUpperCase() === 'NET_SUBNET') {
      const vpcContainer = findContainerAtPosition(get().nodes, position, 'vpcContainerNode');
      if (vpcContainer) {
        const vpcAbsPos = getAbsolutePosition(get().nodes, vpcContainer);
        parentId = vpcContainer.id;
        extent = 'parent';
        nodePosition = {
          x: Math.max(20, position.x - vpcAbsPos.x),
          y: Math.max(50, position.y - vpcAbsPos.y)
        };
      }
    } else if (nodeType === 'awsServiceNode' || nodeType === 'gatewayNode' || nodeType === 'securityGroupNode') {
      // Prioridad 1: Si cae dentro de una Subred
      const subnetContainer = findContainerAtPosition(get().nodes, position, 'subnetContainerNode');
      if (subnetContainer) {
        const subnetAbsPos = getAbsolutePosition(get().nodes, subnetContainer);
        parentId = subnetContainer.id;
        extent = 'parent';
        nodePosition = {
          x: Math.max(15, position.x - subnetAbsPos.x),
          y: Math.max(45, position.y - subnetAbsPos.y)
        };
      } else {
        // Prioridad 2: Si cae directamente dentro de una VPC
        const vpcContainer = findContainerAtPosition(get().nodes, position, 'vpcContainerNode');
        if (vpcContainer) {
          const vpcAbsPos = getAbsolutePosition(get().nodes, vpcContainer);
          parentId = vpcContainer.id;
          extent = 'parent';
          nodePosition = {
            x: Math.max(20, position.x - vpcAbsPos.x),
            y: Math.max(50, position.y - vpcAbsPos.y)
          };
        }
      }
    }

    const defaultTechnicalConfig: ComponentConfig = {
      instanceCount: 1,
      isMultiAz: false,
      autoScaling: false,
      isPublic: false,
      subnetTier: service.code.toUpperCase() === 'NET_SUBNET' ? ('Public' as SubnetTier) : undefined,
      cidrBlock:
        service.code.toUpperCase() === 'NET_VPC'
          ? '10.0.0.0/16'
          : service.code.toUpperCase() === 'NET_SUBNET'
          ? '10.0.1.0/24'
          : undefined,
      ...(service.defaultConfig ?? {})
    };

    const newNode: AwsCanvasNode = {
      id: newNodeId,
      type: nodeType,
      position: nodePosition,
      parentId,
      extent,
      data: {
        serviceCode: service.code,
        name: service.name,
        category: service.category,
        iconUrl: service.iconUrl || '/icons/aws/default.svg',
        config: defaultTechnicalConfig,
        parentId: parentId ?? null,
        kind: service.kind,
        placementScope: service.placementScope,
        maxInstances: service.maxInstances,
        isDistractor: service.isDistractor ?? false,
        visualStatus: 'default',
        statusMessage: null
      }
    };

    set({
      nodes: [...get().nodes, newNode],
      isDirty: true
    });

    return true;
  },

  removeNode: (nodeId: string) => {
    // Cascada: colectar hijos y descendientes para borrado limpio
    const descendantIds = collectDescendantNodeIds(get().nodes, nodeId);
    const allDeletedIds = new Set<string>([nodeId, ...descendantIds]);

    const remainingNodes = get().nodes.filter((n) => !allDeletedIds.has(n.id));
    const remainingEdges = get().edges.filter(
      (e) => !allDeletedIds.has(e.source) && !allDeletedIds.has(e.target)
    );

    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      selectedNodeId: allDeletedIds.has(get().selectedNodeId || '') ? null : get().selectedNodeId,
      isDirty: true
    });
  },

  updateNodePosition: (nodeId: string, position: XYPosition) => {
    set({
      nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
      isDirty: true
    });
  },

  updateNodeConfig: (nodeId: string, configPartial: Partial<ComponentConfig>) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                config: {
                  ...n.data.config,
                  ...configPartial
                }
              }
            }
          : n
      ),
      isDirty: true
    });
  },

  updateNodeData: (nodeId: string, dataPartial: Partial<AwsServiceNodeData>) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                ...dataPartial
              }
            }
          : n
      ),
      isDirty: true
    });
  },

  reparentNode: (nodeId: string) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node || node.type === 'vpcContainerNode') return;

    const currentAbsPos = getAbsolutePosition(get().nodes, node);
    const otherNodes = get().nodes.filter((n) => n.id !== nodeId);

    if (node.type === 'subnetContainerNode') {
      const vpc = findContainerAtPosition(otherNodes, currentAbsPos, 'vpcContainerNode');
      if (vpc) {
        const vpcAbsPos = getAbsolutePosition(otherNodes, vpc);
        const relPos = {
          x: Math.max(20, currentAbsPos.x - vpcAbsPos.x),
          y: Math.max(50, currentAbsPos.y - vpcAbsPos.y)
        };
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, parentId: vpc.id, extent: 'parent', position: relPos, data: { ...n.data, parentId: vpc.id } }
              : n
          ),
          isDirty: true
        });
      } else if (node.parentId) {
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, parentId: undefined, extent: undefined, position: currentAbsPos, data: { ...n.data, parentId: null } }
              : n
          ),
          isDirty: true
        });
      }
    } else {
      const subnet = findContainerAtPosition(otherNodes, currentAbsPos, 'subnetContainerNode');
      if (subnet) {
        const subnetAbsPos = getAbsolutePosition(otherNodes, subnet);
        const relPos = {
          x: Math.max(15, currentAbsPos.x - subnetAbsPos.x),
          y: Math.max(45, currentAbsPos.y - subnetAbsPos.y)
        };
        set({
          nodes: get().nodes.map((n) =>
            n.id === nodeId
              ? { ...n, parentId: subnet.id, extent: 'parent', position: relPos, data: { ...n.data, parentId: subnet.id } }
              : n
          ),
          isDirty: true
        });
      } else {
        const vpc = findContainerAtPosition(otherNodes, currentAbsPos, 'vpcContainerNode');
        if (vpc) {
          const vpcAbsPos = getAbsolutePosition(otherNodes, vpc);
          const relPos = {
            x: Math.max(20, currentAbsPos.x - vpcAbsPos.x),
            y: Math.max(50, currentAbsPos.y - vpcAbsPos.y)
          };
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? { ...n, parentId: vpc.id, extent: 'parent', position: relPos, data: { ...n.data, parentId: vpc.id } }
                : n
            ),
            isDirty: true
          });
        } else if (node.parentId) {
          set({
            nodes: get().nodes.map((n) =>
              n.id === nodeId
                ? { ...n, parentId: undefined, extent: undefined, position: currentAbsPos, data: { ...n.data, parentId: null } }
                : n
            ),
            isDirty: true
          });
        }
      }
    }
  },

  selectNode: (nodeId: string | null) => {
    set({
      selectedNodeId: nodeId,
      selectedEdgeId: null
    });
  },

  // ─── Gestión de Aristas ─────────────────────────────────────────────────────
  removeEdge: (edgeId: string) => {
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: get().selectedEdgeId === edgeId ? null : get().selectedEdgeId,
      isDirty: true
    });
  },

  updateEdgeConnectionType: (edgeId: string, connectionType: ConnectionType) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              data: {
                ...e.data,
                connectionType,
                visualStatus: e.data?.visualStatus ?? 'default'
              }
            }
          : e
      ),
      isDirty: true
    });
  },

  selectEdge: (edgeId: string | null) => {
    set({
      selectedEdgeId: edgeId,
      selectedNodeId: null
    });
  },

  // ─── Ciclo de Vida, Carga y Serialización ────────────────────────────────────
  setAllowedServices: (services: ServicePaletteItem[]) => {
    set({ allowedServices: services });
  },

  loadSemanticGraph: (
    graph: SemanticGraphDto | null,
    allowedServices?: ServicePaletteItem[]
  ) => {
    const services = allowedServices ?? get().allowedServices;
    const initialGraphCopy = graph
      ? {
          components: graph.components.map((c) => ({
            ...c,
            config: { ...c.config }
          })),
          connections: graph.connections.map((cn) => ({ ...cn }))
        }
      : null;

    if (!graph || graph.components.length === 0) {
      set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        isDirty: false,
        initialSemanticGraph: initialGraphCopy,
        allowedServices: services
      });
      return;
    }

    // Ordenamiento Topológico: VPC primero, luego Subredes, luego componentes hijos
    const sortedComponents = [...graph.components].sort((a, b) => {
      const isVpcA = a.serviceCode.toUpperCase() === 'NET_VPC';
      const isVpcB = b.serviceCode.toUpperCase() === 'NET_VPC';
      if (isVpcA && !isVpcB) return -1;
      if (!isVpcA && isVpcB) return 1;

      const isSubA = a.serviceCode.toUpperCase() === 'NET_SUBNET';
      const isSubB = b.serviceCode.toUpperCase() === 'NET_SUBNET';
      if (isSubA && !isSubB) return -1;
      if (!isSubA && isSubB) return 1;

      return 0;
    });

    let vpcCount = 0;
    let subnetCount = 0;
    let generalCount = 0;
    const layerItemCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

    const reconstructedNodes: AwsCanvasNode[] = sortedComponents.map((component) => {
      const serviceMeta = services.find(
        (s) => s.code.toUpperCase() === component.serviceCode.toUpperCase()
      );
      const category = component.category || serviceMeta?.category || 'General';
      const nodeType = resolveNodeType(component.serviceCode);

      let x = 80;
      let y = 60;

      if (nodeType === 'vpcContainerNode') {
        x = 50 + vpcCount * 650;
        y = 50;
        vpcCount++;
      } else if (nodeType === 'subnetContainerNode') {
        x = 40 + (subnetCount % 2) * 290;
        y = 60;
        subnetCount++;
      } else if (component.parentId) {
        x = 30 + (generalCount % 2) * 190;
        y = 40 + Math.floor(generalCount / 2) * 120;
        generalCount++;
      } else {
        const layer = LAYER_MAP[category] ?? 1;
        const count = layerItemCounts[layer] ?? 0;
        layerItemCounts[layer] = count + 1;
        x = 120 + (count % 4) * 220;
        y = 60 + layer * 160;
      }

      return {
        id: component.id,
        type: nodeType,
        position: { x, y },
        parentId: component.parentId || undefined,
        extent: component.parentId ? 'parent' : undefined,
        data: {
          serviceCode: component.serviceCode,
          name: serviceMeta?.name || component.label || component.serviceCode,
          category,
          iconUrl: serviceMeta?.iconUrl || '/icons/aws/default.svg',
          config: { ...component.config },
          parentId: component.parentId || null,
          kind: component.kind || serviceMeta?.kind,
          placementScope: serviceMeta?.placementScope,
          maxInstances: serviceMeta?.maxInstances,
          isDistractor: serviceMeta?.isDistractor ?? false,
          visualStatus: 'default',
          statusMessage: null
        }
      };
    });

    const reconstructedEdges: AwsCanvasEdge[] = graph.connections.map((conn, idx) => ({
      id: `edge_${conn.fromComponentId}_to_${conn.toComponentId}_${idx}`,
      type: 'customConnectionEdge',
      source: conn.fromComponentId,
      target: conn.toComponentId,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top',
      animated: true,
      data: {
        connectionType: (conn.connectionType as ConnectionType) || 'HTTP_HTTPS',
        visualStatus: 'default'
      }
    }));

    set({
      nodes: reconstructedNodes,
      edges: reconstructedEdges,
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false,
      initialSemanticGraph: initialGraphCopy,
      allowedServices: services
    });
  },

  toSemanticGraph: (): SemanticGraphDto => {
    const components = get().nodes.map((node) => ({
      id: node.id,
      serviceCode: node.data.serviceCode,
      label: node.data.name,
      parentId: node.parentId || node.data.parentId || null,
      kind: node.data.kind,
      category: node.data.category,
      config: { ...node.data.config }
    }));

    const connections = get().edges.map((edge) => ({
      fromComponentId: edge.source,
      toComponentId: edge.target,
      connectionType: edge.data?.connectionType || 'HTTP_HTTPS'
    }));

    return { components, connections };
  },

  resetCanvas: () => {
    const { initialSemanticGraph, allowedServices } = get();
    if (initialSemanticGraph && initialSemanticGraph.components.length > 0) {
      get().loadSemanticGraph(initialSemanticGraph, allowedServices);
    } else {
      get().clearCanvas();
      set({ isDirty: false });
    }
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: true
    });
  },

  // ─── Feedback Visual (Fase 6 Preparación) ───────────────────────────────────
  setNodeVisualStatus: (nodeId: string, status: NodeVisualStatus, message?: string | null) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                visualStatus: status,
                statusMessage: message ?? null
              }
            }
          : n
      )
    });
  },

  setEdgeVisualStatus: (edgeId: string, status: 'default' | 'pass' | 'error' | 'warning') => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              data: {
                ...e.data,
                connectionType: e.data?.connectionType ?? 'HTTP_HTTPS',
                visualStatus: status
              }
            }
          : e
      )
    });
  },

  resetVisualStatuses: () => {
    set({
      nodes: get().nodes.map((n) => ({
        ...n,
        data: { ...n.data, visualStatus: 'default', statusMessage: null }
      })),
      edges: get().edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          connectionType: e.data?.connectionType ?? 'HTTP_HTTPS',
          visualStatus: 'default'
        }
      }))
    });
  },

  // ─── Selectores Computados (Getters) ────────────────────────────────────────
  getNodeCountByService: (serviceCode: string): number => {
    return get().nodes.filter(
      (n) => n.data.serviceCode.toUpperCase() === serviceCode.toUpperCase()
    ).length;
  },

  canAddService: (serviceCode: string): boolean => {
    const service = get().allowedServices.find(
      (s) => s.code.toUpperCase() === serviceCode.toUpperCase()
    );

    if (!service) {
      return true;
    }

    if (service.maxInstances !== undefined && service.maxInstances !== null && service.maxInstances > 0) {
      const currentCount = get().getNodeCountByService(serviceCode);
      return currentCount < service.maxInstances;
    }

    return true;
  },

  getSelectedNode: (): AwsCanvasNode | undefined => {
    const { selectedNodeId, nodes } = get();
    return selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : undefined;
  },

  getSelectedEdge: (): AwsCanvasEdge | undefined => {
    const { selectedEdgeId, edges } = get();
    return selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : undefined;
  },

  hasComponents: (): boolean => {
    return get().nodes.length > 0;
  }
}));
