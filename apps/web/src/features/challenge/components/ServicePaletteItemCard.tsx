import { useState } from 'react';
import { GripVertical, AlertCircle, Layers, HelpCircle } from 'lucide-react';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { useDictionaryStore } from '../../dictionary/stores/useDictionaryStore';

interface ServicePaletteItemCardProps {
  service: ServicePaletteItem;
  currentCount: number;
}

function getDictionarySlug(title: string, serviceCode?: string): string {
  if (serviceCode) {
    const code = serviceCode.toLowerCase().replace(/_/g, '-');
    if (code.startsWith('aws-')) return `amazon-${code.substring(4)}`;
    if (code.startsWith('net-')) return `amazon-${code.substring(4)}`;
    return code;
  }
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-700/50">Subred</span>;
      case 'VpcRoot':
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-950/60 text-sky-300 border border-sky-700/50">VPC</span>;
      case 'VpcAttached':
        return <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">VPC Infra</span>;
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
          ? 'bg-[#111827] border-[#374151] hover:border-[#FF9900]/80 hover:bg-[#171B26] hover:shadow-md cursor-grab active:cursor-grabbing'
          : 'bg-[#0B0F19]/60 border-[#374151]/40 opacity-50 cursor-not-allowed'
      }`}
      title={
        isLimitReached
          ? `Límite alcanzado: máximo ${maxInstances} instancia(s) permitida(s)`
          : `Arrastra ${service.name} hacia el canvas`
      }
    >
      <div className="flex items-center space-x-2 min-w-0">
        <div className="text-slate-500 group-hover:text-slate-300 shrink-0">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Icono AWS oficial con fallback */}
        <div className="w-7 h-7 rounded-md bg-[#0B0F19] flex items-center justify-center p-1 shrink-0 overflow-hidden border border-[#374151]">
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
            <h4 className="text-xs font-bold text-slate-100 group-hover:text-white truncate leading-snug">
              {service.name}
            </h4>
            {getPlacementBadge()}
            {service.isDistractor && (
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
                Distractor
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openDrawer(getDictionarySlug(service.name, service.code));
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#38BDF8] rounded hover:bg-[#1F2937]"
              aria-label={`Ver ficha de ${service.name} en el glosario`}
              title={`Ver ficha de ${service.name} en el glosario`}
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block truncate">
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
                ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                : 'bg-[#1F2937] text-slate-300 border border-[#374151]'
            }`}
          >
            {isLimitReached && <AlertCircle className="w-2.5 h-2.5" />}
            <span>
              {currentCount}/{maxInstances}
            </span>
          </div>
        ) : (
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-[#0B0F19] border border-[#374151]"
            title="Instancias ilimitadas permitidas"
          >
            <Layers className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}

