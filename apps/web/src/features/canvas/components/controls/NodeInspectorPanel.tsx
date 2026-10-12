import {
  X,
  Sliders,
  TrendingUp,
  Layers,
  Server,
  Database,
  Network,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { SubnetTier } from '../../types/canvas.types';
import {
  DEFAULT_SUBNET_CIDR_PRESETS,
  parseIpv4Cidr,
  validateSubnetCidrInCanvas,
  numberToIp
} from '../../utils/cidrUtils';

export function NodeInspectorPanel() {
  const nodes = useCanvasStore((state) => state.nodes);
  const selectedNode = nodes.find((n) => n.selected);
  const updateNodeConfig = useCanvasStore((state) => state.updateNodeConfig);
  const updateNodeData = useCanvasStore((state) => state.updateNodeData);

  if (!selectedNode) return null;

  const { id, data } = selectedNode;
  const config = data.config || {};
  const serviceCode = data.serviceCode?.toUpperCase();
  const isAlb = serviceCode?.includes('ALB') || serviceCode?.includes('LOAD_BALANCER');
  const isEc2 = serviceCode === 'AWS_EC2';
  const isRds = serviceCode === 'AWS_RDS';
  const isS3 = serviceCode === 'AWS_S3';
  const isSubnet = serviceCode === 'NET_SUBNET' || selectedNode.type === 'subnetContainerNode';
  const isVpc = serviceCode === 'NET_VPC' || selectedNode.type === 'vpcContainerNode';

  return (
    <aside
      data-testid="node-inspector-panel"
      className="w-72 sm:w-80 bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-[#374151] flex flex-col z-20 shrink-0 select-none shadow-elevation-card animate-in slide-in-from-right duration-200"
      aria-label="Panel de inspección de propiedades"
    >
      {/* Cabecera del Inspector */}
      <div className="p-3.5 border-b border-slate-200 dark:border-[#374151] flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] p-1 flex items-center justify-center shrink-0">
            <img
              src={data.iconUrl || '/icons/aws/default.svg'}
              alt={data.name || serviceCode}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/icons/aws/default.svg';
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {data.name || serviceCode}
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate">
              ARN: arn:aws:{data.serviceCode?.toLowerCase()}:{id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            // Deseleccionar el nodo en el canvas
            useCanvasStore.getState().onNodesChange([
              { id, type: 'select', selected: false }
            ]);
          }}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors cursor-pointer"
          aria-label="Cerrar inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Título de Sección Propiedades */}
      <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-[#0B0F19]/60 text-xs font-semibold text-[#FF9900]">
        <Sliders className="w-3.5 h-3.5" />
        <span>Propiedades del Recurso</span>
      </div>

      {/* Contenido de Propiedades */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-4 text-xs">
        <div className="space-y-3.5">
          {/* Nombre editable del recurso */}
          <div className="space-y-1">
            <label htmlFor="node-name-input" className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Nombre del Recurso
            </label>
            <input
              id="node-name-input"
              type="text"
              value={data.name || ''}
              onChange={(e) => updateNodeData(id, { name: e.target.value })}
              placeholder="Nombre del componente..."
              className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#FF9900]"
            />
          </div>

          {/* Configuración específica según el servicio */}
          {isAlb && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
              <div className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1">
                <Server className="w-3 h-3" />
                <span>Configuración ALB Layer 7</span>
              </div>

              <div className="space-y-1">
                <label htmlFor="alb-scheme-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">Esquema</label>
                <select
                  id="alb-scheme-select"
                  value={config.isPublic ? 'internet-facing' : 'internal'}
                  onChange={(e) => updateNodeConfig(id, { isPublic: e.target.value === 'internet-facing' })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value="internet-facing">Internet-facing</option>
                  <option value="internal">Internal VPC only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="alb-protocol-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">Protocolo de Escucha</label>
                <select
                  id="alb-protocol-select"
                  value={config.subnetType || 'HTTP'}
                  onChange={(e) => updateNodeConfig(id, { subnetType: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value="HTTP">HTTP (Puerto 80)</option>
                  <option value="HTTPS">HTTPS (Puerto 443 con TLS)</option>
                </select>
              </div>
            </div>
          )}

          {isEc2 && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
              <div className="text-[10px] font-mono font-bold text-[#FF9900] uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Elasticidad y Cómputo EC2</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Auto Scaling Group</span>
                <button
                  type="button"
                  onClick={() => updateNodeConfig(id, { autoScaling: !config.autoScaling })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    config.autoScaling
                      ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600'
                      : 'bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 border-slate-300 dark:border-[#374151]'
                  }`}
                >
                  {config.autoScaling ? 'HABILITADO' : 'DESACTIVADO'}
                </button>
              </div>

              <div className="space-y-1">
                <label htmlFor="ec2-instances-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">Cantidad de Instancias</label>
                <select
                  id="ec2-instances-select"
                  value={config.instanceCount || 1}
                  onChange={(e) => updateNodeConfig(id, { instanceCount: parseInt(e.target.value, 10) })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value={1}>1 Instancia (Single AZ)</option>
                  <option value={2}>2 Instancias (Multi-AZ)</option>
                  <option value={3}>3 Instancias (Multi-AZ)</option>
                  <option value={4}>4 Instancias (High Availability)</option>
                </select>
              </div>
            </div>
          )}

          {isRds && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Parámetros de Base de Datos RDS</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Multi-AZ Deployment</span>
                <button
                  type="button"
                  onClick={() => updateNodeConfig(id, { isMultiAz: !config.isMultiAz })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    config.isMultiAz
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600'
                      : 'bg-white dark:bg-[#111827] text-slate-500 dark:text-slate-400 border-slate-300 dark:border-[#374151]'
                  }`}
                >
                  {config.isMultiAz ? 'ACTIVO' : 'INACTIVO'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Acceso Público Directo</span>
                <button
                  type="button"
                  onClick={() => updateNodeConfig(id, { isPublic: !config.isPublic })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                    config.isPublic
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-600'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600'
                  }`}
                >
                  {config.isPublic ? 'PÚBLICO (Inseguro)' : 'PRIVADO (Seguro)'}
                </button>
              </div>
            </div>
          )}

          {isS3 && (
            <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
              <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Bucket Storage Tier</span>
              </div>

              <div className="space-y-1">
                <label htmlFor="s3-tier-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">Clase de Almacenamiento</label>
                <select
                  id="s3-tier-select"
                  value={config.storageClass || 'Standard'}
                  onChange={(e) => updateNodeConfig(id, { storageClass: e.target.value })}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                >
                  <option value="Standard">Amazon S3 Standard</option>
                  <option value="Intelligent-Tiering">S3 Intelligent-Tiering</option>
                  <option value="Glacier">S3 Glacier Flexible Retrieval</option>
                </select>
              </div>
            </div>
          )}

          {/* Configuración de Subred (NET_SUBNET) */}
          {isSubnet && (() => {
            const currentTier: SubnetTier =
              (config.subnetTier as SubnetTier) ||
              ((config as any).tier as SubnetTier) ||
              (config.subnetType as SubnetTier) ||
              'Public';

            const currentCidr =
              config.cidrBlock || (config as any)?.cidr || (currentTier === 'Public' ? '10.0.1.0/24' : currentTier === 'Private' ? '10.0.2.0/24' : '10.0.3.0/24');

            const validation = validateSubnetCidrInCanvas(id, currentCidr, nodes);
            const parsedCidr = parseIpv4Cidr(currentCidr);

            return (
              <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
                <div className="text-[10px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Network className="w-3 h-3" />
                    <span>Configuración Subred VPC</span>
                  </div>
                  {validation.isValid ? (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Válido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-rose-600 dark:text-rose-400 font-bold">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Conflicto
                    </span>
                  )}
                </div>

                {/* Tipo de Acceso / Tier */}
                <div className="space-y-1">
                  <label htmlFor="subnet-tier-inspector-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Tipo de Acceso (Tier)
                  </label>
                  <select
                    id="subnet-tier-inspector-select"
                    value={currentTier}
                    onChange={(e) => {
                      const newTier = e.target.value as SubnetTier;
                      updateNodeConfig(id, {
                        subnetTier: newTier,
                        tier: newTier,
                        subnetType: newTier
                      });
                    }}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Public">Public (Conectada a Internet)</option>
                    <option value="Private">Private (Interna con salida vía NAT)</option>
                    <option value="Isolated">Isolated (Totalmente Aislada / DB)</option>
                  </select>
                </div>

                {/* Selector de Rango CIDR */}
                <div className="space-y-1">
                  <label htmlFor="subnet-cidr-preset-select" className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Presets de Rango CIDR
                  </label>
                  <select
                    id="subnet-cidr-preset-select"
                    value={currentCidr}
                    onChange={(e) => {
                      const newCidr = e.target.value;
                      updateNodeConfig(id, {
                        cidrBlock: newCidr,
                        cidr: newCidr
                      });
                    }}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-200 text-xs focus:outline-none"
                  >
                    {!DEFAULT_SUBNET_CIDR_PRESETS.some((p) => p.cidr === currentCidr) && (
                      <option value={currentCidr}>{currentCidr} (Personalizado)</option>
                    )}
                    {DEFAULT_SUBNET_CIDR_PRESETS.map((p) => (
                      <option key={p.cidr} value={p.cidr}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Input Manual de CIDR */}
                <div className="space-y-1">
                  <label htmlFor="subnet-cidr-manual-input" className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Bloque CIDR Manual
                  </label>
                  <input
                    id="subnet-cidr-manual-input"
                    type="text"
                    value={currentCidr}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateNodeConfig(id, {
                        cidrBlock: val,
                        cidr: val
                      });
                    }}
                    placeholder="ej. 10.0.1.0/24"
                    className={`w-full px-2.5 py-1.5 rounded font-mono text-xs focus:outline-none bg-white dark:bg-[#111827] border ${
                      !validation.isValid
                        ? 'border-rose-400 dark:border-rose-600 text-rose-600 dark:text-rose-400'
                        : 'border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100'
                    }`}
                  />
                </div>

                {/* Mensaje de validación o error */}
                {!validation.isValid && validation.error && (
                  <div
                    role="alert"
                    className="p-2 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-[10px] text-rose-700 dark:text-rose-300 flex items-start gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{validation.error}</span>
                  </div>
                )}

                {/* Métricas de Direcciones IP calculadas */}
                {parsedCidr && (
                  <div className="p-2 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Rango IP:</span>
                      <span className="text-slate-900 dark:text-slate-200 font-bold">
                        {numberToIp(parsedCidr.networkStart)} - {numberToIp(parsedCidr.networkEnd)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>IPs Utilizables (AWS):</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {parsedCidr.usableAwsIps} IPs
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 pt-0.5 leading-tight">
                      * AWS reserva 5 direcciones IP (.0, .1, .2, .3 y .255) para el router, DNS y broadcast.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Configuración de VPC (NET_VPC) */}
          {isVpc && (() => {
            const currentVpcCidr = config.cidrBlock || (config as any)?.cidr || '10.0.0.0/16';
            const childSubnets = nodes.filter((n) => n.parentId === id);

            return (
              <div className="space-y-3 p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]">
                <div className="text-[10px] font-mono font-bold text-sky-600 dark:text-[#38BDF8] uppercase tracking-wider flex items-center gap-1">
                  <Network className="w-3 h-3" />
                  <span>Virtual Private Cloud (VPC)</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="vpc-cidr-input" className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Bloque CIDR de la VPC
                  </label>
                  <input
                    id="vpc-cidr-input"
                    type="text"
                    value={currentVpcCidr}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateNodeConfig(id, {
                        cidrBlock: val,
                        cidr: val
                      });
                    }}
                    placeholder="10.0.0.0/16"
                    className="w-full px-2.5 py-1.5 rounded font-mono text-xs focus:outline-none bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="p-2 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subredes Contenidas:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                      {childSubnets.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </aside>
  );
}
