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
  if (!topChallenge) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] overflow-hidden shadow-xs dark:shadow-elevation-card flex flex-col p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            ¡Misiones al día, Arquitecto!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Has completado todas las misiones recomendadas disponibles o tu progreso está al 100%.
          </p>
        </div>
        <Link
          to="/dictionary"
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1F2937] dark:hover:bg-[#374151] text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-[#374151] flex items-center justify-center space-x-2 transition-all cursor-pointer text-center"
        >
          <span>Explorar Glosario Técnico</span>
        </Link>
      </div>
    );
  }

  const challengeId = topChallenge.id;
  const challengeTitle = topChallenge.title;
  const baseXP = topChallenge.baseXP;
  const highScore = topChallenge.userProgress?.highScore ?? 0;
  const isRetry = highScore > 0 && highScore < 70;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] overflow-hidden shadow-xs dark:shadow-elevation-card flex flex-col">
      {/* Miniatura Temática de Incidente (Stitch) */}
      <div className="relative h-32 bg-gradient-to-t from-slate-100 dark:from-[#111827] via-slate-200/50 dark:via-slate-900 to-slate-200 dark:to-slate-950 p-4 flex flex-col justify-between border-b border-slate-200 dark:border-[#374151]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-600/50">
            <span>⚡ MISIÓN SUGERIDA DE HOY</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-600/60 font-mono">
            {isRetry ? 'REINTENTO P1' : 'PRIORIDAD P1'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-rose-700 dark:text-rose-400 bg-white/90 dark:bg-[#0B0F19]/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#374151] self-start shadow-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{topChallenge.mode === 'fixArchitecture' ? 'INCIDENT_RESOLVE_P1' : 'ARCHITECTURE_DEPLOY_P1'}</span>
        </div>
      </div>

      {/* Contenido del Incidente */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {challengeTitle}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {isRetry
              ? `Tu última puntuación fue ${highScore}/100. Optimiza la arquitectura para alcanzar los 70 puntos requeridos y desbloquear la bonificación de XP.`
              : 'Completa este desafío para expandir tus habilidades como Solutions Architect en AWS y ganar puntos de experiencia.'}
          </p>
        </div>

        {/* Checklist Táctico */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151]/80 space-y-1.5 text-[11px] font-mono">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
            Estado de Misión:
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Dificultad</span>
            </span>
            <span className="text-slate-900 dark:text-slate-300 font-semibold uppercase">{topChallenge.difficulty}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Recompensa</span>
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">+{baseXP} XP</span>
          </div>
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <CircleDashed className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Evaluación Topológica</span>
            </span>
            <span className="text-[#FF9900] font-semibold">{isRetry ? `${highScore} pts` : 'Pendiente'}</span>
          </div>
        </div>

        {/* Botón de Lanzamiento de Misión */}
        <Link
          to={`/challenges/${challengeId}`}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm shadow-amber-500/20 active:scale-[0.98] cursor-pointer text-center mt-1"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{isRetry ? 'Reintentar Desafío P1' : 'Iniciar Desafío Recomendado'}</span>
        </Link>
      </div>
    </div>
  );
};
