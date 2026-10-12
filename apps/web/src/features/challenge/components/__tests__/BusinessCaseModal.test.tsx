import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BusinessCaseModal } from '../BusinessCaseModal';
import { ArchitectureRequirement } from '../../types/challenge.types';

describe('BusinessCaseModal Component', () => {
  const mockRequirements: ArchitectureRequirement[] = [
    {
      id: 'req-1',
      type: 'required_service',
      title: 'Alta Disponibilidad en EC2',
      description: 'Configura al menos 2 instancias en subredes privadas.'
    },
    {
      id: 'req-2',
      type: 'connection',
      title: 'Balanceo de Carga con ALB',
      description: 'El ALB debe distribuir tráfico hacia el Target Group.'
    }
  ];

  const mockAllowedServices = [
    {
      code: 'AWS_EC2',
      name: 'Amazon EC2',
      category: 'Compute',
      iconUrl: '/icons/aws/ec2.svg'
    },
    {
      code: 'AWS_ALB',
      name: 'Application Load Balancer',
      category: 'Networking',
      iconUrl: '/icons/aws/alb.svg'
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    challengeTitle: '201 · Despliegue Altamente Disponible',
    description: 'La compañía GlobalPay necesita migrar su gateway de pagos sin tolerar caídas de servicio.',
    mode: 'builder' as const,
    difficulty: 'intermediate' as const,
    businessScenario: 'Procesamiento de 15,000 transacciones por segundo en horas pico de Black Friday.',
    requirements: mockRequirements,
    allowedServices: mockAllowedServices
  };

  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(<BusinessCaseModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título, dificultad, modo y descripción del problema', () => {
    render(<BusinessCaseModal {...defaultProps} />);

    expect(screen.getByText('201 · Despliegue Altamente Disponible')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText(/Builder \/ Diseño/i)).toBeInTheDocument();
    expect(screen.getByText(/Caso de Negocio & Contexto/i)).toBeInTheDocument();
    expect(
      screen.getByText('La compañía GlobalPay necesita migrar su gateway de pagos sin tolerar caídas de servicio.')
    ).toBeInTheDocument();
  });

  it('debe renderizar el escenario operativo real cuando se suministra', () => {
    render(<BusinessCaseModal {...defaultProps} />);

    expect(screen.getByText('Contexto Operacional & Carga de Trabajo')).toBeInTheDocument();
    expect(
      screen.getByText('Procesamiento de 15,000 transacciones por segundo en horas pico de Black Friday.')
    ).toBeInTheDocument();
  });

  it('debe renderizar todos los requisitos y criterios de aceptación', () => {
    render(<BusinessCaseModal {...defaultProps} />);

    expect(screen.getByText('Alta Disponibilidad en EC2')).toBeInTheDocument();
    expect(screen.getByText('Configura al menos 2 instancias en subredes privadas.')).toBeInTheDocument();
    expect(screen.getByText('Balanceo de Carga con ALB')).toBeInTheDocument();
    expect(screen.getByText('2 requerimientos')).toBeInTheDocument();
  });

  it('debe renderizar los chips de servicios autorizados', () => {
    render(<BusinessCaseModal {...defaultProps} />);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Application Load Balancer')).toBeInTheDocument();
  });

  it('debe mostrar los textos específicos cuando el modo es fixArchitecture (reparación)', () => {
    render(
      <BusinessCaseModal
        {...defaultProps}
        mode="fixArchitecture"
        difficulty="hard"
      />
    );

    expect(screen.getByText(/Incidente \/ Reparación/i)).toBeInTheDocument();
    expect(screen.getByText('Difícil')).toBeInTheDocument();
    expect(screen.getByText('Incidente de Producción y Problema Técnico')).toBeInTheDocument();
  });

  it('debe invocar onClose al hacer clic en el botón de cerrar (X)', () => {
    const onClose = vi.fn();
    render(<BusinessCaseModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByTestId('close-business-case-modal');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al hacer clic en el botón CTA inferior', () => {
    const onClose = vi.fn();
    render(<BusinessCaseModal {...defaultProps} onClose={onClose} />);

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, volver al Lienzo!/i });
    fireEvent.click(ctaBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
