import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceHeader } from '../WorkspaceHeader';

describe('WorkspaceHeader Component', () => {
  const defaultProps = {
    title: 'Arquitectura Web Resiliente',
    difficulty: 'intermediate' as const,
    mode: 'builder' as const,
    baseXP: 150,
    totalHints: 3,
    unlockedHintsCount: 1,
    nodeCount: 2,
    onOpenHints: vi.fn(),
    onSubmit: vi.fn()
  };

  it('debe renderizar el título del desafío y los badges de dificultad y XP', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Arquitectura Web Resiliente')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText('+150 XP')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });

  it('debe mostrar el contador de pistas y responder al clic', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} />
      </MemoryRouter>
    );

    const hintsButton = screen.getByRole('button', { name: /abrir pistas/i });
    expect(hintsButton).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();

    fireEvent.click(hintsButton);
    expect(defaultProps.onOpenHints).toHaveBeenCalledTimes(1);
  });

  it('debe habilitar el botón "Enviar solución" cuando hay nodos en el canvas', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} nodeCount={3} />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /enviar solución/i });
    expect(submitButton).not.toBeDisabled();
    expect(screen.getByText(/Enviar solución \(3\)/)).toBeInTheDocument();

    fireEvent.click(submitButton);
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar el botón "Enviar solución" cuando el canvas no contiene nodos', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} nodeCount={0} />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /enviar solución/i });
    expect(submitButton).toBeDisabled();
  });

  it('debe renderizar el botón de Briefing y responder al clic', () => {
    const onOpenBriefing = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} onOpenBriefing={onOpenBriefing} />
      </MemoryRouter>
    );

    const briefingButton = screen.getByRole('button', { name: /abrir briefing/i });
    expect(briefingButton).toBeInTheDocument();

    fireEvent.click(briefingButton);
    expect(onOpenBriefing).toHaveBeenCalledTimes(1);
  });

  it('no debe renderizar el botón de Simular Tráfico por defecto (oculto para el usuario)', () => {
    const onToggleSimulation = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} onToggleSimulation={onToggleSimulation} isSimulating={false} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /iniciar simulación de tráfico/i })).not.toBeInTheDocument();
  });

  it('debe renderizar el botón de Simular Tráfico y responder al clic cuando showSimulation es true', () => {
    const onToggleSimulation = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} showSimulation={true} onToggleSimulation={onToggleSimulation} isSimulating={false} />
      </MemoryRouter>
    );

    const simButton = screen.getByRole('button', { name: /iniciar simulación de tráfico/i });
    expect(simButton).toBeInTheDocument();
    expect(screen.getByText('Simular')).toBeInTheDocument();

    fireEvent.click(simButton);
    expect(onToggleSimulation).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar el botón de Caso de Negocio y responder al clic', () => {
    const onOpenBusinessCase = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} onOpenBusinessCase={onOpenBusinessCase} />
      </MemoryRouter>
    );

    const businessCaseButton = screen.getByRole('button', { name: /abrir caso de negocio/i });
    expect(businessCaseButton).toBeInTheDocument();
    expect(screen.getByText('Caso de Negocio')).toBeInTheDocument();

    fireEvent.click(businessCaseButton);
    expect(onOpenBusinessCase).toHaveBeenCalledTimes(1);
  });

  it('no debe renderizar el botón de Caso de Negocio si onOpenBusinessCase no está provisto', () => {
    render(
      <MemoryRouter>
        <WorkspaceHeader {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /abrir caso de negocio/i })).not.toBeInTheDocument();
  });
});

