import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DictionaryLink } from '../DictionaryLink';
import { useDictionaryStore } from '../../stores/useDictionaryStore';

describe('DictionaryLink Component', () => {
  beforeEach(() => {
    useDictionaryStore.setState({
      isDrawerOpen: false,
      activeSlug: null,
    });
  });

  it('debe renderizar el texto o children correctamente', () => {
    render(<DictionaryLink slug="amazon-s3" label="Amazon S3" />);
    expect(screen.getByText('Amazon S3')).toBeInTheDocument();
  });

  it('debe invocar openDrawer con el slug correspondiente al hacer clic', () => {
    render(
      <DictionaryLink slug="escalabilidad-horizontal" showIcon>
        Escalabilidad Horizontal
      </DictionaryLink>
    );

    const button = screen.getByRole('button', { name: /Ver Escalabilidad Horizontal en el glosario/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('📖')).toBeInTheDocument();

    fireEvent.click(button);

    expect(useDictionaryStore.getState().isDrawerOpen).toBe(true);
    expect(useDictionaryStore.getState().activeSlug).toBe('escalabilidad-horizontal');
  });
});
