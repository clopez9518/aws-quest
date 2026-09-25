import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2, ShieldCheck, Plus, X } from 'lucide-react';
import { AwsCanvasNode, SecurityGroupRuleDto } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';

interface PresetRule {
  label: string;
  protocol: string;
  port: number;
  source: string;
  description: string;
}

const COMMON_PRESETS: PresetRule[] = [
  {
    label: 'PostgreSQL (5432) <- EC2',
    protocol: 'TCP',
    port: 5432,
    source: 'AWS_EC2',
    description: 'PostgreSQL desde instancias EC2'
  },
  {
    label: 'MySQL / Aurora (3306) <- EC2',
    protocol: 'TCP',
    port: 3306,
    source: 'AWS_EC2',
    description: 'MySQL desde instancias EC2'
  },
  {
    label: 'HTTP (80) <- Internet',
    protocol: 'TCP',
    port: 80,
    source: '0.0.0.0/0',
    description: 'HTTP abierto a Internet'
  },
  {
    label: 'HTTPS (443) <- Internet',
    protocol: 'TCP',
    port: 443,
    source: '0.0.0.0/0',
    description: 'HTTPS abierto a Internet'
  },
  {
    label: 'SSH (22) <- EC2',
    protocol: 'TCP',
    port: 22,
    source: 'AWS_EC2',
    description: 'SSH de administración desde EC2'
  }
];

export function SecurityGroupNode({
  id,
  data,
  selected
}: NodeProps<AwsCanvasNode>) {
  const removeNode = useCanvasStore((state) => state.removeNode);
  const updateNodeConfig = useCanvasStore((state) => state.updateNodeConfig);

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customPort, setCustomPort] = useState<string>('5432');
  const [customProtocol, setCustomProtocol] = useState<string>('TCP');
  const [customSource, setCustomSource] = useState<string>('AWS_EC2');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const rules = data.config?.securityGroupRules || [];

  const handleAddPresetRule = (e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = COMMON_PRESETS[selectedPresetIndex];
    if (!preset) return;

    const newRule: SecurityGroupRuleDto = {
      direction: 'Ingress',
      protocol: preset.protocol,
      fromPort: preset.port,
      toPort: preset.port,
      source: preset.source,
      description: preset.description
    };

    const updatedRules = [...rules, newRule];
    updateNodeConfig(id, { securityGroupRules: updatedRules });
  };

  const handleAddCustomRule = (e: React.MouseEvent) => {
    e.stopPropagation();
    const portNum = parseInt(customPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) return;

    const newRule: SecurityGroupRuleDto = {
      direction: 'Ingress',
      protocol: customProtocol,
      fromPort: portNum,
      toPort: portNum,
      source: customSource.trim() || 'AWS_EC2',
      description: `Puerto ${portNum}/${customProtocol} desde ${customSource}`
    };

    const updatedRules = [...rules, newRule];
    updateNodeConfig(id, { securityGroupRules: updatedRules });
    setIsAddingCustom(false);
  };

  const handleDeleteRule = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updatedRules = rules.filter((_, idx) => idx !== index);
    updateNodeConfig(id, { securityGroupRules: updatedRules });
  };

  return (
    <div
      role="region"
      aria-label={`Security Group ${data.name || id}`}
      className={cn(
        'relative rounded-xl border p-3 min-w-[220px] max-w-[280px] transition-all duration-200 select-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md',
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-400'
      )}
    >
      {/* Handles Superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="sg-target-top"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="sg-source-top"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Handles Laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="sg-target-left"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="sg-source-left"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="sg-target-right"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="sg-source-right"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 p-1 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
              {data.name || 'Security Group'}
            </h4>
            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 truncate block">
              {id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          title="Eliminar Security Group"
          aria-label="Eliminar Security Group"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lista de Reglas Ingress */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            Reglas Inbound ({rules.length})
          </span>
        </div>

        {rules.length === 0 ? (
          <div className="text-[9px] text-slate-400 dark:text-slate-500 italic py-1 px-1.5 bg-slate-50 dark:bg-slate-800/40 rounded text-center border border-dashed border-slate-200 dark:border-slate-800">
            Sin reglas autorizadas (Tráfico bloqueado)
          </div>
        ) : (
          <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-0.5">
            {rules.map((r, idx) => (
              <div
                key={idx}
                className="text-[9px] font-mono px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-1 group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {r.protocol}:{r.fromPort || r.toPort || 'All'}
                  </span>
                  <span className="text-[8.5px] text-slate-500 dark:text-slate-400 truncate" title={`Origen: ${r.source}`}>
                    &larr; {r.source}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteRule(e, idx)}
                  className="nodrag nopan p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-80 group-hover:opacity-100 transition-opacity shrink-0"
                  title="Eliminar regla"
                  aria-label={`Eliminar regla puerto ${r.fromPort}`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controles para Añadir Reglas Ingress */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
        {!isAddingCustom ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <select
                aria-label="Seleccionar regla preset"
                value={selectedPresetIndex}
                onChange={(e) => setSelectedPresetIndex(parseInt(e.target.value, 10))}
                className="nodrag nopan text-[9px] font-medium flex-1 rounded px-1.5 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate"
              >
                {COMMON_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddPresetRule}
                className="nodrag nopan inline-flex items-center gap-0.5 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-[9px] font-bold transition-colors cursor-pointer shrink-0"
                title="Añadir regla seleccionada"
                aria-label="Añadir regla seleccionada"
              >
                <Plus className="w-3 h-3" />
                Añadir
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingCustom(true);
              }}
              className="nodrag nopan text-[8.5px] text-indigo-600 dark:text-indigo-400 hover:underline text-left self-start py-0.5 cursor-pointer"
            >
              + Regla personalizada...
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
                Regla Personalizada
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingCustom(false);
                }}
                className="nodrag nopan p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Cancelar regla personalizada"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-[8px] text-slate-500 dark:text-slate-400 block">Puerto</label>
                <input
                  type="number"
                  aria-label="Puerto personalizado"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  className="nodrag nopan w-full text-[9px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={1}
                  max={65535}
                />
              </div>
              <div>
                <label className="text-[8px] text-slate-500 dark:text-slate-400 block">Protocolo</label>
                <select
                  aria-label="Protocolo personalizado"
                  value={customProtocol}
                  onChange={(e) => setCustomProtocol(e.target.value)}
                  className="nodrag nopan w-full text-[9px] px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[8px] text-slate-500 dark:text-slate-400 block">Origen (Source)</label>
              <select
                aria-label="Origen del tráfico"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="nodrag nopan w-full text-[9px] px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="AWS_EC2">Instancias EC2 (AWS_EC2)</option>
                <option value="0.0.0.0/0">Internet Abierto (0.0.0.0/0)</option>
                <option value="10.0.0.0/16">VPC CIDR (10.0.0.0/16)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleAddCustomRule}
              className="nodrag nopan w-full py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold transition-colors cursor-pointer mt-0.5"
            >
              Guardar Regla
            </button>
          </div>
        )}
      </div>

      {/* Handles Inferiores */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="sg-target-bottom"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="sg-source-bottom"
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
    </div>
  );
}
