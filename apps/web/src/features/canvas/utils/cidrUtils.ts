/**
 * Utilidades para cálculo, parsing y validación de bloques CIDR IPv4
 * alineados con las especificaciones de AWS VPC y Subnets.
 */

export interface ParsedCidr {
  ip: string;
  prefixLength: number;
  networkStart: number;
  networkEnd: number;
  totalIps: number;
  usableAwsIps: number;
}

export const DEFAULT_SUBNET_CIDR_PRESETS: Array<{ cidr: string; label: string }> = [
  { cidr: '10.0.1.0/24', label: '10.0.1.0/24 (Tier Público / Web - 251 IPs)' },
  { cidr: '10.0.2.0/24', label: '10.0.2.0/24 (Tier Privado / App - 251 IPs)' },
  { cidr: '10.0.3.0/24', label: '10.0.3.0/24 (Tier Aislado / DB - 251 IPs)' },
  { cidr: '10.0.4.0/24', label: '10.0.4.0/24 (Tier Secundario - 251 IPs)' },
  { cidr: '10.0.11.0/24', label: '10.0.11.0/24 (AZ-1b Privado - 251 IPs)' },
  { cidr: '10.0.12.0/24', label: '10.0.12.0/24 (AZ-1b Backend - 251 IPs)' },
  { cidr: '10.0.20.0/24', label: '10.0.20.0/24 (Cargas Batch - 251 IPs)' },
  { cidr: '10.0.99.0/24', label: '10.0.99.0/24 (Gestión / Bastion - 251 IPs)' },
  { cidr: '172.16.1.0/24', label: '172.16.1.0/24 (Clase B Privada - 251 IPs)' },
  { cidr: '172.16.2.0/24', label: '172.16.2.0/24 (Clase B Privada - 251 IPs)' },
  { cidr: '192.168.1.0/24', label: '192.168.1.0/24 (Clase C Interna - 251 IPs)' },
  { cidr: '192.168.2.0/24', label: '192.168.2.0/24 (Clase C Interna - 251 IPs)' }
];

/**
 * Convierte una dirección IPv4 en formato string a un entero de 32 bits sin signo.
 */
export function ipToNumber(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;

  let num = 0;
  for (let i = 0; i < 4; i++) {
    const octet = Number(parts[i]);
    if (isNaN(octet) || octet < 0 || octet > 255 || parts[i] === '') {
      return null;
    }
    num = (num << 8) | octet;
  }
  return num >>> 0;
}

/**
 * Convierte un entero de 32 bits a notación IPv4 con puntos.
 */
export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

/**
 * Valida si un bloque CIDR cumple con los estándares IPv4 y rangos válidos en AWS (/16 a /28).
 */
export function isValidIpv4Cidr(cidr: string): boolean {
  if (!cidr || typeof cidr !== 'string') return false;

  const parts = cidr.trim().split('/');
  if (parts.length !== 2) return false;

  const [ipPart, maskPart] = parts;
  const ipNum = ipToNumber(ipPart);
  if (ipNum === null) return false;

  const prefix = Number(maskPart);
  if (isNaN(prefix) || !Number.isInteger(prefix) || prefix < 16 || prefix > 28) {
    return false;
  }

  return true;
}

/**
 * Parsea un bloque CIDR calculando inicio de red, broadcast e IPs utilizables en AWS.
 */
export function parseIpv4Cidr(cidr: string): ParsedCidr | null {
  if (!isValidIpv4Cidr(cidr)) return null;

  const [ipPart, maskPart] = cidr.trim().split('/');
  const prefixLength = Number(maskPart);
  const ipNum = ipToNumber(ipPart)!;

  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  const networkStart = (ipNum & mask) >>> 0;
  const networkEnd = (networkStart | (~mask >>> 0)) >>> 0;
  const totalIps = 2 ** (32 - prefixLength);
  // AWS reserva 5 IPs en cada subred: .0 (Red), .1 (Router VPC), .2 (DNS), .3 (Futuro), .255 (Broadcast)
  const usableAwsIps = Math.max(0, totalIps - 5);

  return {
    ip: ipPart,
    prefixLength,
    networkStart,
    networkEnd,
    totalIps,
    usableAwsIps
  };
}

/**
 * Determina si subnetCidr está totalmente contenida dentro de vpcCidr.
 */
export function isCidrWithinVpc(subnetCidr: string, vpcCidr: string): boolean {
  const subnet = parseIpv4Cidr(subnetCidr);
  const vpc = parseIpv4Cidr(vpcCidr);

  if (!subnet || !vpc) return false;
  if (subnet.prefixLength < vpc.prefixLength) return false;

  return (
    subnet.networkStart >= vpc.networkStart &&
    subnet.networkEnd <= vpc.networkEnd
  );
}

/**
 * Determina si dos bloques CIDR se solapan (overlap).
 */
export function doCidrsOverlap(cidr1: string, cidr2: string): boolean {
  const a = parseIpv4Cidr(cidr1);
  const b = parseIpv4Cidr(cidr2);

  if (!a || !b) return false;

  return !(a.networkEnd < b.networkStart || a.networkStart > b.networkEnd);
}

export interface SubnetCidrValidationResult {
  isValid: boolean;
  warning?: string | null;
  error?: string | null;
  overlappingSubnetId?: string | null;
  vpcCidr?: string | null;
}

/**
 * Valida un CIDR de subred en el contexto del lienzo y detecta solapamientos o escapes de VPC.
 */
export function validateSubnetCidrInCanvas(
  subnetId: string,
  candidateCidr: string,
  nodes: Array<{
    id: string;
    type?: string;
    parentId?: string | null;
    data: {
      name?: string;
      serviceCode?: string;
      config?: { cidrBlock?: string | null; cidr?: string | null };
    };
  }>
): SubnetCidrValidationResult {
  if (!isValidIpv4Cidr(candidateCidr)) {
    return {
      isValid: false,
      error: 'Formato CIDR inválido. Debe ser una IPv4 con máscara entre /16 y /28 (ej. 10.0.1.0/24).'
    };
  }

  const currentNode = nodes.find((n) => n.id === subnetId);
  const parentVpcId = currentNode?.parentId;

  let vpcCidr: string | null = null;
  if (parentVpcId) {
    const parentVpc = nodes.find((n) => n.id === parentVpcId);
    if (parentVpc) {
      vpcCidr = parentVpc.data.config?.cidrBlock || parentVpc.data.config?.cidr || '10.0.0.0/16';
    }
  }

  // Si tiene VPC contenedora, validar contención
  if (vpcCidr && !isCidrWithinVpc(candidateCidr, vpcCidr)) {
    return {
      isValid: false,
      error: `El bloque ${candidateCidr} está fuera del rango asignado a la VPC (${vpcCidr}).`,
      vpcCidr
    };
  }

  // Validar solapamiento con subredes hermanas dentro de la misma VPC (o en todo el canvas si no tienen VPC)
  const siblingSubnets = nodes.filter(
    (n) =>
      n.id !== subnetId &&
      (n.data.serviceCode === 'NET_SUBNET' || n.type === 'subnetContainerNode') &&
      (!parentVpcId || n.parentId === parentVpcId)
  );

  for (const sibling of siblingSubnets) {
    const siblingCidr = sibling.data.config?.cidrBlock || sibling.data.config?.cidr;
    if (siblingCidr && doCidrsOverlap(candidateCidr, siblingCidr)) {
      return {
        isValid: false,
        error: `El rango CIDR colisiona con la subred "${sibling.data.name || sibling.id}" (${siblingCidr}).`,
        overlappingSubnetId: sibling.id,
        vpcCidr
      };
    }
  }

  return {
    isValid: true,
    vpcCidr
  };
}
