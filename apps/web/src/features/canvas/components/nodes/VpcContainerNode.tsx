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
          ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 bg-sky-950/20 shadow-glow-cyan/20'
          : 'border-[#38BDF8]/50 bg-sky-950/10 hover:border-[#38BDF8]/80'
      )}
    >
      <NodeResizer
        minWidth={480}
        minHeight={300}
        isVisible={selected}
        color="#38BDF8"
        lineClassName="border-[#38BDF8]"
        handleClassName="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm border border-[#111827] shadow-sm"
      />
      {/* Handles superiores */}
      <Handle
        type="target"
        position={Position.Top}
        id="vpc-target-top"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="vpc-source-top"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Handles laterales */}
      <Handle
        type="target"
        position={Position.Left}
        id="vpc-target-left"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="vpc-source-left"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="vpc-target-right"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="vpc-source-right"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />

      {/* Cabecera de la VPC */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#38BDF8]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B0F19] p-1.5 flex items-center justify-center text-[#38BDF8] border border-[#38BDF8]/40 shadow-inner">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-sky-200">
                {data.name || 'Virtual Private Cloud (VPC)'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950/80 text-sky-300 border border-sky-700/60">
                {cidr}
              </span>
            </div>
            <span className="text-[10px] text-sky-400/80 font-mono">
              ID: {id}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="nodrag nopan p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
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
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="vpc-source-bottom"
        className="w-3 h-3 rounded-full bg-[#38BDF8] border-2 border-[#111827] transition-transform hover:scale-125 !cursor-crosshair"
      />
    </div>
  );
}

