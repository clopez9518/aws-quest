import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Trash2, Network, Radio, Route, ShieldAlert } from 'lucide-react';
import { AwsCanvasNode } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';

export function GatewayNode({
  id,
  data,
  selected
}: NodeProps<AwsCanvasNode>) {
  const removeNode = useCanvasStore((state) => state.removeNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const isIgw = data.serviceCode === 'NET_IGW';
  const isNat = data.serviceCode === 'NET_NAT_GATEWAY';
  const isRouteTable = data.serviceCode === 'NET_ROUTE_TABLE';

  const Icon = isIgw ? Radio : isNat ? Network : isRouteTable ? Route : ShieldAlert;

  return (
    <div
      role="region"
      aria-label={`Componente de Red ${data.name || data.serviceCode}`}
      className={cn(
        'relative rounded-xl border p-2.5 min-w-[150px] max-w-[200px] transition-all duration-200 select-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-slate-200 dark:border-slate-700/80 hover:border-blue-400'
      )}
    >
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="gw-target-top"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="gw-source-top"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="gw-target-left"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="gw-source-left"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="gw-target-right"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="gw-source-right"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 p-1 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
              {data.name || data.serviceCode}
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
          title="Eliminar recurso"
          aria-label="Eliminar recurso"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="gw-target-bottom"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="gw-source-bottom"
        className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
    </div>
  );
}
