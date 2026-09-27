import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Trash2,
  ShieldCheck,
  TrendingUp,
  Layers,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AwsCanvasNode } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';

export function AwsServiceNode({
  id,
  data,
  selected
}: NodeProps<AwsCanvasNode>) {
  const removeNode = useCanvasStore((state) => state.removeNode);
  const updateNodeConfig = useCanvasStore((state) => state.updateNodeConfig);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const visualStatus = data.visualStatus || 'default';
  const serviceCode = data.serviceCode?.toUpperCase();
  const isEc2 = serviceCode === 'AWS_EC2';
  const isRds = serviceCode === 'AWS_RDS';
  const isS3 = serviceCode === 'AWS_S3';

  // Configuración de bordes y fondos según el estado visual y selección (Stitch Tokens)
  const statusStyles = {
    default: selected
      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-glow-amber/20 scale-[1.02] bg-[#111827]'
      : 'border-[#374151] hover:border-slate-500 bg-[#111827] shadow-elevation-card hover:shadow-md',
    selected:
      'border-amber-500 ring-2 ring-amber-500/40 shadow-glow-amber/20 scale-[1.02] bg-[#111827]',
    pass: 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/40 shadow-emerald-500/10',
    error:
      'border-red-500 ring-2 ring-red-500/40 bg-rose-950/40 animate-pulse shadow-rose-500/10',
    warning:
      'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/40 shadow-amber-500/10'
  };

  return (
    <div
      role="region"
      aria-label={`Servicio AWS ${data.name || data.serviceCode}`}
      className={cn(
        'relative rounded-xl border p-3 min-w-[180px] max-w-[240px] transition-all duration-200 select-none group',
        statusStyles[visualStatus]
      )}
    >
      {/* Handles Superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Handles Laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="source-left"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="target-right"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Cabecera del Nodo: Icono, Nombre, Categoría y Botón Eliminar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#0B0F19] p-1.5 flex items-center justify-center shrink-0 border border-[#374151] shadow-inner">
            <img
              src={data.iconUrl || '/icons/aws/default.svg'}
              alt={data.name || data.serviceCode}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/icons/aws/default.svg';
              }}
            />
          </div>
          <div className="min-w-0">
            <h4
              className="text-xs font-bold text-slate-100 truncate"
              title={data.name || data.serviceCode}
            >
              {data.name || data.serviceCode}
            </h4>
            <span className="inline-block text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider truncate">
              {data.category || 'AWS Service'}
            </span>
          </div>
        </div>

        {/* Botón de Borrado Rápido */}
        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors opacity-70 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          title="Eliminar servicio del canvas"
          aria-label="Eliminar servicio del canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Controles Interactivos de Configuración Técnica */}
      <div className="mt-2.5 pt-2 border-t border-[#374151]/80 flex flex-col gap-1.5">
        {/* Configuración de EC2 */}
        {isEc2 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-label="Alternar Auto Scaling Group"
              onClick={(e) => {
                e.stopPropagation();
                updateNodeConfig(id, { autoScaling: !data.config?.autoScaling });
              }}
              className={cn(
                'nodrag nopan inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-colors cursor-pointer',
                data.config?.autoScaling
                  ? 'bg-sky-950/80 text-sky-300 border-sky-600/70 shadow-sm'
                  : 'bg-[#0B0F19] text-slate-400 border-[#374151] hover:bg-[#1F2937]'
              )}
              title="Alternar Auto Scaling Group"
            >
              <TrendingUp className="w-2.5 h-2.5" />
              Auto Scaling {data.config?.autoScaling ? 'ON' : 'OFF'}
            </button>

            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-400">Instancias:</span>
              <select
                aria-label="Cantidad de instancias EC2"
                value={data.config?.instanceCount || 1}
                onChange={(e) => {
                  e.stopPropagation();
                  updateNodeConfig(id, { instanceCount: parseInt(e.target.value, 10) });
                }}
                className="nodrag nopan text-[9px] font-mono font-bold rounded px-1.5 py-0.5 border border-[#374151] bg-[#0B0F19] text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
              >
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={3}>3x</option>
                <option value={4}>4x</option>
              </select>
            </div>
          </div>
        )}

        {/* Configuración de RDS */}
        {isRds && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-label="Alternar Redundancia Multi-AZ"
              onClick={(e) => {
                e.stopPropagation();
                updateNodeConfig(id, { isMultiAz: !data.config?.isMultiAz });
              }}
              className={cn(
                'nodrag nopan inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-colors cursor-pointer',
                data.config?.isMultiAz
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 shadow-sm'
                  : 'bg-[#0B0F19] text-slate-400 border-[#374151] hover:bg-[#1F2937]'
              )}
              title="Alternar Redundancia Multi-AZ"
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              Multi-AZ {data.config?.isMultiAz ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              aria-label="Alternar acceso público"
              onClick={(e) => {
                e.stopPropagation();
                updateNodeConfig(id, { isPublic: !data.config?.isPublic });
              }}
              className={cn(
                'nodrag nopan inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-colors cursor-pointer',
                data.config?.isPublic
                  ? 'bg-purple-950/80 text-purple-300 border-purple-600/70'
                  : 'bg-[#0B0F19] text-slate-400 border-[#374151] hover:bg-[#1F2937]'
              )}
              title="Alternar acceso público"
            >
              <Globe className="w-2.5 h-2.5" />
              {data.config?.isPublic ? 'Público' : 'Privado'}
            </button>
          </div>
        )}

        {/* Configuración de S3 */}
        {isS3 && (
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-slate-400">Clase:</span>
            <select
              aria-label="Clase de almacenamiento S3"
              value={data.config?.storageClass || 'Standard'}
              onChange={(e) => {
                e.stopPropagation();
                updateNodeConfig(id, { storageClass: e.target.value });
              }}
              className="nodrag nopan text-[9px] font-mono font-bold rounded px-1.5 py-0.5 border border-[#374151] bg-[#0B0F19] text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            >
              <option value="Standard">Standard</option>
              <option value="Intelligent-Tiering">Intelligent-Tiering</option>
              <option value="Glacier">Glacier</option>
            </select>
          </div>
        )}

        {/* Badges para otros servicios si tienen configuraciones preexistentes */}
        {!isEc2 && !isRds && !isS3 && data.config && (
          <div className="flex flex-wrap gap-1 font-mono">
            {data.config.isMultiAz && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
                <ShieldCheck className="w-2.5 h-2.5" />
                Multi-AZ
              </span>
            )}
            {data.config.autoScaling && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-950/60 text-sky-300 border border-sky-700/50">
                <TrendingUp className="w-2.5 h-2.5" />
                Auto Scaling
              </span>
            )}
            {data.config.instanceCount && data.config.instanceCount > 1 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-700/50">
                <Layers className="w-2.5 h-2.5" />
                x{data.config.instanceCount} inst.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Banner Inferior de Estado / Diagnóstico */}
      {data.statusMessage && visualStatus !== 'default' && (
        <div
          className={cn(
            'mt-2 p-1.5 rounded text-[10px] font-mono flex items-center gap-1.5 border',
            visualStatus === 'pass' &&
              'bg-emerald-950/70 border-emerald-600/70 text-emerald-300',
            visualStatus === 'error' &&
              'bg-rose-950/70 border-rose-600/70 text-rose-300',
            visualStatus === 'warning' &&
              'bg-amber-950/70 border-amber-600/70 text-amber-300'
          )}
        >
          {visualStatus === 'pass' && <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />}
          {visualStatus === 'error' && <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400" />}
          {visualStatus === 'warning' && <Info className="w-3 h-3 shrink-0 text-amber-400" />}
          <span className="truncate">{data.statusMessage}</span>
        </div>
      )}

      {/* Handles Inferiores */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="target-bottom"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="w-3 h-3 rounded-full bg-[#FF9900] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
    </div>
  );
}

