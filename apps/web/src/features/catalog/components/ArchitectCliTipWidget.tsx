import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export const ArchitectCliTipWidget: React.FC = () => {
  const codeSnippet = `aws rds create-db-instance-read-replica \\
  --db-instance-identifier rds-replica-1 \\
  --source-db-instance-identifier rds-prod-master`;

  return (
    <div className="p-4 rounded-xl bg-[#111827] border border-[#374151] shadow-elevation-card space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-100 uppercase tracking-wider">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#FF9900]" />
          <span>Tip del Arquitecto</span>
        </div>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(codeSnippet)}
          aria-label="Copiar comando al portapapeles"
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1F2937] transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 rounded-lg bg-[#0B0F19] border border-[#374151] font-mono text-[11px] text-[#7BD0FF] leading-relaxed overflow-x-auto select-all">
        <code>{codeSnippet}</code>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Usa el comando anterior en modo sandbox CLI para acelerar el triaje y mitigar sobrecarga en el nodo primario.
      </p>
    </div>
  );
};
