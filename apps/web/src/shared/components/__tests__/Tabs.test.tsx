import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../Tabs';

describe('Tabs Component', () => {
  const items = [
    { id: 'builder', label: 'Architecture Builder' },
    { id: 'fix', label: 'Fix Incidente' },
    { id: 'disabled', label: 'Bloqueado', disabled: true },
  ];

  it('debe renderizar todos los tabs con roles ARIA adecuados', () => {
    render(<Tabs items={items} activeId="builder" onChange={() => {}} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /architecture builder/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /fix incidente/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('debe invocar onChange al hacer clic en un tab no activo', () => {
    const handleChange = vi.fn();
    render(<Tabs items={items} activeId="builder" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /fix incidente/i }));
    expect(handleChange).toHaveBeenCalledWith('fix');
  });

  it('no debe invocar onChange al hacer clic en un tab deshabilitado', () => {
    const handleChange = vi.fn();
    render(<Tabs items={items} activeId="builder" onChange={handleChange} />);

    const disabledTab = screen.getByRole('tab', { name: /bloqueado/i });
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
