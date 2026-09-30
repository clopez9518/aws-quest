import { describe, it, expect } from 'vitest';
import { resolveDictionarySlug } from '../dictionarySlugResolver';

describe('dictionarySlugResolver', () => {
  it('debe priorizar explicitSlug si está presente', () => {
    expect(resolveDictionarySlug('AWS_EC2', 'Amazon EC2', 'custom-slug')).toBe('custom-slug');
  });

  it('debe resolver códigos de servicios AWS comunes', () => {
    expect(resolveDictionarySlug('AWS_EC2')).toBe('amazon-ec2');
    expect(resolveDictionarySlug('AWS_S3')).toBe('amazon-s3');
    expect(resolveDictionarySlug('AWS_RDS')).toBe('amazon-rds');
    expect(resolveDictionarySlug('AWS_DYNAMODB')).toBe('amazon-dynamodb');
    expect(resolveDictionarySlug('AWS_LAMBDA')).toBe('aws-lambda');
    expect(resolveDictionarySlug('AWS_ALB')).toBe('application-load-balancer');
    expect(resolveDictionarySlug('AWS_APIGATEWAY')).toBe('amazon-api-gateway');
    expect(resolveDictionarySlug('AWS_APIGW')).toBe('amazon-api-gateway');
    expect(resolveDictionarySlug('AWS_SECRETS_MANAGER')).toBe('aws-secrets-manager');
    expect(resolveDictionarySlug('AWS_SECRETS')).toBe('aws-secrets-manager');
  });

  it('debe resolver códigos de infraestructura y redes correctamente (Internet Gateway, Subnet, Security Group, etc.)', () => {
    expect(resolveDictionarySlug('NET_IGW')).toBe('internet-gateway');
    expect(resolveDictionarySlug('NET_INTERNET_GATEWAY')).toBe('internet-gateway');
    expect(resolveDictionarySlug('NET_SUBNET')).toBe('subnet-publica');
    expect(resolveDictionarySlug('NET_SUBNET_PUB')).toBe('subnet-publica');
    expect(resolveDictionarySlug('NET_SUBNET_PRIV')).toBe('subnet-privada');
    expect(resolveDictionarySlug('NET_SECURITY_GROUP')).toBe('security-group');
    expect(resolveDictionarySlug('SEC_SG')).toBe('security-group');
    expect(resolveDictionarySlug('NET_NAT_GATEWAY')).toBe('nat-gateway');
    expect(resolveDictionarySlug('NET_NATGW')).toBe('nat-gateway');
    expect(resolveDictionarySlug('NET_ROUTE_TABLE')).toBe('route-table');
    expect(resolveDictionarySlug('NET_RT')).toBe('route-table');
    expect(resolveDictionarySlug('NET_NACL')).toBe('network-acl');
    expect(resolveDictionarySlug('SEC_NACL')).toBe('network-acl');
    expect(resolveDictionarySlug('NET_VPC')).toBe('amazon-vpc');
  });

  it('debe resolver a partir del título cuando serviceCode no está presente', () => {
    expect(resolveDictionarySlug(null, 'Internet Gateway')).toBe('internet-gateway');
    expect(resolveDictionarySlug(null, 'Security Group')).toBe('security-group');
    expect(resolveDictionarySlug(null, 'Amazon DynamoDB')).toBe('amazon-dynamodb');
  });

  it('debe retornar string vacío si no se proveen parámetros válidos', () => {
    expect(resolveDictionarySlug(null, null, null)).toBe('');
    expect(resolveDictionarySlug('', '', '')).toBe('');
  });
});
