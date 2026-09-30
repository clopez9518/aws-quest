import { Node, Edge, Connection, NodeChange, EdgeChange, XYPosition } from '@xyflow/react';

/**
 * Capas de subred para aislamiento de tráfico.
 * Alineado con SubnetTier.cs en backend.
 */
export type SubnetTier = 'Public' | 'Private' | 'Isolated';

/**
 * Tipo o naturaleza del recurso AWS.
 * Alineado con ResourceKind.cs en backend.
 */
export type ResourceKind = 'ManagedService' | 'NetworkInfrastructure' | 'SecurityPolicy';

/**
 * Ámbito de contención o ubicación requerido.
 * Alineado con PlacementScope.cs en backend.
 */
export type PlacementScope =
  | 'RegionalGlobal'
  | 'SubnetRequired'
  | 'VpcOptional'
  | 'VpcRoot'
  | 'VpcAttached';

/**
 * Entrada individual en una tabla de ruteo de red.
 */
export interface RouteEntryDto {
  destinationCidr: string;
  targetId: string;
  description?: string | null;
}

/**
 * Regla individual de grupo de seguridad (firewall).
 */
export interface SecurityGroupRuleDto {
  direction: 'Ingress' | 'Egress';
  protocol: string;
  fromPort?: number | null;
  toPort?: number | null;
  source: string;
  description?: string | null;
}

/**
 * Tipos de conexiones semánticas permitidas en la arquitectura AWS.
 * Alineado con ConnectionType.cs en backend.
 */
export type ConnectionType =
  | 'HTTP_HTTPS'
  | 'DATABASE'
  | 'ASYNC_QUEUE'
  | 'INTERNAL_VPC'
  | 'STORAGE'
  | 'SECURITY_GROUP'
  | 'NETWORK_ROUTE'
  | 'ATTACHED_SECURITY_GROUP'
  | 'ATTACHED_VPC';

/**
 * Configuración técnica detallada de un componente AWS.
 * Alineado con ComponentConfig.cs en backend.
 */
export interface ComponentConfig {
  isMultiAz?: boolean | null;
  autoScaling?: boolean | null;
  instanceCount?: number | null;
  isPublic?: boolean | null;
  subnetType?: string | null;
  storageClass?: string | null;

  // Nuevas propiedades de Infraestructura y Redes
  subnetTier?: SubnetTier | null;
  tier?: SubnetTier | string | null;
  cidrBlock?: string | null;
  cidr?: string | null;
  routeTableId?: string | null;
  attachedVpcId?: string | null;
  securityGroupIds?: string[];
  routes?: RouteEntryDto[];
  securityGroupRules?: SecurityGroupRuleDto[];
  customProperties?: Record<string, unknown>;
}

/**
 * Estado de validación o feedback visual de un nodo en el canvas.
 */
export type NodeVisualStatus = 'default' | 'selected' | 'pass' | 'error' | 'warning';

/**
 * Metadata del servicio AWS contenida en el payload `data` del nodo de React Flow.
 */
export interface AwsServiceNodeData {
  serviceCode: string;
  name: string;
  category: string;
  iconUrl: string;
  config: ComponentConfig;
  parentId?: string | null;
  kind?: ResourceKind;
  placementScope?: PlacementScope;
  subnetTier?: SubnetTier;
  maxInstances?: number | null;
  isDistractor?: boolean;
  visualStatus?: NodeVisualStatus;
  statusMessage?: string | null;
  [key: string]: unknown; // Compatibilidad con Record<string, unknown> de React Flow
}

/**
 * Metadata contenida en el payload `data` de la arista de React Flow.
 */
export interface AwsEdgeData {
  connectionType: ConnectionType;
  label?: string;
  visualStatus?: 'default' | 'pass' | 'error' | 'warning';
  [key: string]: unknown;
}

/**
 * Tipos de nodo registrados en React Flow.
 */
export type AwsCanvasNodeType =
  | 'awsServiceNode'
  | 'vpcContainerNode'
  | 'subnetContainerNode'
  | 'gatewayNode'
  | 'securityGroupNode';

/**
 * Nodo tipado de React Flow para servicios y contenedores AWS.
 */
export type AwsCanvasNode = Node<AwsServiceNodeData, AwsCanvasNodeType>;

/**
 * Arista tipada de React Flow para conexiones arquitectónicas.
 */
export type AwsCanvasEdge = Edge<AwsEdgeData, 'customConnectionEdge'>;

/**
 * DTO de componente en el grafo semántico de backend.
 * Alineado con GraphComponent.cs.
 */
export interface GraphComponentDto {
  id: string;
  serviceCode: string;
  label?: string | null;
  parentId?: string | null;
  containerId?: string | null;
  kind?: ResourceKind;
  category?: string;
  config: ComponentConfig;
}

/**
 * DTO de conexión en el grafo semántico de backend.
 * Alineado con GraphConnection.cs.
 */
export interface GraphConnectionDto {
  fromComponentId: string;
  toComponentId: string;
  connectionType: ConnectionType | string;
}

/**
 * Grafo semántico agnóstico de coordenadas visuales.
 * Alineado con SemanticGraph.cs y consumido por EvaluateArchitectureRequestDto.
 */
export interface SemanticGraphDto {
  components: GraphComponentDto[];
  connections: GraphConnectionDto[];
}

/**
 * Metadata requerida para instanciar un nodo desde la paleta de servicios.
 */
export interface ServicePaletteItem {
  code: string;
  name: string;
  category: string;
  iconUrl: string;
  kind?: ResourceKind;
  placementScope?: PlacementScope;
  maxInstances?: number | null;
  isDistractor?: boolean;
  defaultConfig?: Partial<ComponentConfig>;
}

export interface CanvasState {
  // Estado del Grafo React Flow
  nodes: AwsCanvasNode[];
  edges: AwsCanvasEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Estado de Control y Auditoría
  isDirty: boolean;
  initialSemanticGraph: SemanticGraphDto | null;
  allowedServices: ServicePaletteItem[];
}

export interface CanvasActions {
  // Manejadores estándar de eventos de React Flow
  onNodesChange: (changes: NodeChange<AwsCanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<AwsCanvasEdge>[]) => void;
  onConnect: (connection: Connection | { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => boolean;

  // Acciones de Gestión de Nodos
  addNode: (service: ServicePaletteItem, position: XYPosition) => boolean;
  removeNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: XYPosition) => void;
  updateNodeConfig: (nodeId: string, config: Partial<ComponentConfig>) => void;
  updateNodeData: (nodeId: string, dataPartial: Partial<AwsServiceNodeData>) => void;
  reparentNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;

  // Acciones de Gestión de Aristas
  removeEdge: (edgeId: string) => void;
  updateEdgeConnectionType: (edgeId: string, connectionType: ConnectionType) => void;
  selectEdge: (edgeId: string | null) => void;

  // Acciones de Ciclo de Vida y Serialización
  setAllowedServices: (services: ServicePaletteItem[]) => void;
  loadSemanticGraph: (graph: SemanticGraphDto | null, allowedServices?: ServicePaletteItem[]) => void;
  toSemanticGraph: () => SemanticGraphDto;
  resetCanvas: () => void;
  clearCanvas: () => void;

  // Acciones de Feedback Visual (Fase 6)
  setNodeVisualStatus: (nodeId: string, status: NodeVisualStatus, message?: string | null) => void;
  setEdgeVisualStatus: (edgeId: string, status: 'default' | 'pass' | 'error' | 'warning') => void;
  resetVisualStatuses: () => void;

  // Consultas y Selectores de Dominio (Getters)
  getNodeCountByService: (serviceCode: string) => number;
  canAddService: (serviceCode: string) => boolean;
  getSelectedNode: () => AwsCanvasNode | undefined;
  getSelectedEdge: () => AwsCanvasEdge | undefined;
  hasComponents: () => boolean;
}

export type CanvasStore = CanvasState & CanvasActions;
