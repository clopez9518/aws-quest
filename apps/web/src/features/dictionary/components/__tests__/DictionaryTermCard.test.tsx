import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DictionaryTermCard } from '../DictionaryTermCard';
import { DictionaryTermSummary } from '../../types/dictionary.types';

describe('DictionaryTermCard Component', () => {
  const mockTerm: DictionaryTermSummary = {
    slug: 'amazon-ec2',
    title: 'Amazon EC2',
    serviceCode: 'AWS_EC2',
    category: 'service',
    shortDefinition: 'Servicio de computación elástica escalable y redimensionable en la nube.',
    pillar: 'Reliability',
    associatedChallengesCount: 2,
    relatedTermsCount: 5,
    displayOrder: 1,
  };

  const defaultProps = {
    term: mockTerm,
    onOpenDetail: vi.fn(),
  };

  it('debe renderizar el título, resumen, código de servicio y categoría', () => {
    render(<DictionaryTermCard {...defaultProps} />);

    expect(screen.getByText('Amazon EC2')).toBeInTheDocument();
    expect(screen.getByText('AWS_EC2')).toBeInTheDocument();
    expect(screen.getByText('Servicio AWS')).toBeInTheDocument();
    expect(screen.getByText(/Servicio de computación elástica/i)).toBeInTheDocument();
    expect(screen.getByText('Fiabilidad')).toBeInTheDocument();
  });

  it('debe invocar onOpenDetail al hacer clic en la tarjeta', () => {
    const onOpenDetail = vi.fn();
    render(<DictionaryTermCard {...defaultProps} onOpenDetail={onOpenDetail} />);

    const card = screen.getByRole('article', { name: /Término: Amazon EC2/i });
    fireEvent.click(card);

    expect(onOpenDetail).toHaveBeenCalledWith('amazon-ec2');
  });

  it('debe invocar onOpenDetail al hacer clic en el botón de acción "Ficha"', () => {
    const onOpenDetail = vi.fn();
    render(<DictionaryTermCard {...defaultProps} onOpenDetail={onOpenDetail} />);

    const button = screen.getByRole('button', { name: /Ver ficha técnica de Amazon EC2/i });
    fireEvent.click(button);

    expect(onOpenDetail).toHaveBeenCalledWith('amazon-ec2');
  });
});
