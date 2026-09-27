import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight } from 'lucide-react';

interface PillarMetric {
  name: string;
  code: string;
  percentage: number;
  colorClass: string;
}

const DEFAULT_PILLARS: PillarMetric[] = [
  { name: 'Seguridad', code: 'security', percentage: 92, colorClass: 'bg-rose-500' },
  { name: 'Fiabilidad (Reliability)', code: 'reliability', percentage: 68, colorClass: 'bg-[#38BDF8]' },
  { name: 'Optimización de Costos', code: 'cost', percentage: 54, colorClass: 'bg-emerald-500' },
  { name: 'Excelencia Operacional', code: 'operational', percentage: 88, colorClass: 'bg-[#FF9900]' },
  { name: 'Eficiencia de Rendimiento', code: 'performance', percentage: 72, colorClass: 'bg-blue-500' },
];

export const WafPillarsRadarWidget: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-100 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-[#38BDF8]" />
          <span>Radar de Pilares WAF</span>
        </div>
        <Link
          to="/dictionary"
          className="text-[11px] font-semibold text-[#FFC082] hover:text-[#FF9900] flex items-center gap-0.5 transition-colors"
        >
          <span>Ver Glosario</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Dominio equilibrado según tus soluciones en simulaciones activas:
      </p>

      {/* Lista de Barras de Pilares */}
      <div className="space-y-2.5">
        {DEFAULT_PILLARS.map((pillar) => (
          <div key={pillar.code} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{pillar.name}</span>
              <span className="font-mono font-bold text-slate-200">{pillar.percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#0B0F19] rounded-full overflow-hidden border border-[#374151]/80">
              <div
                className={`h-full ${pillar.colorClass} rounded-full transition-all duration-700`}
                style={{ width: `${pillar.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
