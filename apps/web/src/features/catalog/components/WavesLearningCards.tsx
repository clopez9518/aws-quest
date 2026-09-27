import React from 'react';
import { UnitResponseDto } from '../types/catalog.types';
import { ArrowRight, Server, Cloud, ShieldCheck } from 'lucide-react';

interface WavesLearningCardsProps {
  units: UnitResponseDto[];
  selectedWave: number | null;
  onSelectWave: (wave: number | null) => void;
}

interface WaveConfig {
  waveNumber: number;
  label: string;
  tag: string;
  title: string;
  description: string;
  unitRange: [number, number];
  icon: React.ReactNode;
  accentColor: string;
}

const WAVES_CONFIG: WaveConfig[] = [
  {
    waveNumber: 1,
    label: 'OLA 01',
    tag: 'FUNDAMENTOS',
    title: 'Infraestructura y Redes',
    description: 'Unidades 1 a 5: VPC, Subnets, Routing, Cómputo EC2, Almacenamiento S3 y Alta Disponibilidad L7.',
    unitRange: [1, 5],
    icon: <Server className="w-4 h-4 text-[#38BDF8]" />,
    accentColor: 'border-[#38BDF8]/40 hover:border-[#38BDF8]',
  },
  {
    waveNumber: 2,
    label: 'OLA 02',
    tag: 'DESACOPLADO',
    title: 'Serverless, Eventos y Edge',
    description: 'Unidades 6 a 8: AWS Lambda, SQS/SNS, EventBridge, CloudFront y arquitecturas sin servidor.',
    unitRange: [6, 8],
    icon: <Cloud className="w-4 h-4 text-[#8B5CF6]" />,
    accentColor: 'border-[#8B5CF6]/40 hover:border-[#8B5CF6]',
  },
  {
    waveNumber: 3,
    label: 'OLA 03',
    tag: 'EMPRESA',
    title: 'Modernización & Capstones',
    description: 'Unidades 9 a 12: Well-Architected Reviews, Desastres Multi-Región, Cost Optimization y War Games.',
    unitRange: [9, 12],
    icon: <ShieldCheck className="w-4 h-4 text-[#FF9900]" />,
    accentColor: 'border-[#FF9900]/40 hover:border-[#FF9900]',
  },
];

export const WavesLearningCards: React.FC<WavesLearningCardsProps> = ({
  units,
  selectedWave,
  onSelectWave,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <span className="text-[#FF9900]">⚡</span>
          <span>Olas de Aprendizaje Técnico</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Selecciona una ola para filtrar el currículo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {WAVES_CONFIG.map((wave) => {
          const waveUnits = units.filter(
            (u) => u.orderIndex >= wave.unitRange[0] && u.orderIndex <= wave.unitRange[1]
          );
          const waveChallenges = waveUnits.flatMap((u) => u.challenges);
          const totalChallenges = waveChallenges.length;
          const completedChallenges = waveChallenges.filter(
            (c) => c.userProgress?.status === 'completed' || (c.userProgress?.highScore ?? 0) >= 70
          ).length;
          const percentage = totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0;
          const isSelected = selectedWave === wave.waveNumber;

          return (
            <button
              key={wave.waveNumber}
              type="button"
              onClick={() => onSelectWave(isSelected ? null : wave.waveNumber)}
              className={`p-4 rounded-xl text-left transition-all duration-150 border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#1F2937] border-[#FF9900] shadow-glow-amber/20 ring-1 ring-[#FF9900]'
                  : 'bg-[#111827] border-[#374151] hover:bg-[#171B26] hover:border-slate-500'
              }`}
            >
              <div>
                {/* Header de la Card */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {wave.label} • {wave.tag}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      percentage >= 75
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                        : percentage > 0
                        ? 'bg-sky-950/60 text-sky-300 border-sky-700/60'
                        : 'bg-[#1F2937] text-slate-400 border-[#374151]'
                    }`}
                  >
                    {percentage > 0 ? `${percentage}% Completado` : 'Acceso Abierto'}
                  </span>
                </div>

                {/* Título y Descripción */}
                <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-1.5">
                  {wave.icon}
                  <span>{wave.title}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {wave.description}
                </p>
              </div>

              {/* Footer con Métrica y Flecha */}
              <div className="mt-4 pt-3 border-t border-[#374151]/60 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-300">
                  <strong className="text-slate-100">{completedChallenges}/{totalChallenges}</strong> Desafíos superados
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#FF9900] translate-x-1' : 'text-slate-500'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
