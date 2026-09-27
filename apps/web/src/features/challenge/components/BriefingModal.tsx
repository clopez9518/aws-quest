import { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Clock,
  Target,
  Building2,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Key,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useDictionaryStore } from '../../dictionary/stores/useDictionaryStore';
import { ChallengeBriefingDto } from '../types/challenge.types';

export interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  briefing?: ChallengeBriefingDto | null;
  challengeId: string;
}

const SERVICE_CODE_TO_SLUG: Record<string, string> = {
  AWS_EC2: 'amazon-ec2',
  AWS_S3: 'amazon-s3',
  AWS_RDS: 'amazon-rds',
  AWS_DYNAMODB: 'amazon-dynamodb',
  AWS_CLOUDFRONT: 'amazon-cloudfront',
  AWS_ROUTE53: 'amazon-route-53',
  AWS_ALB: 'application-load-balancer',
  AWS_NLB: 'network-load-balancer',
  AWS_ASG: 'auto-scaling-group',
  AWS_EBS: 'amazon-ebs',
  AWS_EFS: 'amazon-efs',
  AWS_LAMBDA: 'aws-lambda',
  AWS_APIGW: 'amazon-api-gateway',
  AWS_SQS: 'amazon-sqs',
  AWS_SNS: 'amazon-sns',
  AWS_EVENTBRIDGE: 'amazon-eventbridge',
  AWS_ECS: 'amazon-ecs',
  AWS_FARGATE: 'aws-fargate',
  AWS_WAF: 'aws-waf',
  AWS_SECRETS: 'aws-secrets-manager',
  AWS_CLOUDWATCH: 'amazon-cloudwatch',
  AWS_CLOUDTRAIL: 'aws-cloudtrail',
  AWS_CLOUDFORMATION: 'aws-cloudformation',
  AWS_ELASTICACHE: 'amazon-elasticache',
  AWS_AURORA: 'amazon-aurora',
  AWS_STEPFUNCTIONS: 'aws-step-functions',
  AWS_KMS: 'aws-kms',
  AWS_IAM: 'aws-iam',
  AWS_ATHENA: 'amazon-athena',
  AWS_OPENSEARCH: 'amazon-opensearch',
  AWS_COGNITO: 'amazon-cognito',
  NET_VPC: 'amazon-vpc',
  NET_SUBNET_PUB: 'subnet-publica',
  NET_SUBNET_PRIV: 'subnet-privada',
  NET_IGW: 'internet-gateway',
  NET_NATGW: 'nat-gateway',
  SEC_SG: 'security-group',
  SEC_NACL: 'network-acl',
  NET_RT: 'route-table',
  SEC_BASTION: 'bastion-host',
  NET_PEERING: 'vpc-peering',
  NET_TGW: 'transit-gateway',
  NET_CIDR: 'cidr-block',
  NET_TG: 'target-group-health-checks',
  NET_VPCE: 'vpc-endpoint-privatelink',
};

function getDictionarySlug(title: string, serviceCode?: string | null, explicitSlug?: string | null): string {
  if (explicitSlug) return explicitSlug;
  if (serviceCode && SERVICE_CODE_TO_SLUG[serviceCode.toUpperCase()]) {
    return SERVICE_CODE_TO_SLUG[serviceCode.toUpperCase()];
  }
  if (serviceCode) {
    const code = serviceCode.toLowerCase().replace(/_/g, '-');
    if (code.startsWith('aws-')) return `amazon-${code.substring(4)}`;
    if (code.startsWith('net-')) return `amazon-${code.substring(4)}`;
    return code;
  }
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function BriefingModal({
  isOpen,
  onClose,
  challengeTitle,
  briefing,
  challengeId
}: BriefingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const openDrawer = useDictionaryStore((state) => state.openDrawer);
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      const isHidden = localStorage.getItem(`awsquest_hide_briefing_${challengeId}`) === 'true';
      setDontShowAgain(isHidden);
    }
  }, [isOpen, challengeId]);

  if (!isOpen || !briefing) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`awsquest_hide_briefing_${challengeId}`, 'true');
    } else {
      localStorage.removeItem(`awsquest_hide_briefing_${challengeId}`);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-modal-title"
      data-testid="briefing-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden transition-colors duration-200"
      >
        {/* Glow decorativo Stitch */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between shrink-0 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Micro-Cápsula de Contexto
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-3 h-3 mr-1 text-slate-400" />
                  {briefing.estimatedReadTime || '30 seg'} de lectura
                </span>
              </div>
              <h2
                id="briefing-modal-title"
                className="text-base sm:text-lg font-bold text-slate-100 mt-0.5"
              >
                {challengeTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar briefing"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-sm custom-scrollbar relative z-10">
          {/* 1. Meta de Aprendizaje */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-start space-x-3">
              <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-300 mb-1 text-xs uppercase tracking-wider">
                  Meta de Aprendizaje
                </h3>
                <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                  {briefing.learningObjective}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Escenario de Negocio Real */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-300 mb-1 text-xs uppercase tracking-wider">
                  Escenario de Negocio Real
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {briefing.businessScenario}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Concepto Clave & Principio Cloud */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-purple-300 mb-1 text-xs uppercase tracking-wider">
                  Concepto Clave & Principio Cloud
                </h3>
                <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {briefing.keyConcept}
                </p>
              </div>
            </div>
          </div>

          {/* 3.1. Apartado Colapsable: Conceptos y Componentes Clave */}
          {briefing.keyComponents && briefing.keyComponents.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all duration-200">
              <button
                type="button"
                onClick={() => setIsComponentsOpen((prev) => !prev)}
                aria-expanded={isComponentsOpen}
                aria-controls="briefing-key-components-content"
                data-testid="briefing-key-components-toggle"
                className="w-full px-3.5 py-3 sm:px-4 flex items-center justify-between text-left hover:bg-slate-850/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-xs sm:text-sm">
                      Conceptos y componentes clave
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {briefing.keyComponents.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                  <span className="hidden sm:inline">
                    {isComponentsOpen ? 'Plegar' : 'Desplegar'}
                  </span>
                  {isComponentsOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
                  )}
                </div>
              </button>

              {isComponentsOpen && (
                <div
                  id="briefing-key-components-content"
                  data-testid="briefing-key-components-list"
                  className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 space-y-2.5 border-t border-slate-800 animate-in fade-in duration-150"
                >
                  {briefing.keyComponents.map((item, idx) => {
                    const isService =
                      item.category === 'service' ||
                      (item.serviceCode && item.serviceCode.startsWith('AWS_'));
                    const termSlug = getDictionarySlug(item.title, item.serviceCode, item.slug);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-100 flex items-center space-x-1.5">
                              <span>{item.title}</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => openDrawer(termSlug)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                              aria-label={`Ver ${item.title} en el glosario`}
                            >
                              <span>📖 Ver en glosario</span>
                            </button>
                          </div>
                          {item.category && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                isService
                                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                                  : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                              }`}
                            >
                              {isService ? 'Servicio AWS' : 'Concepto'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. Puntos Clave de Arquitectura (Takeaways) */}
          {briefing.keyTakeaways && briefing.keyTakeaways.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h3 className="font-bold text-slate-100 mb-2.5 flex items-center text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                Puntos Clave de Arquitectura
              </h3>
              <ul className="space-y-2">
                {briefing.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300 text-xs sm:text-sm">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
            />
            <span>No volver a mostrar automáticamente en este desafío</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all duration-150 cursor-pointer"
          >
            <span>¡Entendido, vamos al Canvas!</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
