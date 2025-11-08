import React from 'react';
import { render, screen } from '@testing-library/react';
import Cell from '../../src/components/Cell';
import type { Player } from '../../src/components/Player';
import { describe, test, expect } from 'vitest'; // or 'jest' depending on your runner

describe('Cell component renderContent', () => {
  const mockPlayer: Player = "A";

  test('renders children when revealShips is true', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Hit"
        updateBoard={() => {}}
        revealShips
      >
        Ship
      </Cell>
    );

    expect(screen.getByText('Ship')).toBeInTheDocument();
  });

  test('renders "X" when isAttackView and value is "Attck"', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Attck"
        updateBoard={() => {}}
        isAttackView
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('X');
  });

  test('renders "X" when isAttackView and value is "Hit"', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Hit"
        updateBoard={() => {}}
        isAttackView
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('X');
  });

  test('renders "O" when isAttackView and value is "Miss"', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Miss"
        updateBoard={() => {}}
        isAttackView
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('O');
  });

  test('renders empty string when isAttackView and value is something else', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Other"
        updateBoard={() => {}}
        isAttackView
      />
    );

    // renderContent returns null -> button is empty
    expect(screen.getByRole('button')).toHaveTextContent('');
  });

  test('renders children by default when not attack view and revealShips is false', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="Attck"
        updateBoard={() => {}}
      >
        Default
      </Cell>
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
