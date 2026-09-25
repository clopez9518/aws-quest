import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServicePalette } from '../ServicePalette';
import { ServicePaletteItem } from '../../../canvas/types/canvas.types';
import { useCanvasStore } from '../../../canvas/stores/useCanvasStore';

const mockServices: ServicePaletteItem[] = [
  {
    code: 'AWS_EC2',
    name: 'Amazon EC2',
    category: 'Compute',
    iconUrl: '/icons/aws/ec2.svg',
    maxInstances: 2,
    isDistractor: false
  },
  {
    code: 'AWS_RDS',
    name: 'Amazon RDS',
    category: 'Database',
    iconUrl: '/icons/aws/rds.svg',
    maxInstances: 1,
    isDistractor: false
  },
  {
    code: 'AWS_S3',
    name: 'Amazon S3',
    category: 'Storage',
    iconUrl: '/icons/aws/s3.svg',
    maxInstances: null,
    isDistractor: false
  }
];

describe('ServicePalette Component', () => {
  beforeEach(() => {
    useCanvasStore.getState().clearCanvas();
  });

  it('debe renderizar categorías y servicios autorizados', () => {
    render(<ServicePalette allowedServices={mockServices} />);

    expect(screen.getAllByText('Compute').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Database').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Storage').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('Amazon RDS')).toBeInTheDocument();
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
  });

  it('debe filtrar servicios según el término de búsqueda ingresado', () => {
    render(<ServicePalette allowedServices={mockServices} />);

    const searchInput = screen.getByPlaceholderText('Buscar servicios...');
    fireEvent.change(searchInput, { target: { value: 'rds' } });

    expect(screen.getByText('Amazon RDS')).toBeInTheDocument();
    expect(screen.queryByText('Amazon EC2')).not.toBeInTheDocument();
    expect(screen.queryByText('Amazon S3')).not.toBeInTheDocument();
  });

  it('debe mostrar el recuento de instancias y bloquear arrastre cuando se alcanza maxInstances', () => {
    // Añadir 1 instancia de RDS (maxInstances = 1)
    useCanvasStore.getState().addNode(mockServices[1], { x: 100, y: 100 });

    render(<ServicePalette allowedServices={mockServices} />);

    // RDS debe mostrar 1/1
    expect(screen.getByText('1/1')).toBeInTheDocument();

    // La tarjeta de RDS debe tener draggable = false
    const rdsCard = screen.getByText('Amazon RDS').closest('[draggable]');
    expect(rdsCard).toHaveAttribute('draggable', 'false');

    // EC2 debe mostrar 0/2 y permanecer arrastrable
    expect(screen.getByText('0/2')).toBeInTheDocument();
    const ec2Card = screen.getByText('Amazon EC2').closest('[draggable]');
    expect(ec2Card).toHaveAttribute('draggable', 'true');
  });
});
