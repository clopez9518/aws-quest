import { useState } from 'react';
import { GripVertical, AlertCircle, Layers, HelpCircle } from 'lucide-react';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { useDictionaryStore } from '../../dictionary/stores/useDictionaryStore';
import { resolveDictionarySlug } from '../../dictionary/utils/dictionarySlugResolver';

interface ServicePaletteItemCardProps {
  service: ServicePaletteItem;
  currentCount: number;
}

export function ServicePaletteItemCard({
  service,
  currentCount
}: ServicePaletteItemCardProps) {
  const [imgError, setImgError] = useState(false);
  const openDrawer = useDictionaryStore((state) => state.openDrawer);

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
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">Subred</span>;
      case 'VpcRoot':
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/50">VPC</span>;
      case 'VpcAttached':
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">VPC Infra</span>;
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={`palette-item-${service.code}`}
      draggable={canAdd}
      onDragStart={handleDragStart}
      className={`group relative p-2 rounded-lg border transition-all select-none flex items-center justify-between ${
        canAdd
          ? 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#374151] hover:border-[#FF9900]/80 hover:bg-slate-50 dark:hover:bg-[#171B26] hover:shadow-md cursor-grab active:cursor-grabbing'
          : 'bg-slate-100/60 dark:bg-[#0B0F19]/60 border-slate-200/60 dark:border-[#374151]/40 opacity-50 cursor-not-allowed'
      }`}
      title={
        isLimitReached
          ? `Límite alcanzado: máximo ${maxInstances} instancia(s) permitida(s)`
          : `Arrastra ${service.name} hacia el canvas`
      }
    >
      <div className="flex items-center space-x-2 min-w-0">
        <div className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 shrink-0">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Icono AWS oficial con fallback */}
        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#0B0F19] flex items-center justify-center p-1 shrink-0 overflow-hidden border border-slate-200 dark:border-[#374151]">
          <img
            src={imgError ? '/icons/aws/default.svg' : service.iconUrl}
            alt={service.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Nombre, categoría y PlacementScope */}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white truncate leading-snug">
              {service.name}
            </h4>
            {getPlacementBadge()}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openDrawer(resolveDictionarySlug(service.code, service.name, (service as any).dictionarySlug));
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#38BDF8] rounded hover:bg-slate-100 dark:hover:bg-[#1F2937]"
              aria-label={`Ver ficha de ${service.name} en el glosario`}
              title={`Ver ficha de ${service.name} en el glosario`}
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
            {service.category}
          </span>
        </div>
      </div>

      {/* Badges de Límite de Instancias (RN-04) */}
      <div className="shrink-0 pl-1.5">
        {maxInstances !== null ? (
          <div
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 ${
              isLimitReached
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                : 'bg-slate-100 dark:bg-[#1F2937] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#374151]'
            }`}
          >
            {isLimitReached && <AlertCircle className="w-2.5 h-2.5" />}
            <span>
              {currentCount}/{maxInstances}
            </span>
          </div>
        ) : (
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]"
            title="Instancias ilimitadas permitidas"
          >
            <Layers className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}
