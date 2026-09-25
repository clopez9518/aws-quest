import { useState, useMemo } from 'react';
import { Search, Layers, Network, Server } from 'lucide-react';
import { ServicePaletteItem } from '../../canvas/types/canvas.types';
import { useCanvasStore } from '../../canvas/stores/useCanvasStore';
import { ServicePaletteItemCard } from './ServicePaletteItemCard';
import { cn } from '../../../shared/utils/cn';

interface ServicePaletteProps {
  allowedServices: ServicePaletteItem[];
}

export function ServicePalette({ allowedServices }: ServicePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'network'>('services');
  const nodes = useCanvasStore((state) => state.nodes);

  // Mapear cantidad actual de instancias instanciadas por serviceCode
  const nodeCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const node of nodes) {
      const code = node.data.serviceCode;
      counts[code] = (counts[code] || 0) + 1;
    }
    return counts;
  }, [nodes]);

  // Discriminar entre Servicios Gestionados y Recursos de Red
  const { managedServices, networkServices } = useMemo(() => {
    const managed: ServicePaletteItem[] = [];
    const network: ServicePaletteItem[] = [];

    for (const s of allowedServices) {
      const isNet =
        s.kind === 'NetworkInfrastructure' ||
        s.kind === 'SecurityPolicy' ||
        s.category?.toLowerCase() === 'networkvpc' ||
        s.code.startsWith('NET_');

      if (isNet) {
        network.push(s);
      } else {
        managed.push(s);
      }
    }

    return { managedServices: managed, networkServices: network };
  }, [allowedServices]);

  // Determinar servicios a mostrar según tab o búsqueda
  const currentPool = useMemo(() => {
    if (searchQuery.trim()) {
      return allowedServices; // En búsqueda, buscar en todo el catálogo
    }
    return activeTab === 'services' ? managedServices : networkServices;
  }, [searchQuery, activeTab, allowedServices, managedServices, networkServices]);

  // Filtrar por consulta de búsqueda
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return currentPool;
    const q = searchQuery.toLowerCase();
    return currentPool.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [currentPool, searchQuery]);

  // Agrupar por categoría
  const groupedServices = useMemo(() => {
    const groups: Record<string, ServicePaletteItem[]> = {};
    for (const service of filteredServices) {
      const cat = service.category || 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(service);
    }
    return groups;
  }, [filteredServices]);

  const categories = Object.keys(groupedServices).sort();

  return (
    <div data-testid="service-palette" className="flex flex-col h-full space-y-3">
      {/* Selector de Pestañas (Servicios vs Redes) */}
      {!searchQuery && networkServices.length > 0 && (
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={cn(
              'flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'services'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Servicios ({managedServices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={cn(
              'flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'network'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Redes ({networkServices.length})</span>
          </button>
        </div>
      )}

      {/* Buscador de servicios */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar servicios..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Lista de servicios agrupados */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No se encontraron recursos autorizados
          </div>
        ) : (
          categories.map((category) => (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Layers className="w-3 h-3 text-amber-500" />
                <span>{category}</span>
              </div>

              <div className="space-y-1.5">
                {groupedServices[category].map((service) => (
                  <ServicePaletteItemCard
                    key={service.code}
                    service={service}
                    currentCount={nodeCountMap[service.code] || 0}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
