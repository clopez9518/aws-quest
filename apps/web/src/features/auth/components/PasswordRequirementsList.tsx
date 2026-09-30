import { Check, Circle } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

export interface PasswordRule {
  id: string;
  label: string;
  isMet: boolean;
}

export interface PasswordRequirementsListProps {
  password?: string;
  className?: string;
}

export function validatePasswordRules(password: string = '') {
  const hasMinLength = password.length >= 8 && password.length <= 128;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9]|[^a-zA-Z0-9]/.test(password);

  const rules: PasswordRule[] = [
    {
      id: 'min-length',
      label: 'Mínimo 8 caracteres',
      isMet: hasMinLength
    },
    {
      id: 'uppercase',
      label: 'Al menos una letra mayúscula (A-Z)',
      isMet: hasUppercase
    },
    {
      id: 'lowercase',
      label: 'Al menos una letra minúscula (a-z)',
      isMet: hasLowercase
    },
    {
      id: 'number-symbol',
      label: 'Al menos un número (0-9) o símbolo especial',
      isMet: hasNumberOrSymbol
    }
  ];

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumberOrSymbol;

  return {
    rules,
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumberOrSymbol
  };
}

export function PasswordRequirementsList({
  password = '',
  className
}: PasswordRequirementsListProps) {
  const { rules } = validatePasswordRules(password);

  return (
    <div
      data-testid="password-requirements-list"
      aria-label="Reglas de seguridad de contraseña"
      className={cn(
        'mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/80 border border-slate-200 dark:border-slate-800 space-y-1.5 transition-all duration-200 text-[11px]',
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        Requisitos de la contraseña:
      </p>

      <ul className="space-y-1" role="list">
        {rules.map((rule) => (
          <li
            key={rule.id}
            data-testid={`rule-${rule.id}`}
            className={cn(
              'flex items-center space-x-1.5 transition-colors duration-150',
              rule.isMet
                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {rule.isMet ? (
              <Check className="w-3 h-3 shrink-0 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            ) : (
              <Circle className="w-2.5 h-2.5 shrink-0 text-slate-300 dark:text-slate-600 stroke-[2]" />
            )}
            <span className={cn(rule.isMet && 'text-emerald-700 dark:text-emerald-300')}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
