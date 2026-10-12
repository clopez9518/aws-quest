import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Trash2, Globe, Shield, Lock, AlertTriangle } from 'lucide-react';
import { AwsCanvasNode, SubnetTier } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';
import {
  DEFAULT_SUBNET_CIDR_PRESETS,
  validateSubnetCidrInCanvas
} from '../../utils/cidrUtils';

export function SubnetContainerNode({
  id,
  data,
  selected
}: NodeProps<AwsCanvasNode>) {
  const nodes = useCanvasStore((state) => state.nodes);
  const removeNode = useCanvasStore((state) => state.removeNode);
  const updateNodeConfig = useCanvasStore((state) => state.updateNodeConfig);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const rawTier =
    data.config?.subnetTier ||
    (data.config as any)?.tier ||
    data.config?.subnetType ||
    data.subnetTier;

  const tier: SubnetTier =
    rawTier?.toLowerCase() === 'public'
      ? 'Public'
      : rawTier?.toLowerCase() === 'isolated'
      ? 'Isolated'
      : 'Private';

  const cidr =
    data.config?.cidrBlock ||
    (data.config as any)?.cidr ||
    (tier === 'Public' ? '10.0.1.0/24' : tier === 'Private' ? '10.0.2.0/24' : '10.0.3.0/24');

  const cidrValidation = validateSubnetCidrInCanvas(id, cidr, nodes);

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newTier = e.target.value as SubnetTier;
    const defaultCidr =
      newTier === 'Public' ? '10.0.1.0/24' : newTier === 'Private' ? '10.0.2.0/24' : '10.0.3.0/24';

    updateNodeConfig(id, {
      subnetTier: newTier,
      tier: newTier,
      subnetType: newTier,
      cidrBlock: data.config?.cidrBlock || (data.config as any)?.cidr || defaultCidr,
      cidr: data.config?.cidrBlock || (data.config as any)?.cidr || defaultCidr
    });
  };

  const handleCidrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newCidr = e.target.value;
    updateNodeConfig(id, {
      cidrBlock: newCidr,
      cidr: newCidr
    });
  };

  const tierConfig = {
    Public: {
      label: 'Public Subnet',
      icon: Globe,
      border: 'border-emerald-500/70',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/15',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
      headerText: 'text-emerald-900 dark:text-emerald-300',
      handleColor: 'bg-emerald-500',
      resizerColor: '#10b981',
      resizerLineClass: 'border-emerald-500'
    },
    Private: {
      label: 'Private Subnet',
      icon: Shield,
      border: 'border-[#38BDF8]/60',
      bg: 'bg-sky-50/70 dark:bg-sky-950/15',
      badgeBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
      headerText: 'text-sky-900 dark:text-sky-300',
      handleColor: 'bg-[#38BDF8]',
      resizerColor: '#38BDF8',
      resizerLineClass: 'border-[#38BDF8]'
    },
    Isolated: {
      label: 'Isolated Subnet',
      icon: Lock,
      border: 'border-[#8B5CF6]/70',
      bg: 'bg-purple-50/70 dark:bg-purple-950/15',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/60',
      headerText: 'text-purple-900 dark:text-purple-300',
      handleColor: 'bg-[#8B5CF6]',
      resizerColor: '#8B5CF6',
      resizerLineClass: 'border-[#8B5CF6]'
    }
  }[tier];

  const Icon = tierConfig.icon;

  return (
    <div
      role="region"
      aria-label={`${tierConfig.label} ${id}`}
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-3 transition-all duration-200 select-none w-full h-full min-w-[240px] min-h-[200px]',
        tierConfig.border,
        tierConfig.bg,
        selected && 'ring-2 ring-[#FF9900]/40 shadow-glow-amber/15'
      )}
    >
      <NodeResizer
        minWidth={240}
        minHeight={200}
        isVisible={selected}
        color={tierConfig.resizerColor}
        lineClassName={tierConfig.resizerLineClass}
        handleClassName="w-2.5 h-2.5 rounded-sm border border-white dark:border-[#111827] shadow-sm"
      />

      {/* Handles Superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="subnet-target-top"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="subnet-source-top"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />

      {/* Handles Laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="subnet-target-left"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="subnet-source-left"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="subnet-target-right"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="subnet-source-right"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />

      {/* Encabezado de la Subred */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300/50 dark:border-[#374151]/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-lg bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] shadow-xs">
            <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold ${tierConfig.headerText} truncate`}>
                {data.name || tierConfig.label}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border transition-colors ${
                  !cidrValidation.isValid
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-400'
                    : tierConfig.badgeBg
                }`}
                title={!cidrValidation.isValid ? cidrValidation.error || 'CIDR Inválido' : undefined}
              >
                {!cidrValidation.isValid && '⚠️ '}
                {cidr}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none cursor-pointer"
          title="Eliminar subred"
          aria-label="Eliminar subred"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selectores Rápidos: Tipo de Acceso y Rango CIDR */}
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Tipo de Acceso:</span>
          <select
            aria-label="Tipo de subred"
            value={tier}
            onChange={handleTierChange}
            className="nodrag nopan text-[9px] font-mono font-bold rounded px-1.5 py-0.5 border border-slate-200 dark:border-[#374151] bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
          >
            <option value="Public">Public (Internet)</option>
            <option value="Private">Private (Internal)</option>
            <option value="Isolated">Isolated (DB Only)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">Rango CIDR:</span>
          <select
            aria-label="Rango CIDR de subred"
            data-testid="subnet-cidr-select"
            value={cidr}
            onChange={handleCidrChange}
            className={`nodrag nopan text-[9px] font-mono font-bold rounded px-1.5 py-0.5 border bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF9900] ${
              !cidrValidation.isValid
                ? 'border-rose-400 dark:border-rose-600 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                : 'border-slate-200 dark:border-[#374151]'
            }`}
          >
            {!DEFAULT_SUBNET_CIDR_PRESETS.some((p) => p.cidr === cidr) && (
              <option value={cidr}>{cidr} (Personalizado)</option>
            )}
            {DEFAULT_SUBNET_CIDR_PRESETS.map((p) => (
              <option key={p.cidr} value={p.cidr}>
                {p.cidr}
              </option>
            ))}
          </select>
        </div>

        {/* Alerta de Solapamiento o Fuera de VPC */}
        {!cidrValidation.isValid && cidrValidation.error && (
          <div
            role="alert"
            data-testid="subnet-cidr-warning"
            className="p-1 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 flex items-start gap-1 text-[8px] text-rose-700 dark:text-rose-300"
            title={cidrValidation.error}
          >
            <AlertTriangle className="w-2.5 h-2.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-tight truncate">{cidrValidation.error}</span>
          </div>
        )}
      </div>

      {/* Contenedor interior de recursos */}
      <div className="w-full flex-1 min-h-[90px] rounded-lg border border-dashed border-slate-300/60 dark:border-slate-700/40 bg-white/40 dark:bg-[#0B0F19]/20 p-2 pointer-events-none flex flex-col justify-end">
        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right select-none">
          Subnet Scope
        </span>
      </div>

      {/* Handles Inferiores */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="subnet-target-bottom"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="subnet-source-bottom"
        className={`w-2.5 h-2.5 rounded-full ${tierConfig.handleColor} border-2 border-white dark:border-[#111827] transition-transform hover:scale-125 !cursor-crosshair`}
      />
    </div>
  );
}
