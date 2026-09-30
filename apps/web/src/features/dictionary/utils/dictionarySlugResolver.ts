/**
 * Mapeo canónico entre códigos de servicio / infraestructura y sus slugs en el glosario de términos.
 */
export const SERVICE_CODE_TO_SLUG: Record<string, string> = {
  // Compute
  AWS_EC2: 'amazon-ec2',
  AWS_LAMBDA: 'aws-lambda',
  AWS_ECS: 'amazon-ecs',
  AWS_ECR: 'amazon-ecr',
  AWS_FARGATE: 'aws-fargate',
  AWS_ASG: 'auto-scaling-group',

  // Storage & Database
  AWS_S3: 'amazon-s3',
  AWS_EBS: 'amazon-ebs',
  AWS_EFS: 'amazon-efs',
  AWS_RDS: 'amazon-rds',
  AWS_AURORA: 'amazon-aurora',
  AWS_DYNAMODB: 'amazon-dynamodb',
  AWS_ELASTICACHE: 'amazon-elasticache',

  // Networking & Content Delivery
  AWS_CLOUDFRONT: 'amazon-cloudfront',
  AWS_ROUTE53: 'amazon-route-53',
  AWS_ALB: 'application-load-balancer',
  AWS_NLB: 'network-load-balancer',
  AWS_APIGATEWAY: 'amazon-api-gateway',
  AWS_APIGW: 'amazon-api-gateway',

  // Integration & Messaging
  AWS_SQS: 'amazon-sqs',
  AWS_SNS: 'amazon-sns',
  AWS_EVENTBRIDGE: 'amazon-eventbridge',
  AWS_STEPFUNCTIONS: 'aws-step-functions',

  // Security & Identity
  AWS_IAM: 'aws-iam',
  AWS_WAF: 'aws-waf',
  AWS_KMS: 'aws-kms',
  AWS_SECRETS_MANAGER: 'aws-secrets-manager',
  AWS_SECRETS: 'aws-secrets-manager',
  AWS_COGNITO: 'amazon-cognito',

  // Monitoring & Management
  AWS_CLOUDWATCH: 'amazon-cloudwatch',
  AWS_CLOUDTRAIL: 'aws-cloudtrail',
  AWS_CLOUDFORMATION: 'aws-cloudformation',

  // Analytics & Search
  AWS_ATHENA: 'amazon-athena',
  AWS_OPENSEARCH: 'amazon-opensearch',

  // Network Infrastructure & VPC
  NET_VPC: 'amazon-vpc',
  NET_SUBNET: 'subnet-publica',
  NET_SUBNET_PUB: 'subnet-publica',
  NET_SUBNET_PRIV: 'subnet-privada',
  NET_IGW: 'internet-gateway',
  NET_INTERNET_GATEWAY: 'internet-gateway',
  NET_NAT_GATEWAY: 'nat-gateway',
  NET_NATGW: 'nat-gateway',
  NET_ROUTE_TABLE: 'route-table',
  NET_RT: 'route-table',
  NET_SECURITY_GROUP: 'security-group',
  SEC_SG: 'security-group',
  NET_NACL: 'network-acl',
  SEC_NACL: 'network-acl',
  SEC_BASTION: 'bastion-host',
  NET_PEERING: 'vpc-peering',
  NET_TGW: 'transit-gateway',
  NET_CIDR: 'cidr-block',
  NET_TG: 'target-group-health-checks',
  NET_VPCE: 'vpc-endpoint-privatelink',
};

/**
 * Resuelve el slug canónico del diccionario dado un código de servicio, título o slug explícito.
 */
export function resolveDictionarySlug(
  serviceCode?: string | null,
  title?: string | null,
  explicitSlug?: string | null
): string {
  if (explicitSlug && explicitSlug.trim().length > 0) {
    return explicitSlug.trim();
  }

  if (serviceCode) {
    const upperCode = serviceCode.trim().toUpperCase();
    if (SERVICE_CODE_TO_SLUG[upperCode]) {
      return SERVICE_CODE_TO_SLUG[upperCode];
    }

    const code = serviceCode.toLowerCase().replace(/_/g, '-');
    if (code.startsWith('aws-')) return `amazon-${code.substring(4)}`;
    if (code.startsWith('net-')) return code.substring(4);
    return code;
  }

  if (title) {
    const slugCandidate = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verificamos si el título coincide con un nombre conocido
    for (const slug of Object.values(SERVICE_CODE_TO_SLUG)) {
      if (slugCandidate === slug || slugCandidate.includes(slug)) {
        return slug;
      }
    }

    return slugCandidate;
  }

  return '';
}
