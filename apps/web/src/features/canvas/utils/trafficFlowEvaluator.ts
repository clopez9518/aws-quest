import { AwsCanvasEdge, AwsCanvasNode } from '../types/canvas.types';
import { TrafficScenario } from '../stores/useTrafficSimulationStore';

export interface TrafficFlowConfig {
  particleColor: string;
  glowColor: string;
  particleCount: number;
  baseDurationSeconds: number;
  isBlocked: boolean;
  statusLabel?: string;
}

export function evaluateEdgeTrafficFlow(
  edge: AwsCanvasEdge,
  sourceNode?: AwsCanvasNode,
  targetNode?: AwsCanvasNode,
  scenario: TrafficScenario = 'normal',
  speedMultiplier: number = 1
): TrafficFlowConfig {
  const sourceCode = sourceNode?.data?.serviceCode?.toUpperCase() || '';
  const targetCode = targetNode?.data?.serviceCode?.toUpperCase() || '';
  const visualStatus = edge.data?.visualStatus || 'default';

  // 1. Escenario de Ataque Web (DDoS / SQL Injection / Bot)
  if (scenario === 'malicious') {
    // Si la arista apunta a WAF o sale de WAF bloqueando
    if (sourceCode === 'AWS_WAF' || targetCode === 'AWS_WAF') {
      return {
        particleColor: '#EF4444', // Red 500
        glowColor: 'rgba(239, 68, 68, 0.6)',
        particleCount: 4,
        baseDurationSeconds: Math.max(0.6, 1.8 / speedMultiplier),
        isBlocked: true,
        statusLabel: 'Bloqueado por AWS WAF'
      };
    }
  }

  // 2. Conexiones con error visual (ej. evaluación fallida o Security Group bloqueante)
  if (visualStatus === 'error') {
    return {
      particleColor: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.6)',
      particleCount: 2,
      baseDurationSeconds: Math.max(0.8, 2.5 / speedMultiplier),
      isBlocked: true,
      statusLabel: 'Tráfico bloqueado'
    };
  }

  // 3. Conexiones con advertencia
  if (visualStatus === 'warning') {
    return {
      particleColor: '#F59E0B', // Amber 500
      glowColor: 'rgba(245, 158, 11, 0.6)',
      particleCount: 2,
      baseDurationSeconds: Math.max(0.8, 2.2 / speedMultiplier),
      isBlocked: false,
      statusLabel: 'Latencia elevada'
    };
  }

  // 4. Flujo Asíncrono de Mensajería (SQS / SNS / EventBridge)
  if (
    sourceCode === 'AWS_SQS' ||
    targetCode === 'AWS_SQS' ||
    sourceCode === 'AWS_SNS' ||
    targetCode === 'AWS_SNS' ||
    sourceCode === 'AWS_EVENTBRIDGE' ||
    targetCode === 'AWS_EVENTBRIDGE'
  ) {
    return {
      particleColor: '#A855F7', // Purple 500
      glowColor: 'rgba(168, 85, 247, 0.6)',
      particleCount: scenario === 'spike' ? 6 : 3,
      baseDurationSeconds: Math.max(0.8, 2.0 / speedMultiplier),
      isBlocked: false,
      statusLabel: 'Mensajes en cola (Batch)'
    };
  }

  // 5. Tráfico hacia Base de Datos / Almacenamiento
  if (
    targetCode === 'AWS_RDS' ||
    targetCode === 'AWS_DYNAMODB' ||
    targetCode === 'AWS_S3' ||
    targetCode === 'AWS_ELASTICACHE'
  ) {
    return {
      particleColor: '#06B6D4', // Cyan 500
      glowColor: 'rgba(6, 182, 212, 0.6)',
      particleCount: scenario === 'spike' ? 5 : 2,
      baseDurationSeconds: Math.max(0.6, 1.6 / speedMultiplier),
      isBlocked: false,
      statusLabel: 'Persistencia / Query'
    };
  }

  // 6. Tráfico HTTP / HTTPS Estándar (200 OK)
  const count = scenario === 'spike' ? 6 : 3;
  const baseDuration = scenario === 'spike' ? 1.0 : 1.8;

  return {
    particleColor: '#10B981', // Emerald 500
    glowColor: 'rgba(16, 185, 129, 0.6)',
    particleCount: count,
    baseDurationSeconds: Math.max(0.4, baseDuration / speedMultiplier),
    isBlocked: false,
    statusLabel: '200 OK'
  };
}
