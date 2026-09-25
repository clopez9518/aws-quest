import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Trash2, Globe, Shield, Lock } from 'lucide-react';
import { AwsCanvasNode, SubnetTier } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';

export function SubnetContainerNode({
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

  const tier: SubnetTier =
    data.config?.subnetTier ||
    (data.config?.subnetType?.toLowerCase() === 'public'
      ? 'Public'
      : data.config?.subnetType?.toLowerCase() === 'isolated'
      ? 'Isolated'
      : 'Private');

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newTier = e.target.value as SubnetTier;
    const defaultCidr =
      newTier === 'Public' ? '10.0.1.0/24' : newTier === 'Private' ? '10.0.2.0/24' : '10.0.3.0/24';

    updateNodeConfig(id, {
      subnetTier: newTier,
      subnetType: newTier,
      cidrBlock: data.config?.cidrBlock || defaultCidr
    });
  };

  const cidr = data.config?.cidrBlock || (tier === 'Public' ? '10.0.1.0/24' : tier === 'Private' ? '10.0.2.0/24' : '10.0.3.0/24');

  const tierConfig = {
    Public: {
      label: 'Public Subnet',
      icon: Globe,
      border: 'border-emerald-400 dark:border-emerald-500/80',
      bg: 'bg-emerald-50/30 dark:bg-emerald-950/20',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
      headerText: 'text-emerald-900 dark:text-emerald-100',
      handleColor: 'bg-emerald-500',
      resizerColor: '#10b981',
      resizerLineClass: 'border-emerald-500'
    },
    Private: {
      label: 'Private Subnet',
      icon: Shield,
      border: 'border-blue-400/90 dark:border-blue-500/70',
      bg: 'bg-slate-50/40 dark:bg-slate-900/30',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      headerText: 'text-blue-900 dark:text-blue-100',
      handleColor: 'bg-blue-500',
      resizerColor: '#3b82f6',
      resizerLineClass: 'border-blue-500'
    },
    Isolated: {
      label: 'Isolated Subnet',
      icon: Lock,
      border: 'border-purple-400 dark:border-purple-500/80',
      bg: 'bg-purple-50/30 dark:bg-purple-950/20',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200 border-purple-200 dark:border-purple-700',
      headerText: 'text-purple-900 dark:text-purple-100',
      handleColor: 'bg-purple-500',
      resizerColor: '#8b5cf6',
      resizerLineClass: 'border-purple-500'
    }
  }[tier];

  const Icon = tierConfig.icon;

  return (
    <div
      role="region"
      aria-label={`${tierConfig.label} ${id}`}
      className={cn(
        'relative rounded-xl border-2 border-dashed p-3 transition-all duration-200 select-none w-full h-full min-w-[240px] min-h-[200px]',
        tierConfig.border,
        tierConfig.bg,
        selected && 'ring-2 ring-amber-500/40 shadow-md'
      )}
    >
      <NodeResizer
        minWidth={240}
        minHeight={200}
        isVisible={selected}
        color={tierConfig.resizerColor}
        lineClassName={tierConfig.resizerLineClass}
        handleClassName="w-2.5 h-2.5 rounded-sm border border-white dark:border-slate-900 shadow-sm"
      />
      {/* Handles superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="subnet-target-top"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="subnet-source-top"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />

      {/* Handles laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="subnet-target-left"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="subnet-source-left"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="subnet-target-right"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="subnet-source-right"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />

      {/* Cabecera de la Subred */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('p-1 rounded-md border', tierConfig.badgeBg)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs font-bold truncate', tierConfig.headerText)}>
                {data.name || tierConfig.label}
              </span>
              <span className={cn('px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold border', tierConfig.badgeBg)}>
                {cidr}
              </span>
              <select
                aria-label="Seleccionar tipo de subred"
                value={tier}
                onChange={handleTierChange}
                className={cn(
                  'nodrag nopan text-[10px] font-semibold rounded px-1.5 py-0.5 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors',
                  tierConfig.badgeBg
                )}
              >
                <option value="Public" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Public</option>
                <option value="Private" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Private</option>
                <option value="Isolated" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Isolated</option>
              </select>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block">
              ID: {id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          title="Eliminar Subred"
          aria-label="Eliminar Subred"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Handles inferiores */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="subnet-target-bottom"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="subnet-source-bottom"
        className={cn(
          'w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair',
          tierConfig.handleColor
        )}
      />
    </div>
  );
}
