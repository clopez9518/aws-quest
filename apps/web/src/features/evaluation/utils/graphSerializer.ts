import {
  AwsCanvasNode,
  AwsCanvasEdge,
  SemanticGraphDto,
  GraphComponentDto,
  GraphConnectionDto
} from '../../canvas/types/canvas.types';
import {
  EvaluateArchitectureRequestDto,
  ClientValidationResult
} from '../types/evaluation.types';

/**
 * Transforma los nodos y aristas visuales de React Flow a un grafo semántico
 * completamente agnóstico de coordenadas (x, y), dimensiones y clases de renderizado.
 */
export function serializeCanvasToSemanticGraph(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[]
): SemanticGraphDto {
  const components: GraphComponentDto[] = nodes.map((node) => {
    const directSgIds = node.data.config?.securityGroupIds ?? [];
    const connectedSgIds = edges
      .filter((e) => {
        if (e.source === node.id) {
          const targetNode = nodes.find((n) => n.id === e.target);
          return targetNode?.data.serviceCode?.toUpperCase() === 'NET_SECURITY_GROUP';
        }
        if (e.target === node.id) {
          const sourceNode = nodes.find((n) => n.id === e.source);
          return sourceNode?.data.serviceCode?.toUpperCase() === 'NET_SECURITY_GROUP';
        }
        return false;
      })
      .map((e) => (e.source === node.id ? e.target : e.source));

    const mergedSgIds = Array.from(new Set([...directSgIds, ...connectedSgIds]));

    return {
      id: node.id,
      serviceCode: node.data.serviceCode,
      label: node.data.name || null,
      parentId: node.parentId || node.data.parentId || null,
      kind: node.data.kind,
      category: node.data.category,
      config: {
        isMultiAz: node.data.config?.isMultiAz ?? null,
        autoScaling: node.data.config?.autoScaling ?? null,
        instanceCount: node.data.config?.instanceCount ?? 1,
        isPublic: node.data.config?.isPublic ?? null,
        subnetType: node.data.config?.subnetType ?? null,
        storageClass: node.data.config?.storageClass ?? null,
        subnetTier: node.data.config?.subnetTier ?? null,
        cidrBlock: node.data.config?.cidrBlock ?? null,
        routeTableId: node.data.config?.routeTableId ?? null,
        attachedVpcId: node.data.config?.attachedVpcId ?? null,
        securityGroupIds: mergedSgIds,
        routes: node.data.config?.routes ?? [],
        securityGroupRules: node.data.config?.securityGroupRules ?? [],
        customProperties: node.data.config?.customProperties
      }
    };
  });

  const connections: GraphConnectionDto[] = edges.map((edge) => ({
    fromComponentId: edge.source,
    toComponentId: edge.target,
    connectionType: edge.data?.connectionType ?? 'HTTP_HTTPS'
  }));

  return {
    components,
    connections
  };
}

/**
 * Crea el payload completo EvaluateArchitectureRequestDto listo para ser enviado a la API.
 */
export function createEvaluateArchitecturePayload(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[],
  hintsUsed: number = 0
): EvaluateArchitectureRequestDto {
  const graph = serializeCanvasToSemanticGraph(nodes, edges);
  return {
    graph,
    hintsUsed: Math.max(0, hintsUsed)
  };
}

/**
 * Valida rápidamente en el cliente la coherencia topológica antes de ejecutar la petición HTTP.
 * Previene llamadas innecesarias al backend con grafos vacíos o con aristas inválidas.
 */
export function validateArchitectureForEvaluation(
  nodes: AwsCanvasNode[],
  edges: AwsCanvasEdge[]
): ClientValidationResult {
  if (!nodes || nodes.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Debes colocar al menos un servicio en el canvas antes de evaluar tu arquitectura.'
    };
  }

  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const edge of edges) {
    if (!edge.source || !edge.target) {
      return {
        isValid: false,
        errorMessage: 'Existe una conexión incompleta en el diseño arquitectónico.'
      };
    }

    if (edge.source === edge.target) {
      return {
        isValid: false,
        errorMessage: 'Un componente de arquitectura no puede conectarse a sí mismo.'
      };
    }

    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      return {
        isValid: false,
        errorMessage: 'Existe una conexión hacia un nodo que ya no se encuentra en el canvas.'
      };
    }
  }

  return {
    isValid: true,
    errorMessage: null
  };
}
