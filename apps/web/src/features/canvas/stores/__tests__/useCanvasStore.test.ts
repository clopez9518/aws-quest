import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../useCanvasStore';
import { ServicePaletteItem, SemanticGraphDto } from '../../types/canvas.types';

describe('useCanvasStore', () => {
  const ec2Service: ServicePaletteItem = {
    code: 'AWS_EC2',
    name: 'Amazon EC2',
    category: 'Compute',
    iconUrl: '/icons/aws/ec2.svg',
    maxInstances: 2,
    isDistractor: false
  };

  const albService: ServicePaletteItem = {
    code: 'AWS_ALB',
    name: 'Application Load Balancer',
    category: 'Networking',
    iconUrl: '/icons/aws/alb.svg',
    maxInstances: 1,
    isDistractor: false
  };

  const rdsService: ServicePaletteItem = {
    code: 'AWS_RDS',
    name: 'Amazon RDS Multi-AZ',
    category: 'Database',
    iconUrl: '/icons/aws/rds.svg',
    maxInstances: 1,
    isDistractor: false
  };

  const s3Service: ServicePaletteItem = {
    code: 'AWS_S3',
    name: 'Amazon S3',
    category: 'Storage',
    iconUrl: '/icons/aws/s3.svg',
    maxInstances: null,
    isDistractor: true
  };

  const sqsService: ServicePaletteItem = {
    code: 'AWS_SQS',
    name: 'Amazon SQS',
    category: 'Application Integration',
    iconUrl: '/icons/aws/sqs.svg',
    maxInstances: 5
  };

  beforeEach(() => {
    // Resetear el store antes de cada prueba
    useCanvasStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      isDirty: false,
      initialSemanticGraph: null,
      allowedServices: [ec2Service, albService, rdsService, s3Service, sqsService]
    });
  });

  // ─── 1. Estado Inicial ───────────────────────────────────────────────────────
  it('debe inicializarse con colecciones vacías, sin selección y sin modificaciones', () => {
    const state = useCanvasStore.getState();

    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.selectedNodeId).toBeNull();
    expect(state.selectedEdgeId).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.hasComponents()).toBe(false);
    expect(state.getSelectedNode()).toBeUndefined();
    expect(state.getSelectedEdge()).toBeUndefined();
  });

  // ─── 2. Adición y Configuración de Nodos ─────────────────────────────────────
  it('debe agregar un nodo correctamente con coordenadas y configuración por defecto', () => {
    const success = useCanvasStore.getState().addNode(ec2Service, { x: 100, y: 150 });
    const state = useCanvasStore.getState();

    expect(success).toBe(true);
    expect(state.nodes.length).toBe(1);
    expect(state.isDirty).toBe(true);
    expect(state.hasComponents()).toBe(true);

    const addedNode = state.nodes[0];
    expect(addedNode.type).toBe('awsServiceNode');
    expect(addedNode.position).toEqual({ x: 100, y: 150 });
    expect(addedNode.data.serviceCode).toBe('AWS_EC2');
    expect(addedNode.data.name).toBe('Amazon EC2');
    expect(addedNode.data.category).toBe('Compute');
    expect(addedNode.data.iconUrl).toBe('/icons/aws/ec2.svg');
    expect(addedNode.data.maxInstances).toBe(2);
    expect(addedNode.data.isDistractor).toBe(false);
    expect(addedNode.data.visualStatus).toBe('default');
    expect(addedNode.data.config).toEqual({
      instanceCount: 1,
      isMultiAz: false,
      autoScaling: false,
      isPublic: false
    });
  });

  it('debe respetar el límite máximo de instancias (RN-04) y rechazar nodos adicionales', () => {
    // albService tiene maxInstances: 1
    const firstAdd = useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    expect(firstAdd).toBe(true);
    expect(useCanvasStore.getState().getNodeCountByService('AWS_ALB')).toBe(1);
    expect(useCanvasStore.getState().canAddService('AWS_ALB')).toBe(false);

    // Intentar agregar una segunda instancia debe fallar
    const secondAdd = useCanvasStore.getState().addNode(albService, { x: 200, y: 50 });
    expect(secondAdd).toBe(false);
    expect(useCanvasStore.getState().nodes.length).toBe(1);
  });

  it('debe permitir agregar instancias ilimitadas si maxInstances es nulo o indefinido', () => {
    // s3Service tiene maxInstances: null
    for (let i = 0; i < 5; i++) {
      const added = useCanvasStore.getState().addNode(s3Service, { x: i * 50, y: 100 });
      expect(added).toBe(true);
    }
    expect(useCanvasStore.getState().getNodeCountByService('AWS_S3')).toBe(5);
    expect(useCanvasStore.getState().canAddService('AWS_S3')).toBe(true);
  });

  it('debe actualizar la configuración técnica de un nodo específico (updateNodeConfig)', () => {
    useCanvasStore.getState().addNode(rdsService, { x: 100, y: 300 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodeConfig(nodeId, {
      isMultiAz: true,
      subnetType: 'isolated'
    });

    const updatedNode = useCanvasStore.getState().nodes[0];
    expect(updatedNode.data.config.isMultiAz).toBe(true);
    expect(updatedNode.data.config.subnetType).toBe('isolated');
    // Verifica que las demás propiedades se mantengan intactas
    expect(updatedNode.data.config.instanceCount).toBe(1);
  });

  it('debe actualizar la posición de un nodo (updateNodePosition)', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 10, y: 20 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodePosition(nodeId, { x: 300, y: 400 });
    expect(useCanvasStore.getState().nodes[0].position).toEqual({ x: 300, y: 400 });
  });

  it('debe actualizar metadata adicional de un nodo (updateNodeData)', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 10, y: 20 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodeData(nodeId, { name: 'Servidor Web Principal' });
    expect(useCanvasStore.getState().nodes[0].data.name).toBe('Servidor Web Principal');
  });

  it('debe gestionar la selección de un nodo (selectNode)', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 10, y: 20 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().selectNode(nodeId);
    expect(useCanvasStore.getState().selectedNodeId).toBe(nodeId);
    expect(useCanvasStore.getState().getSelectedNode()?.id).toBe(nodeId);

    // Deseleccionar nodo
    useCanvasStore.getState().selectNode(null);
    expect(useCanvasStore.getState().selectedNodeId).toBeNull();
    expect(useCanvasStore.getState().getSelectedNode()).toBeUndefined();
  });

  // ─── 3. Eliminación de Nodos y Cascada de Aristas ────────────────────────────
  it('debe eliminar un nodo por ID y remover en cascada todas sus conexiones asociadas (RN-09)', () => {
    useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    useCanvasStore.getState().addNode(ec2Service, { x: 50, y: 200 });
    useCanvasStore.getState().addNode(rdsService, { x: 50, y: 350 });

    const [albNode, ec2Node, rdsNode] = useCanvasStore.getState().nodes;

    // Conectar ALB -> EC2 y EC2 -> RDS
    useCanvasStore.getState().onConnect({
      source: albNode.id,
      target: ec2Node.id,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top'
    });

    useCanvasStore.getState().onConnect({
      source: ec2Node.id,
      target: rdsNode.id,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top'
    });

    expect(useCanvasStore.getState().edges.length).toBe(2);

    // Eliminar el nodo intermedio (EC2)
    useCanvasStore.getState().removeNode(ec2Node.id);

    const state = useCanvasStore.getState();
    expect(state.nodes.length).toBe(2);
    expect(state.nodes.find(n => n.id === ec2Node.id)).toBeUndefined();
    // Ambas conexiones que tocaban a EC2 debieron ser eliminadas
    expect(state.edges.length).toBe(0);
  });

  it('debe deseleccionar el nodo si el nodo eliminado estaba seleccionado', () => {
    useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().selectNode(nodeId);
    expect(useCanvasStore.getState().selectedNodeId).toBe(nodeId);

    useCanvasStore.getState().removeNode(nodeId);
    expect(useCanvasStore.getState().selectedNodeId).toBeNull();
  });

  // ─── 4. Conexiones y Aristas ─────────────────────────────────────────────────
  it('debe registrar una nueva conexión dirigida animada entre dos nodos distintos', () => {
    useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    useCanvasStore.getState().addNode(ec2Service, { x: 50, y: 200 });

    const [alb, ec2] = useCanvasStore.getState().nodes;

    const connected = useCanvasStore.getState().onConnect({
      source: alb.id,
      target: ec2.id,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top'
    });

    expect(connected).toBe(true);
    const edges = useCanvasStore.getState().edges;
    expect(edges.length).toBe(1);

    const edge = edges[0];
    expect(edge.source).toBe(alb.id);
    expect(edge.target).toBe(ec2.id);
    expect(edge.animated).toBe(true);
    expect(edge.type).toBe('customConnectionEdge');
    expect(edge.data?.connectionType).toBe('HTTP_HTTPS');
  });

  it('debe rechazar auto-conexiones donde source === target (RN-05)', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 50, y: 50 });
    const ec2 = useCanvasStore.getState().nodes[0];

    const connected = useCanvasStore.getState().onConnect({
      source: ec2.id,
      target: ec2.id,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top'
    });

    expect(connected).toBe(false);
    expect(useCanvasStore.getState().edges.length).toBe(0);
  });

  it('debe rechazar conexiones duplicadas en la misma dirección', () => {
    useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    useCanvasStore.getState().addNode(ec2Service, { x: 50, y: 200 });
    const [alb, ec2] = useCanvasStore.getState().nodes;

    const conn = {
      source: alb.id,
      target: ec2.id,
      sourceHandle: 'source-bottom',
      targetHandle: 'target-top'
    };

    const first = useCanvasStore.getState().onConnect(conn);
    expect(first).toBe(true);

    const second = useCanvasStore.getState().onConnect(conn);
    expect(second).toBe(false);
    expect(useCanvasStore.getState().edges.length).toBe(1);
  });

  it('debe rechazar conexiones con extremos incompletos', () => {
    const invalidConn = {
      source: '',
      target: 'node_1',
      sourceHandle: null,
      targetHandle: null
    };

    const result = useCanvasStore.getState().onConnect(invalidConn);
    expect(result).toBe(false);
  });

  it('debe inferir el tipo de conexión semántico adecuado según el servicio destino', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(rdsService, { x: 0, y: 100 });
    useCanvasStore.getState().addNode(sqsService, { x: 0, y: 200 });
    useCanvasStore.getState().addNode(s3Service, { x: 0, y: 300 });

    const [ec2, rds, sqs, s3] = useCanvasStore.getState().nodes;

    // EC2 -> RDS (Database)
    useCanvasStore.getState().onConnect({ source: ec2.id, target: rds.id });
    // EC2 -> SQS (Async Queue)
    useCanvasStore.getState().onConnect({ source: ec2.id, target: sqs.id });
    // EC2 -> S3 (Storage)
    useCanvasStore.getState().onConnect({ source: ec2.id, target: s3.id });

    const edges = useCanvasStore.getState().edges;
    expect(edges.find(e => e.target === rds.id)?.data?.connectionType).toBe('DATABASE');
    expect(edges.find(e => e.target === sqs.id)?.data?.connectionType).toBe('ASYNC_QUEUE');
    expect(edges.find(e => e.target === s3.id)?.data?.connectionType).toBe('STORAGE');
  });

  it('debe inferir DATABASE al conectar EC2 con Auto Scaling hacia RDS y en sentido bidireccional (RDS -> EC2)', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(rdsService, { x: 0, y: 100 });

    const [ec2, rds] = useCanvasStore.getState().nodes;
    // Activar Auto Scaling en EC2
    useCanvasStore.getState().updateNodeConfig(ec2.id, { autoScaling: true, instanceCount: 3 });

    // EC2 (con Auto Scaling) -> RDS
    useCanvasStore.getState().onConnect({ source: ec2.id, target: rds.id });

    let edges = useCanvasStore.getState().edges;
    expect(edges[0]?.data?.connectionType).toBe('DATABASE');

    // Limpiar aristas y probar sentido inverso: RDS -> EC2
    useCanvasStore.setState({ edges: [] });
    useCanvasStore.getState().onConnect({ source: rds.id, target: ec2.id });

    edges = useCanvasStore.getState().edges;
    expect(edges[0]?.data?.connectionType).toBe('DATABASE');
  });

  it('debe permitir eliminar una arista individualmente (removeEdge)', () => {
    useCanvasStore.getState().addNode(albService, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 100 });
    const [alb, ec2] = useCanvasStore.getState().nodes;

    useCanvasStore.getState().onConnect({ source: alb.id, target: ec2.id });
    const edgeId = useCanvasStore.getState().edges[0].id;

    useCanvasStore.getState().selectEdge(edgeId);
    expect(useCanvasStore.getState().selectedEdgeId).toBe(edgeId);

    useCanvasStore.getState().removeEdge(edgeId);
    expect(useCanvasStore.getState().edges.length).toBe(0);
    expect(useCanvasStore.getState().selectedEdgeId).toBeNull();
  });

  it('debe actualizar el tipo de conexión de una arista (updateEdgeConnectionType)', () => {
    useCanvasStore.getState().addNode(albService, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 100 });
    const [alb, ec2] = useCanvasStore.getState().nodes;

    useCanvasStore.getState().onConnect({ source: alb.id, target: ec2.id });
    const edgeId = useCanvasStore.getState().edges[0].id;

    useCanvasStore.getState().updateEdgeConnectionType(edgeId, 'INTERNAL_VPC');
    expect(useCanvasStore.getState().edges[0].data?.connectionType).toBe('INTERNAL_VPC');
  });

  // ─── 5. React Flow Change Handlers ───────────────────────────────────────────
  it('debe procesar onNodesChange para actualización de posición y selección', () => {
    useCanvasStore.getState().addNode(albService, { x: 0, y: 0 });
    const node = useCanvasStore.getState().nodes[0];

    // Simula evento de arrastre de React Flow
    useCanvasStore.getState().onNodesChange([
      {
        type: 'position',
        id: node.id,
        position: { x: 150, y: 250 }
      }
    ]);

    expect(useCanvasStore.getState().nodes[0].position).toEqual({ x: 150, y: 250 });
    expect(useCanvasStore.getState().isDirty).toBe(true);
  });

  it('debe procesar onEdgesChange para eliminación de aristas', () => {
    useCanvasStore.getState().addNode(albService, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 100 });
    const [alb, ec2] = useCanvasStore.getState().nodes;

    useCanvasStore.getState().onConnect({ source: alb.id, target: ec2.id });
    const edge = useCanvasStore.getState().edges[0];

    useCanvasStore.getState().onEdgesChange([
      {
        type: 'remove',
        id: edge.id
      }
    ]);

    expect(useCanvasStore.getState().edges.length).toBe(0);
  });

  // ─── 6. Serialización y Deserialización (CU-02, CU-05) ────────────────────────
  it('debe serializar el estado visual actual hacia un SemanticGraphDto limpio sin coordenadas', () => {
    useCanvasStore.getState().addNode(albService, { x: 50, y: 50 });
    useCanvasStore.getState().addNode(ec2Service, { x: 100, y: 200 });
    const [alb, ec2] = useCanvasStore.getState().nodes;

    useCanvasStore.getState().updateNodeConfig(ec2.id, {
      autoScaling: true,
      instanceCount: 3
    });

    useCanvasStore.getState().onConnect({ source: alb.id, target: ec2.id });

    const semanticGraph = useCanvasStore.getState().toSemanticGraph();

    expect(semanticGraph.components.length).toBe(2);
    expect(semanticGraph.connections.length).toBe(1);

    const ec2Component = semanticGraph.components.find(c => c.id === ec2.id);
    expect(ec2Component).toBeDefined();
    expect(ec2Component?.serviceCode).toBe('AWS_EC2');
    expect(ec2Component?.config.autoScaling).toBe(true);
    expect(ec2Component?.config.instanceCount).toBe(3);
    // Verificar que no contenga propiedades visuales de coordenadas
    expect((ec2Component as any).position).toBeUndefined();

    const connection = semanticGraph.connections[0];
    expect(connection.fromComponentId).toBe(alb.id);
    expect(connection.toComponentId).toBe(ec2.id);
    expect(connection.connectionType).toBe('HTTP_HTTPS');
  });

  it('debe deserializar un SemanticGraphDto reconstruyendo nodos y aristas con layout automático', () => {
    const inputGraph: SemanticGraphDto = {
      components: [
        {
          id: 'comp_alb_1',
          serviceCode: 'AWS_ALB',
          label: 'Application Load Balancer',
          config: {}
        },
        {
          id: 'comp_ec2_1',
          serviceCode: 'AWS_EC2',
          label: 'Amazon EC2',
          config: { isMultiAz: true, instanceCount: 2 }
        },
        {
          id: 'comp_rds_1',
          serviceCode: 'AWS_RDS',
          label: 'Amazon RDS Multi-AZ',
          config: { isMultiAz: true }
        }
      ],
      connections: [
        {
          fromComponentId: 'comp_alb_1',
          toComponentId: 'comp_ec2_1',
          connectionType: 'HTTP_HTTPS'
        },
        {
          fromComponentId: 'comp_ec2_1',
          toComponentId: 'comp_rds_1',
          connectionType: 'DATABASE'
        }
      ]
    };

    useCanvasStore.getState().loadSemanticGraph(inputGraph);

    const state = useCanvasStore.getState();
    expect(state.nodes.length).toBe(3);
    expect(state.edges.length).toBe(2);
    expect(state.isDirty).toBe(false);

    // Validar posicionamiento por capas (ALB capa superior Y=60, EC2 capa media Y=220, RDS capa inferior Y=380)
    const albNode = state.nodes.find(n => n.id === 'comp_alb_1');
    const ec2Node = state.nodes.find(n => n.id === 'comp_ec2_1');
    const rdsNode = state.nodes.find(n => n.id === 'comp_rds_1');

    expect(albNode?.position.y).toBe(60);
    expect(ec2Node?.position.y).toBe(220);
    expect(rdsNode?.position.y).toBe(380);

    // Validar metadata enriquecida desde allowedServices
    expect(albNode?.data.name).toBe('Application Load Balancer');
    expect(ec2Node?.data.config.instanceCount).toBe(2);
    expect(rdsNode?.data.category).toBe('Database');

    // Validar aristas reconstruidas
    expect(state.edges[0].source).toBe('comp_alb_1');
    expect(state.edges[0].target).toBe('comp_ec2_1');
    expect(state.edges[0].data?.connectionType).toBe('HTTP_HTTPS');
    expect(state.edges[1].data?.connectionType).toBe('DATABASE');
  });

  // ─── 7. Reset y Limpieza (RN-11 / CU-06) ─────────────────────────────────────
  it('debe restaurar el canvas a su estado inicial al invocar resetCanvas()', () => {
    const initialGraph: SemanticGraphDto = {
      components: [
        { id: 'initial_1', serviceCode: 'AWS_EC2', config: { instanceCount: 1 } }
      ],
      connections: []
    };

    useCanvasStore.getState().loadSemanticGraph(initialGraph);
    expect(useCanvasStore.getState().nodes.length).toBe(1);

    // El usuario agrega otro nodo
    useCanvasStore.getState().addNode(rdsService, { x: 50, y: 50 });
    expect(useCanvasStore.getState().nodes.length).toBe(2);
    expect(useCanvasStore.getState().isDirty).toBe(true);

    // Resetear el canvas
    useCanvasStore.getState().resetCanvas();
    expect(useCanvasStore.getState().nodes.length).toBe(1);
    expect(useCanvasStore.getState().nodes[0].id).toBe('initial_1');
    expect(useCanvasStore.getState().isDirty).toBe(false);
  });

  it('debe vaciar completamente el canvas al invocar clearCanvas()', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 50, y: 50 });
    useCanvasStore.getState().clearCanvas();

    const state = useCanvasStore.getState();
    expect(state.nodes.length).toBe(0);
    expect(state.edges.length).toBe(0);
    expect(state.selectedNodeId).toBeNull();
    expect(state.isDirty).toBe(true);
  });

  // ─── 8. Feedback Visual (Fase 6 Preparación) ─────────────────────────────────
  it('debe actualizar y resetear estados visuales de nodos y aristas', () => {
    useCanvasStore.getState().addNode(ec2Service, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(rdsService, { x: 0, y: 100 });
    const [ec2, rds] = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: ec2.id, target: rds.id });
    const edge = useCanvasStore.getState().edges[0];

    // Asignar status visual
    useCanvasStore.getState().setNodeVisualStatus(ec2.id, 'error', 'SPOF detectado');
    useCanvasStore.getState().setEdgeVisualStatus(edge.id, 'error');

    expect(useCanvasStore.getState().nodes[0].data.visualStatus).toBe('error');
    expect(useCanvasStore.getState().nodes[0].data.statusMessage).toBe('SPOF detectado');
    expect(useCanvasStore.getState().edges[0].data?.visualStatus).toBe('error');

    // Resetear status visual
    useCanvasStore.getState().resetVisualStatuses();
    expect(useCanvasStore.getState().nodes[0].data.visualStatus).toBe('default');
    expect(useCanvasStore.getState().nodes[0].data.statusMessage).toBeNull();
    expect(useCanvasStore.getState().edges[0].data?.visualStatus).toBe('default');
  });

  // ─── 9. Contenedores de Red y Jerarquía (Fase 4) ─────────────────────────────
  it('debe instanciar NET_VPC como vpcContainerNode y NET_SUBNET como subnetContainerNode', () => {
    const vpcItem: ServicePaletteItem = {
      code: 'NET_VPC',
      name: 'Virtual Private Cloud',
      category: 'NetworkVpc',
      iconUrl: '/icons/aws/vpc.svg'
    };
    const subnetItem: ServicePaletteItem = {
      code: 'NET_SUBNET',
      name: 'Subnet',
      category: 'NetworkVpc',
      iconUrl: '/icons/aws/subnet.svg'
    };

    useCanvasStore.setState({ allowedServices: [vpcItem, subnetItem] });

    useCanvasStore.getState().addNode(vpcItem, { x: 50, y: 50 });
    const vpcNode = useCanvasStore.getState().nodes[0];
    expect(vpcNode.type).toBe('vpcContainerNode');
    expect(vpcNode.data.config.cidrBlock).toBe('10.0.0.0/16');

    // Soltar Subred dentro de la VPC (x=100, y=100 cae dentro de x:50..670, y:50..470)
    useCanvasStore.getState().addNode(subnetItem, { x: 100, y: 100 });
    const subnetNode = useCanvasStore.getState().nodes[1];
    expect(subnetNode.type).toBe('subnetContainerNode');
    expect(subnetNode.parentId).toBe(vpcNode.id);
    expect(subnetNode.extent).toBe('parent');
    expect(subnetNode.data.config.subnetTier).toBe('Public');
  });

  it('debe anidar automáticamente servicios dentro de una subred por hit-testing', () => {
    const subnetItem: ServicePaletteItem = {
      code: 'NET_SUBNET',
      name: 'Subnet',
      category: 'NetworkVpc',
      iconUrl: '/icons/aws/subnet.svg'
    };

    useCanvasStore.setState({ allowedServices: [subnetItem, ec2Service] });

    useCanvasStore.getState().addNode(subnetItem, { x: 100, y: 100 });
    const subnetNode = useCanvasStore.getState().nodes[0];

    // Soltar EC2 dentro de la Subred (x=150, y=150 cae dentro de x:100..370, y:100..420)
    useCanvasStore.getState().addNode(ec2Service, { x: 150, y: 150 });
    const ec2Node = useCanvasStore.getState().nodes[1];

    expect(ec2Node.parentId).toBe(subnetNode.id);
    expect(ec2Node.extent).toBe('parent');
  });

  it('debe anidar servicios dentro de una subred que está anidada dentro de una VPC desplazada', () => {
    const vpcItem: ServicePaletteItem = { code: 'NET_VPC', name: 'VPC', category: 'NetworkVpc', iconUrl: '' };
    const subnetItem: ServicePaletteItem = { code: 'NET_SUBNET', name: 'Subnet', category: 'NetworkVpc', iconUrl: '' };

    useCanvasStore.setState({ allowedServices: [vpcItem, subnetItem, ec2Service] });

    // VPC colocada en (300, 200)
    useCanvasStore.getState().addNode(vpcItem, { x: 300, y: 200 });
    const vpc = useCanvasStore.getState().nodes[0];

    // Subnet colocada dentro de la VPC en pantalla (350, 250) -> relativa a VPC: (50, 50)
    useCanvasStore.getState().addNode(subnetItem, { x: 350, y: 250 });
    const sub = useCanvasStore.getState().nodes[1];
    expect(sub.parentId).toBe(vpc.id);

    // EC2 soltada dentro de la Subred en pantalla (380, 280)
    useCanvasStore.getState().addNode(ec2Service, { x: 380, y: 280 });
    const ec2 = useCanvasStore.getState().nodes[2];

    expect(ec2.parentId).toBe(sub.id);
    expect(ec2.extent).toBe('parent');
  });

  it('debe reasociar jerárquicamente un nodo al invocar reparentNode', () => {
    const vpcItem: ServicePaletteItem = { code: 'NET_VPC', name: 'VPC', category: 'NetworkVpc', iconUrl: '' };
    const subnetItem: ServicePaletteItem = { code: 'NET_SUBNET', name: 'Subnet', category: 'NetworkVpc', iconUrl: '' };

    useCanvasStore.setState({ allowedServices: [vpcItem, subnetItem, ec2Service] });

    // VPC en (100, 100) y Subnet en (150, 150)
    useCanvasStore.getState().addNode(vpcItem, { x: 100, y: 100 });
    useCanvasStore.getState().addNode(subnetItem, { x: 150, y: 150 });
    const sub = useCanvasStore.getState().nodes[1];

    // EC2 creada fuera de la VPC en (800, 800)
    useCanvasStore.getState().addNode(ec2Service, { x: 800, y: 800 });
    const ec2 = useCanvasStore.getState().nodes[2];
    expect(ec2.parentId).toBeUndefined();

    // Mover la posición de EC2 sobre la Subnet (180, 180)
    useCanvasStore.getState().updateNodePosition(ec2.id, { x: 180, y: 180 });
    useCanvasStore.getState().reparentNode(ec2.id);

    const updatedEc2 = useCanvasStore.getState().nodes.find(n => n.id === ec2.id);
    expect(updatedEc2?.parentId).toBe(sub.id);
    expect(updatedEc2?.extent).toBe('parent');
  });

  it('debe eliminar recursivamente en cascada los nodos hijos al eliminar un contenedor padre', () => {
    const vpcItem: ServicePaletteItem = { code: 'NET_VPC', name: 'VPC', category: 'NetworkVpc', iconUrl: '' };
    const subnetItem: ServicePaletteItem = { code: 'NET_SUBNET', name: 'Subnet', category: 'NetworkVpc', iconUrl: '' };

    useCanvasStore.setState({ allowedServices: [vpcItem, subnetItem, ec2Service] });

    // VPC en (0, 0)
    useCanvasStore.getState().addNode(vpcItem, { x: 0, y: 0 });
    const vpc = useCanvasStore.getState().nodes[0];

    // Subnet dentro de VPC
    useCanvasStore.getState().addNode(subnetItem, { x: 50, y: 50 });

    // EC2 dentro de Subnet
    useCanvasStore.getState().addNode(ec2Service, { x: 60, y: 60 });
    expect(useCanvasStore.getState().nodes.length).toBe(3);

    // Borrar la VPC
    useCanvasStore.getState().removeNode(vpc.id);

    // Todos los descendientes deben haber sido removidos
    expect(useCanvasStore.getState().nodes.length).toBe(0);
  });

  it('debe serializar y deserializar correctamente grafos semánticos jerárquicos con parentId', () => {
    const hierarchicalGraph: SemanticGraphDto = {
      components: [
        { id: 'vpc_1', serviceCode: 'NET_VPC', config: { cidrBlock: '10.0.0.0/16' } },
        { id: 'sub_1', serviceCode: 'NET_SUBNET', parentId: 'vpc_1', config: { subnetTier: 'Private', cidrBlock: '10.0.2.0/24' } },
        { id: 'ec2_1', serviceCode: 'AWS_EC2', parentId: 'sub_1', config: { instanceCount: 2 } }
      ],
      connections: []
    };

    useCanvasStore.getState().loadSemanticGraph(hierarchicalGraph);
    const nodes = useCanvasStore.getState().nodes;

    expect(nodes.length).toBe(3);
    const vpcNode = nodes.find(n => n.id === 'vpc_1');
    const subNode = nodes.find(n => n.id === 'sub_1');
    const ec2Node = nodes.find(n => n.id === 'ec2_1');

    expect(vpcNode?.type).toBe('vpcContainerNode');
    expect(subNode?.type).toBe('subnetContainerNode');
    expect(subNode?.parentId).toBe('vpc_1');
    expect(ec2Node?.type).toBe('awsServiceNode');
    expect(ec2Node?.parentId).toBe('sub_1');

    // Serializar de vuelta a DTO
    const exportedGraph = useCanvasStore.getState().toSemanticGraph();
    expect(exportedGraph.components.find(c => c.id === 'sub_1')?.parentId).toBe('vpc_1');
    expect(exportedGraph.components.find(c => c.id === 'ec2_1')?.parentId).toBe('sub_1');
  });

  it('debe soportar y asignar parentId y extent cuando el initialGraph usa containerId', () => {
    const jsonStyleGraph: SemanticGraphDto = {
      components: [
        { id: 'vpc-1', serviceCode: 'NET_VPC', containerId: null, config: { cidrBlock: '10.0.0.0/16' } },
        { id: 'subnet-pub-1', serviceCode: 'NET_SUBNET', containerId: 'vpc-1', config: { subnetTier: 'Public', cidrBlock: '10.0.1.0/24' } },
        { id: 'ec2-web', serviceCode: 'AWS_EC2', containerId: 'subnet-pub-1', config: {} },
        { id: 'rds-db-vuln', serviceCode: 'AWS_RDS', containerId: 'subnet-pub-1', config: { isPublic: true } }
      ],
      connections: []
    };

    useCanvasStore.getState().loadSemanticGraph(jsonStyleGraph);
    const nodes = useCanvasStore.getState().nodes;

    expect(nodes.length).toBe(4);
    const subnetNode = nodes.find(n => n.id === 'subnet-pub-1');
    const ec2Node = nodes.find(n => n.id === 'ec2-web');
    const rdsNode = nodes.find(n => n.id === 'rds-db-vuln');

    expect(subnetNode?.parentId).toBe('vpc-1');
    expect(subnetNode?.extent).toBe('parent');
    expect(ec2Node?.parentId).toBe('subnet-pub-1');
    expect(ec2Node?.extent).toBe('parent');
    expect(rdsNode?.parentId).toBe('subnet-pub-1');
    expect(rdsNode?.extent).toBe('parent');
  });
});
