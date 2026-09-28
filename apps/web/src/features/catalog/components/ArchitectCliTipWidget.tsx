import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export const ArchitectCliTipWidget: React.FC = () => {
  const codeSnippet = `aws rds create-db-instance-read-replica \\
  --db-instance-identifier rds-replica-1 \\
  --source-db-instance-identifier rds-prod-master`;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] shadow-xs dark:shadow-elevation-card space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#FF9900]" />
          <span>Tip del Arquitecto</span>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(codeSnippet)}
          aria-label="Copiar comando al portapapeles"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#374151] font-mono text-[11px] text-sky-800 dark:text-[#7BD0FF] leading-relaxed overflow-x-auto select-all">
        <code>{codeSnippet}</code>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Usa el comando anterior en modo sandbox CLI para acelerar el triaje y mitigar sobrecarga en el nodo primario.
      </p>
    </div>
  );
};
