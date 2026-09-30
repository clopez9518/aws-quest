import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PasswordRequirementsList,
  validatePasswordRules
} from '../PasswordRequirementsList';

describe('validatePasswordRules', () => {
  it('debe marcar todas las reglas como falsas para string vacío', () => {
    const result = validatePasswordRules('');
    expect(result.isValid).toBe(false);
    expect(result.hasMinLength).toBe(false);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasLowercase).toBe(false);
    expect(result.hasNumberOrSymbol).toBe(false);
  });

  it('debe detectar correctamente cada regla cumplida de forma incremental', () => {
    // 1. Minúscula únicamente
    let result = validatePasswordRules('abc');
    expect(result.hasLowercase).toBe(true);
    expect(result.hasMinLength).toBe(false);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasNumberOrSymbol).toBe(false);
    expect(result.isValid).toBe(false);

    // 2. Minúscula + Mayúscula
    result = validatePasswordRules('abcABC');
    expect(result.hasLowercase).toBe(true);
    expect(result.hasUppercase).toBe(true);
    expect(result.hasMinLength).toBe(false);
    expect(result.isValid).toBe(false);

    // 3. Minúscula + Mayúscula + Número
    result = validatePasswordRules('abcABC1');
    expect(result.hasNumberOrSymbol).toBe(true);
    expect(result.hasMinLength).toBe(false);
    expect(result.isValid).toBe(false);

    // 4. Cumple 8 caracteres (válido)
    result = validatePasswordRules('abcABC12');
    expect(result.hasMinLength).toBe(true);
    expect(result.isValid).toBe(true);

    // 5. Cumple con símbolo especial en lugar de número
    result = validatePasswordRules('PassWord!');
    expect(result.hasNumberOrSymbol).toBe(true);
    expect(result.isValid).toBe(true);
  });
});

describe('PasswordRequirementsList Component', () => {
  it('debe renderizar el título de requisitos y las 4 reglas', () => {
    render(<PasswordRequirementsList password="" />);

    expect(screen.getByText(/Requisitos de la contraseña:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mínimo 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos una letra mayúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos una letra minúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Al menos un número \(0-9\) o símbolo especial/i)).toBeInTheDocument();
  });

  it('debe actualizar los indicadores visuales conforme se cumplen las reglas', () => {
    const { rerender } = render(<PasswordRequirementsList password="pass" />);

    // 'pass' cumple minúsculas pero no longitud ni mayúscula ni número
    const ruleMinLength = screen.getByTestId('rule-min-length');
    const ruleUppercase = screen.getByTestId('rule-uppercase');
    const ruleLowercase = screen.getByTestId('rule-lowercase');
    const ruleNumberSymbol = screen.getByTestId('rule-number-symbol');

    expect(ruleLowercase.className).toContain('text-emerald');
    expect(ruleMinLength.className).toContain('text-slate');
    expect(ruleUppercase.className).toContain('text-slate');
    expect(ruleNumberSymbol.className).toContain('text-slate');

    // Rerender con contraseña válida completa
    rerender(<PasswordRequirementsList password="SecurePass123!" />);

    expect(screen.getByTestId('rule-min-length').className).toContain('text-emerald');
    expect(screen.getByTestId('rule-uppercase').className).toContain('text-emerald');
    expect(screen.getByTestId('rule-lowercase').className).toContain('text-emerald');
    expect(screen.getByTestId('rule-number-symbol').className).toContain('text-emerald');
  });
});
