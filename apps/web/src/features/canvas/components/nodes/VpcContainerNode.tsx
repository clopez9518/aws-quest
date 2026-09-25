import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Trash2, Network } from 'lucide-react';
import { AwsCanvasNode } from '../../types/canvas.types';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { cn } from '../../../../shared/utils/cn';

export function VpcContainerNode({
  id,
  data,
  selected
}: NodeProps<AwsCanvasNode>) {
  const removeNode = useCanvasStore((state) => state.removeNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const cidr = data.config?.cidrBlock || '10.0.0.0/16';

  return (
    <div
      role="region"
      aria-label={`Virtual Private Cloud ${data.name || id}`}
      className={cn(
        'relative rounded-2xl border-2 border-dashed p-4 transition-all duration-200 select-none w-full h-full min-w-[480px] min-h-[300px]',
        selected
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10'
          : 'border-blue-400/80 dark:border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-500 dark:hover:border-blue-400'
      )}
    >
      <NodeResizer
        minWidth={480}
        minHeight={300}
        isVisible={selected}
        color="#3b82f6"
        lineClassName="border-blue-500"
        handleClassName="w-2.5 h-2.5 bg-blue-500 rounded-sm border border-white dark:border-slate-900 shadow-sm"
      />
      {/* Handles superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="vpc-target-top"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="vpc-source-top"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Handles laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="vpc-target-left"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="vpc-source-left"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="vpc-target-right"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="vpc-source-right"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Cabecera de la VPC */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-200/60 dark:border-blue-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 p-1.5 flex items-center justify-center text-blue-600 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/60">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-blue-900 dark:text-blue-100">
                {data.name || 'Virtual Private Cloud (VPC)'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100/80 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {cidr}
              </span>
            </div>
            <span className="text-[10px] text-blue-600/80 dark:text-blue-400 font-mono">
              ID: {id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
          title="Eliminar VPC y subredes contenidas"
          aria-label="Eliminar VPC"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Handles inferiores */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="vpc-target-bottom"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="vpc-source-bottom"
        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 transition-transform hover:scale-125 !cursor-crosshair"
      />
    </div>
  );
}
