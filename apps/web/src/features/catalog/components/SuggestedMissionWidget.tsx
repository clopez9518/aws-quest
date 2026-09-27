import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle2, CircleDashed } from 'lucide-react';
import { CatalogChallengeDto } from '../types/catalog.types';

interface SuggestedMissionWidgetProps {
  topChallenge?: CatalogChallengeDto | null;
}

export const SuggestedMissionWidget: React.FC<SuggestedMissionWidgetProps> = ({
  topChallenge,
}) => {
  // Fallback a un escenario representativo de alta prioridad si no hay desafío dinámico cargado
  const challengeId = topChallenge?.id || 'challenge-505';
  const challengeTitle = topChallenge?.title || 'Incidente Crítico: Base de Datos RDS saturada sin réplicas';
  const baseXP = topChallenge?.baseXP || 300;
  const highScore = topChallenge?.userProgress?.highScore ?? 65;

  return (
    <div className="rounded-xl bg-[#111827] border border-[#374151] overflow-hidden shadow-elevation-card flex flex-col">
      {/* Miniatura Temática de Incidente (Stitch) */}
      <div className="relative h-32 bg-gradient-to-t from-[#111827] via-slate-900 to-slate-950 p-4 flex flex-col justify-between border-b border-[#374151]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
            <span>⚡ MISIÓN SUGERIDA DE HOY</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/60 font-mono">
            PRIORIDAD P1
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 bg-[#0B0F19]/80 px-2.5 py-1 rounded border border-[#374151] self-start">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>RDS_PROD_TIMEOUT_504</span>
        </div>
      </div>

      {/* Contenido del Incidente */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-100 leading-snug">
            {challengeTitle}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {highScore < 70
              ? `Tu última puntuación fue ${highScore}/100. La arquitectura no logró absorber los picos de lectura. Añadir Read Replicas desacoplará el tráfico transaccional.`
              : 'Optimiza la arquitectura de alta concurrencia y tolerancia a fallos zonales para mitigar cuellos de botella.'}
          </p>
        </div>

        {/* Checklist Táctico */}
        <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#374151]/80 space-y-1.5 text-[11px] font-mono">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Requisitos previos verificados:
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subnet Groups Multi-AZ</span>
            </span>
            <span className="text-emerald-400 font-semibold">Listo</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Parameter Group Binlog</span>
            </span>
            <span className="text-emerald-400 font-semibold">Listo</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <CircleDashed className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Read Endpoints en App Config</span>
            </span>
            <span className="text-[#FF9900] font-semibold">Pendiente</span>
          </div>
        </div>

        {/* Botón de Acción Prominente */}
        <Link
          to={`/challenges/${challengeId}`}
          className="w-full py-2.5 px-4 rounded bg-[#FF9900] hover:bg-[#FFAC1C] active:bg-[#E68A00] text-[#0B0F19] font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer text-center"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Resolver Incidente (+{baseXP} XP)</span>
        </Link>
      </div>
    </div>
  );
};
