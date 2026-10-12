import { describe, it, expect } from 'vitest';
import {
  isValidIpv4Cidr,
  parseIpv4Cidr,
  isCidrWithinVpc,
  doCidrsOverlap,
  validateSubnetCidrInCanvas,
  ipToNumber,
  numberToIp
} from '../cidrUtils';

describe('cidrUtils', () => {
  describe('ipToNumber y numberToIp', () => {
    it('debe convertir correctamente una IP a entero y viceversa', () => {
      const ip = '10.0.1.1';
      const num = ipToNumber(ip);
      expect(num).not.toBeNull();
      expect(numberToIp(num!)).toBe(ip);
    });

    it('debe retornar null para IPs inválidas', () => {
      expect(ipToNumber('256.0.0.1')).toBeNull();
      expect(ipToNumber('10.0.1')).toBeNull();
      expect(ipToNumber('abc.def.ghi.jkl')).toBeNull();
    });
  });

  describe('isValidIpv4Cidr', () => {
    it('debe validar formatos CIDR correctos dentro del rango AWS /16 a /28', () => {
      expect(isValidIpv4Cidr('10.0.0.0/16')).toBe(true);
      expect(isValidIpv4Cidr('10.0.1.0/24')).toBe(true);
      expect(isValidIpv4Cidr('172.16.0.0/20')).toBe(true);
      expect(isValidIpv4Cidr('192.168.1.0/28')).toBe(true);
    });

    it('debe rechazar prefijos fuera del rango soportado por AWS', () => {
      expect(isValidIpv4Cidr('10.0.0.0/8')).toBe(false); // muy grande (< /16)
      expect(isValidIpv4Cidr('10.0.1.0/29')).toBe(false); // muy pequeño (> /28)
      expect(isValidIpv4Cidr('10.0.1.0/32')).toBe(false);
      expect(isValidIpv4Cidr('invalid-cidr')).toBe(false);
    });
  });

  describe('parseIpv4Cidr', () => {
    it('debe calcular correctamente inicio de red, broadcast y las 5 IPs reservadas por AWS', () => {
      const parsed = parseIpv4Cidr('10.0.1.0/24');
      expect(parsed).not.toBeNull();
      expect(parsed?.totalIps).toBe(256);
      expect(parsed?.usableAwsIps).toBe(251); // 256 - 5 reservadas por AWS
      expect(parsed?.prefixLength).toBe(24);
    });
  });

  describe('isCidrWithinVpc', () => {
    it('debe confirmar si una subred está dentro de la VPC', () => {
      expect(isCidrWithinVpc('10.0.1.0/24', '10.0.0.0/16')).toBe(true);
      expect(isCidrWithinVpc('10.0.255.0/24', '10.0.0.0/16')).toBe(true);
    });

    it('debe rechazar subredes fuera de la VPC', () => {
      expect(isCidrWithinVpc('192.168.1.0/24', '10.0.0.0/16')).toBe(false);
      expect(isCidrWithinVpc('10.1.1.0/24', '10.0.0.0/16')).toBe(false);
    });
  });

  describe('doCidrsOverlap', () => {
    it('debe detectar solapamiento exacto y parcial', () => {
      expect(doCidrsOverlap('10.0.1.0/24', '10.0.1.0/24')).toBe(true);
      expect(doCidrsOverlap('10.0.1.0/24', '10.0.0.0/23')).toBe(true);
    });

    it('debe confirmar que dos rangos adyacentes no se solapan', () => {
      expect(doCidrsOverlap('10.0.1.0/24', '10.0.2.0/24')).toBe(false);
      expect(doCidrsOverlap('10.0.3.0/24', '10.0.4.0/24')).toBe(false);
    });
  });

  describe('validateSubnetCidrInCanvas', () => {
    const mockNodes = [
      {
        id: 'vpc-main',
        data: {
          name: 'VPC Producción',
          serviceCode: 'NET_VPC',
          config: { cidrBlock: '10.0.0.0/16' }
        }
      },
      {
        id: 'sub-pub-1',
        parentId: 'vpc-main',
        data: {
          name: 'Public Subnet 1',
          serviceCode: 'NET_SUBNET',
          config: { cidrBlock: '10.0.1.0/24' }
        }
      },
      {
        id: 'sub-priv-1',
        parentId: 'vpc-main',
        data: {
          name: 'Private Subnet 1',
          serviceCode: 'NET_SUBNET',
          config: { cidrBlock: '10.0.2.0/24' }
        }
      }
    ];

    it('debe aceptar un nuevo CIDR válido y disponible', () => {
      const res = validateSubnetCidrInCanvas('sub-priv-1', '10.0.3.0/24', mockNodes);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('debe rechazar un CIDR que colisiona con otra subred hermana', () => {
      // Intentar cambiar sub-priv-1 a 10.0.1.0/24 (que ya lo usa sub-pub-1)
      const res = validateSubnetCidrInCanvas('sub-priv-1', '10.0.1.0/24', mockNodes);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('colisiona con la subred');
    });

    it('debe rechazar un CIDR que se sale del rango de la VPC', () => {
      const res = validateSubnetCidrInCanvas('sub-priv-1', '172.16.1.0/24', mockNodes);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('fuera del rango asignado a la VPC');
    });
  });
});
