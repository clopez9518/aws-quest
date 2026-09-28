import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SuggestedMissionWidget } from '../SuggestedMissionWidget';
import { WafPillarsRadarWidget } from '../WafPillarsRadarWidget';
import { ArchitectCliTipWidget } from '../ArchitectCliTipWidget';

describe('Catalog Sidebar Widgets', () => {
  it('SuggestedMissionWidget debe renderizar el desafío sugerido prioritario', () => {
    render(
      <MemoryRouter>
        <SuggestedMissionWidget
          topChallenge={{
            id: 'c-505',
            title: 'Base de Datos RDS Saturada',
            difficulty: 'hard',
            mode: 'fixArchitecture',
            baseXP: 300,
            requiredXP: 200,
            orderIndex: 5,
            isLocked: false,
            lockReason: null,
            userProgress: {
              status: 'inProgress',
              highScore: 60,
              hintsUsed: 1,
              completedAt: null,
            },
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('⚡ MISIÓN SUGERIDA DE HOY')).toBeInTheDocument();
    expect(screen.getByText('REINTENTO P1')).toBeInTheDocument();
    expect(screen.getByText('Base de Datos RDS Saturada')).toBeInTheDocument();
    expect(screen.getByText(/Reintentar Desafío/i)).toBeInTheDocument();
  });

  it('SuggestedMissionWidget debe renderizar el estado de felicitaciones cuando no hay misiones pendientes', () => {
    render(
      <MemoryRouter>
        <SuggestedMissionWidget topChallenge={null} />
      </MemoryRouter>
    );

    expect(screen.getByText('¡Misiones al día, Arquitecto!')).toBeInTheDocument();
    expect(screen.getByText(/Explorar Glosario Técnico/i)).toBeInTheDocument();
  });

  it('WafPillarsRadarWidget debe renderizar las métricas de los pilares WAF', () => {
    render(
      <MemoryRouter>
        <WafPillarsRadarWidget />
      </MemoryRouter>
    );

    expect(screen.getByText('Radar de Pilares WAF')).toBeInTheDocument();
    expect(screen.getByText('Seguridad')).toBeInTheDocument();
    expect(screen.getByText('Fiabilidad (Reliability)')).toBeInTheDocument();
    expect(screen.getByText('Optimización de Costos')).toBeInTheDocument();
  });

  it('ArchitectCliTipWidget debe renderizar el comando sandbox y botón de copiado', () => {
    render(<ArchitectCliTipWidget />);

    expect(screen.getByText('Tip del Arquitecto')).toBeInTheDocument();
    expect(screen.getByText(/aws rds create-db-instance-read-replica/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar comando/i })).toBeInTheDocument();
  });
});
