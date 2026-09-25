import { NodeTypes, EdgeTypes } from '@xyflow/react';
import { AwsServiceNode } from './nodes/AwsServiceNode';
import { VpcContainerNode } from './nodes/VpcContainerNode';
import { SubnetContainerNode } from './nodes/SubnetContainerNode';
import { GatewayNode } from './nodes/GatewayNode';
import { SecurityGroupNode } from './nodes/SecurityGroupNode';
import { CustomConnectionEdge } from './edges/CustomConnectionEdge';

/**
 * Catálogo inmutable de tipos de nodos personalizados para React Flow.
 */
export const nodeTypes: NodeTypes = {
  awsServiceNode: AwsServiceNode,
  vpcContainerNode: VpcContainerNode,
  subnetContainerNode: SubnetContainerNode,
  gatewayNode: GatewayNode,
  securityGroupNode: SecurityGroupNode
};

/**
 * Catálogo inmutable de tipos de aristas personalizadas para React Flow.
 */
export const edgeTypes: EdgeTypes = {
  customConnectionEdge: CustomConnectionEdge
};
