import { useState } from 'react';
import { GripVertical, AlertCircle, Layers } from 'lucide-react';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';

interface ServicePaletteItemCardProps {
  service: ServicePaletteItem;
  currentCount: number;
}

export function ServicePaletteItemCard({
  service,
  currentCount
}: ServicePaletteItemCardProps) {
  const [imgError, setImgError] = useState(false);

  const maxInstances = service.maxInstances ?? null;
  const isLimitReached = maxInstances !== null && currentCount >= maxInstances;
  const canAdd = !isLimitReached;

  const handleDragStart = (e: React.DragEvent) => {
    if (!canAdd) {
      e.preventDefault();
      return;
    }
    // Serializar el item de la paleta para que ArchitectureCanvas lo recupere al hacer drop
    e.dataTransfer.setData('application/awsquest-service', JSON.stringify(service));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getPlacementBadge = () => {
    switch (service.placementScope) {
      case 'SubnetRequired':
        return <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">Subred</span>;
      case 'VpcRoot':
        return <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">VPC</span>;
      case 'VpcAttached':
        return <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">VPC Infra</span>;
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={`palette-item-${service.code}`}
      draggable={canAdd}
      onDragStart={handleDragStart}
      className={`group relative p-2.5 rounded-xl border transition-all select-none flex items-center justify-between ${
        canAdd
          ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/70 hover:shadow-md cursor-grab active:cursor-grabbing'
          : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 opacity-60 cursor-not-allowed'
      }`}
      title={
        isLimitReached
          ? `Límite alcanzado: máximo ${maxInstances} instancia(s) permitida(s)`
          : `Arrastra ${service.name} hacia el canvas`
      }
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Icono AWS oficial con fallback */}
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
          <img
            src={imgError ? '/icons/aws/default.svg' : service.iconUrl}
            alt={service.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Nombre, categoría y PlacementScope */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
              {service.name}
            </h4>
            {getPlacementBadge()}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block truncate">
            {service.category}
          </span>
        </div>
      </div>

      {/* Badges de Límite de Instancias (RN-04) */}
      <div className="shrink-0 pl-2">
        {maxInstances !== null ? (
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center space-x-1 ${
              isLimitReached
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {isLimitReached && <AlertCircle className="w-2.5 h-2.5" />}
            <span>
              {currentCount}/{maxInstances}
            </span>
          </div>
        ) : (
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/40"
            title="Instancias ilimitadas permitidas"
          >
            <Layers className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}
