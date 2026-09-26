import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BriefingModal } from '../BriefingModal';
import { useDictionaryStore } from '../../../dictionary/stores/useDictionaryStore';
import { ChallengeBriefingDto } from '../../types/challenge.types';

describe('BriefingModal Component', () => {
  const mockBriefing: ChallengeBriefingDto = {
    estimatedReadTime: '45 seg',
    learningObjective: 'Comprender el aprovisionamiento de instancias EC2 y modelos de pricing.',
    businessScenario: 'Una startup necesita desplegar su API monolithic en una instancia virtual escalable.',
    keyConcept: 'EC2 proporciona capacidad de cómputo segura y redimensionable en la nube.',
    keyTakeaways: [
      'Selecciona el tipo de instancia según vCPU y memoria.',
      'Configura Security Groups como firewall virtual stateful.',
      'Utiliza User Data scripts para bootstrapping automatizado.'
    ]
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    challengeTitle: '101 · Mi primer servidor con EC2',
    briefing: mockBriefing,
    challengeId: 'challenge-101'
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(<BriefingModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('no debe renderizar nada si briefing es null', () => {
    const { container } = render(<BriefingModal {...defaultProps} briefing={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título, tiempo estimado y todas las 4 secciones pedagógicas', () => {
    render(<BriefingModal {...defaultProps} />);

    // Título y badge
    expect(screen.getByText('101 · Mi primer servidor con EC2')).toBeInTheDocument();
    expect(screen.getByText(/45 seg de lectura/i)).toBeInTheDocument();
    expect(screen.getByText(/Micro-Cápsula de Contexto/i)).toBeInTheDocument();

    // 1. Meta de Aprendizaje
    expect(screen.getByText('Meta de Aprendizaje')).toBeInTheDocument();
    expect(screen.getByText(/Comprender el aprovisionamiento de instancias EC2/i)).toBeInTheDocument();

    // 2. Escenario de Negocio Real
    expect(screen.getByText('Escenario de Negocio Real')).toBeInTheDocument();
    expect(screen.getByText(/Una startup necesita desplegar su API monolithic/i)).toBeInTheDocument();

    // 3. Concepto Clave & Principio Cloud
    expect(screen.getByText('Concepto Clave & Principio Cloud')).toBeInTheDocument();
    expect(screen.getByText(/EC2 proporciona capacidad de cómputo segura/i)).toBeInTheDocument();

    // 4. Puntos Clave de Arquitectura (Takeaways)
    expect(screen.getByText('Puntos Clave de Arquitectura')).toBeInTheDocument();
    expect(screen.getByText(/Selecciona el tipo de instancia según vCPU y memoria/i)).toBeInTheDocument();
    expect(screen.getByText(/Configura Security Groups como firewall virtual stateful/i)).toBeInTheDocument();
    expect(screen.getByText(/Utiliza User Data scripts para bootstrapping automatizado/i)).toBeInTheDocument();
  });

  it('debe invocar onClose al hacer clic en el botón de cerrar (X)', () => {
    render(<BriefingModal {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: /cerrar briefing/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe invocar onClose al hacer clic en el botón CTA "¡Entendido, vamos al Canvas!"', () => {
    render(<BriefingModal {...defaultProps} />);

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe guardar la preferencia en localStorage si se marca el checkbox "No volver a mostrar"', () => {
    render(<BriefingModal {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(localStorage.getItem('awsquest_hide_briefing_challenge-101')).toBe('true');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe remover la preferencia de localStorage si se desmarca el checkbox', () => {
    localStorage.setItem('awsquest_hide_briefing_challenge-101', 'true');

    render(<BriefingModal {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    const ctaBtn = screen.getByRole('button', { name: /¡Entendido, vamos al Canvas!/i });
    fireEvent.click(ctaBtn);

    expect(localStorage.getItem('awsquest_hide_briefing_challenge-101')).toBeNull();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar y alternar el acordeón de conceptos y componentes clave cuando están presentes', () => {
    const briefingWithComponents: ChallengeBriefingDto = {
      ...mockBriefing,
      keyComponents: [
        {
          title: 'Almacenamiento de objetos',
          description: 'Permite almacenar archivos como imágenes y videos sin depender de un servidor.',
          category: 'concept'
        },
        {
          title: 'Amazon S3',
          description: 'Servicio de almacenamiento de objetos escalable con durabilidad 99.999999999%.',
          serviceCode: 'AWS_S3',
          category: 'service'
        }
      ]
    };

    render(<BriefingModal {...defaultProps} briefing={briefingWithComponents} />);

    // El botón del acordeón debe estar presente y mostrar el contador (2)
    const toggleBtn = screen.getByTestId('briefing-key-components-toggle');
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText('Conceptos y componentes clave')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Inicialmente el listado está plegado
    expect(screen.queryByTestId('briefing-key-components-list')).not.toBeInTheDocument();

    // Clic para desplegar
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('briefing-key-components-list')).toBeInTheDocument();

    // Verificar contenido de las tarjetas
    expect(screen.getByText('Almacenamiento de objetos')).toBeInTheDocument();
    expect(screen.getByText(/Permite almacenar archivos como imágenes y videos/i)).toBeInTheDocument();
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
    expect(screen.getByText(/Servicio de almacenamiento de objetos escalable/i)).toBeInTheDocument();
    expect(screen.getByText('Concepto')).toBeInTheDocument();
    expect(screen.getByText('Servicio AWS')).toBeInTheDocument();

    // Clic para plegar nuevamente
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('briefing-key-components-list')).not.toBeInTheDocument();
  });

  it('debe abrir el DictionaryDrawer al hacer clic en el botón "Ver en glosario"', () => {
    const briefingWithComponents: ChallengeBriefingDto = {
      ...mockBriefing,
      keyComponents: [
        {
          title: 'Amazon S3',
          description: 'Servicio de almacenamiento de objetos escalable.',
          serviceCode: 'AWS_S3',
          category: 'service'
        }
      ]
    };

    render(<BriefingModal {...defaultProps} briefing={briefingWithComponents} />);

    // Desplegar acordeón
    const toggleBtn = screen.getByTestId('briefing-key-components-toggle');
    fireEvent.click(toggleBtn);

    const glossaryBtn = screen.getByRole('button', { name: /Ver Amazon S3 en el glosario/i });
    expect(glossaryBtn).toBeInTheDocument();

    fireEvent.click(glossaryBtn);

    // Debe abrir el drawer
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-s3');
  });

  it('debe abrir el DictionaryDrawer con el slug exacto para conceptos con propiedad slug', () => {
    const briefingWithConcept: ChallengeBriefingDto = {
      ...mockBriefing,
      keyComponents: [
        {
          title: 'Cómputo Elástico en la Nube (IaaS)',
          description: 'Capacidad de procesamiento virtual bajo demanda.',
          category: 'concept',
          slug: 'amazon-ec2'
        }
      ]
    };

    render(<BriefingModal {...defaultProps} briefing={briefingWithConcept} />);

    // Desplegar acordeón
    const toggleBtn = screen.getByTestId('briefing-key-components-toggle');
    fireEvent.click(toggleBtn);

    const glossaryBtn = screen.getByRole('button', { name: /Ver Cómputo Elástico en la Nube \(IaaS\) en el glosario/i });
    expect(glossaryBtn).toBeInTheDocument();

    fireEvent.click(glossaryBtn);

    // Debe abrir el drawer con el slug exacto
    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('amazon-ec2');
  });
});
