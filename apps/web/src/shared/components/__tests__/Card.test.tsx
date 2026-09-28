import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card Components', () => {
  it('debe renderizar la estructura completa de Card modular', () => {
    render(
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Título del Desafío</CardTitle>
          <CardDescription>Descripción breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Contenido principal del laboratorio</p>
        </CardContent>
        <CardFooter>
          <span>200 XP</span>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { name: /título del desafío/i })).toBeInTheDocument();
    expect(screen.getByText(/descripción breve/i)).toBeInTheDocument();
    expect(screen.getByText(/contenido principal del laboratorio/i)).toBeInTheDocument();
    expect(screen.getByText(/200 xp/i)).toBeInTheDocument();
  });
});
