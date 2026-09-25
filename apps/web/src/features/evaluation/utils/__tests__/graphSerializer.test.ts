import { describe, it, expect } from 'vitest';
import {
  serializeCanvasToSemanticGraph,
  createEvaluateArchitecturePayload,
  validateArchitectureForEvaluation
} from '../graphSerializer';
import { AwsCanvasNode, AwsCanvasEdge } from '../../../canvas/types/canvas.types';

describe('graphSerializer', () => {
  const mockNodes: AwsCanvasNode[] = [
    {
      id: 'node_alb_1',
      type: 'awsServiceNode',
      position: { x: 100, y: 50 },
      data: {
        serviceCode: 'AWS_ALB',
        name: 'Application Load Balancer',
        category: 'Networking',
        iconUrl: '/icons/alb.svg',
        config: {
          isPublic: true,
          instanceCount: 1
        }
      }
    },
    {
      id: 'node_ec2_1',
      type: 'awsServiceNode',
      position: { x: 100, y: 200 },
      data: {
        serviceCode: 'AWS_EC2',
        name: 'Amazon EC2',
        category: 'Compute',
        iconUrl: '/icons/ec2.svg',
        config: {
          autoScaling: true,
          instanceCount: 2,
          isMultiAz: true
        }
      }
    },
    {
      id: 'node_rds_1',
      type: 'awsServiceNode',
      position: { x: 100, y: 350 },
      data: {
        serviceCode: 'AWS_RDS',
        name: 'Amazon RDS',
        category: 'Database',
        iconUrl: '/icons/rds.svg',
        config: {
          isMultiAz: true,
          storageClass: 'gp3'
        }
      }
    }
  ];

  const mockEdges: AwsCanvasEdge[] = [
    {
      id: 'edge_1',
      source: 'node_alb_1',
      target: 'node_ec2_1',
      type: 'customConnectionEdge',
      data: {
        connectionType: 'HTTP_HTTPS'
      }
    },
    {
      id: 'edge_2',
      source: 'node_ec2_1',
      target: 'node_rds_1',
      type: 'customConnectionEdge',
      data: {
        connectionType: 'DATABASE'
      }
    }
  ];

  describe('serializeCanvasToSemanticGraph', () => {
    it('debe transformar nodos y aristas de React Flow a SemanticGraphDto suprimiendo coordenadas', () => {
      const result = serializeCanvasToSemanticGraph(mockNodes, mockEdges);

      expect(result.components).toHaveLength(3);
      expect(result.connections).toHaveLength(2);

      // Verificar que el componente no contiene propiedades de React Flow
      const albComponent = result.components.find((c) => c.id === 'node_alb_1');
      expect(albComponent).toBeDefined();
      expect(albComponent?.serviceCode).toBe('AWS_ALB');
      expect(albComponent?.label).toBe('Application Load Balancer');
      expect((albComponent as unknown as Record<string, unknown>).position).toBeUndefined();
      expect((albComponent as unknown as Record<string, unknown>).type).toBeUndefined();

      // Verificar config preservada
      expect(albComponent?.config.isPublic).toBe(true);
      expect(albComponent?.config.instanceCount).toBe(1);

      const ec2Component = result.components.find((c) => c.id === 'node_ec2_1');
      expect(ec2Component?.config.autoScaling).toBe(true);
      expect(ec2Component?.config.instanceCount).toBe(2);
      expect(ec2Component?.config.isMultiAz).toBe(true);

      // Verificar conexiones
      expect(result.connections[0]).toEqual({
        fromComponentId: 'node_alb_1',
        toComponentId: 'node_ec2_1',
        connectionType: 'HTTP_HTTPS'
      });
      expect(result.connections[1]).toEqual({
        fromComponentId: 'node_ec2_1',
        toComponentId: 'node_rds_1',
        connectionType: 'DATABASE'
      });
    });

    it('debe asignar conexión por defecto HTTP_HTTPS si edge.data no define connectionType', () => {
      const edgeWithoutType: AwsCanvasEdge = {
        id: 'edge_raw',
        source: 'node_alb_1',
        target: 'node_ec2_1',
        type: 'customConnectionEdge',
        data: undefined as unknown as { connectionType: 'HTTP_HTTPS' }
      };

      const result = serializeCanvasToSemanticGraph(mockNodes, [edgeWithoutType]);
      expect(result.connections[0].connectionType).toBe('HTTP_HTTPS');
    });

    it('debe manejar grafos vacíos retornando listas vacías', () => {
      const result = serializeCanvasToSemanticGraph([], []);
      expect(result.components).toEqual([]);
      expect(result.connections).toEqual([]);
    });
  });

  describe('createEvaluateArchitecturePayload', () => {
    it('debe empaquetar el grafo semántico y sanitizar el contador de pistas', () => {
      const payload = createEvaluateArchitecturePayload(mockNodes, mockEdges, 2);

      expect(payload.hintsUsed).toBe(2);
      expect(payload.graph.components).toHaveLength(3);
      expect(payload.graph.connections).toHaveLength(2);
    });

    it('debe asignar hintsUsed a 0 si se envía un número negativo', () => {
      const payload = createEvaluateArchitecturePayload(mockNodes, mockEdges, -3);
      expect(payload.hintsUsed).toBe(0);
    });
  });

  describe('validateArchitectureForEvaluation', () => {
    it('debe fallar si no hay nodos colocados en el canvas', () => {
      const result = validateArchitectureForEvaluation([], []);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Debes colocar al menos un servicio');
    });

    it('debe fallar si una arista conecta un nodo consigo mismo (auto-conexión)', () => {
      const selfEdge: AwsCanvasEdge = {
        id: 'edge_self',
        source: 'node_alb_1',
        target: 'node_alb_1',
        type: 'customConnectionEdge',
        data: { connectionType: 'HTTP_HTTPS' }
      };

      const result = validateArchitectureForEvaluation(mockNodes, [selfEdge]);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('no puede conectarse a sí mismo');
    });

    it('debe fallar si una arista tiene origen o destino huérfano (nodo inexistente)', () => {
      const orphanEdge: AwsCanvasEdge = {
        id: 'edge_orphan',
        source: 'node_alb_1',
        target: 'node_non_existent',
        type: 'customConnectionEdge',
        data: { connectionType: 'HTTP_HTTPS' }
      };

      const result = validateArchitectureForEvaluation(mockNodes, [orphanEdge]);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('nodo que ya no se encuentra en el canvas');
    });

    it('debe fallar si una arista no tiene source o target', () => {
      const incompleteEdge = {
        id: 'edge_incomplete',
        source: '',
        target: 'node_ec2_1',
        type: 'customConnectionEdge',
        data: { connectionType: 'HTTP_HTTPS' }
      } as unknown as AwsCanvasEdge;

      const result = validateArchitectureForEvaluation(mockNodes, [incompleteEdge]);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('conexión incompleta');
    });

    it('debe validar exitosamente una topología correcta', () => {
      const result = validateArchitectureForEvaluation(mockNodes, mockEdges);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeNull();
    });
  });
});
