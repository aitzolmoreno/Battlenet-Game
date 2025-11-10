import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cell from '../../src/components/Cell';
import type { Player } from '../../src/components/Player';
import { describe, test, expect, jest } from '@jest/globals';

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

    expect(screen.getByText('Ship')).toBeTruthy();
  });

  test('renders ship emoji when value starts with ship: and revealShips is true', () => {
    render(
      <Cell
        index={0}
        player={mockPlayer}
        value="ship:carrier"
        updateBoard={() => {}}
        revealShips
      />
    );

    expect(screen.getByText('🚢')).toBeTruthy();
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

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('X');
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

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('X');
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

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('O');
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

    const button = screen.getByRole('button');
    expect(button.textContent).toBe('');
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

    expect(screen.getByText('Default')).toBeTruthy();
  });

  test('calls updateBoard with attack action when clicked in normal mode', () => {
    const mockUpdateBoard = jest.fn();
    
    render(
      <Cell
        index={5}
        player={mockPlayer}
        value={null}
        updateBoard={mockUpdateBoard}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockUpdateBoard).toHaveBeenCalledWith(5, mockPlayer, 'attack');
  });

  test('calls onPlaceShip when clicked in placement mode', () => {
    const mockOnPlaceShip = jest.fn();
    const mockUpdateBoard = jest.fn();
    
    render(
      <Cell
        index={10}
        player={mockPlayer}
        value={null}
        updateBoard={mockUpdateBoard}
        isPlacementMode={true}
        placingShipId="carrier"
        placingShipLength={5}
        onPlaceShip={mockOnPlaceShip}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnPlaceShip).toHaveBeenCalledWith(10, mockPlayer, 'carrier', 5);
    expect(mockUpdateBoard).not.toHaveBeenCalled();
  });

  test('does not call onPlaceShip when not in placement mode', () => {
    const mockOnPlaceShip = jest.fn();
    const mockUpdateBoard = jest.fn();
    
    render(
      <Cell
        index={10}
        player={mockPlayer}
        value={null}
        updateBoard={mockUpdateBoard}
        isPlacementMode={false}
        placingShipId="carrier"
        placingShipLength={5}
        onPlaceShip={mockOnPlaceShip}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnPlaceShip).not.toHaveBeenCalled();
    expect(mockUpdateBoard).toHaveBeenCalled();
  });

  test('does not call onPlaceShip when no ship is selected', () => {
    const mockOnPlaceShip = jest.fn();
    const mockUpdateBoard = jest.fn();
    
    render(
      <Cell
        index={10}
        player={mockPlayer}
        value={null}
        updateBoard={mockUpdateBoard}
        isPlacementMode={true}
        placingShipId={null}
        onPlaceShip={mockOnPlaceShip}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnPlaceShip).not.toHaveBeenCalled();
    expect(mockUpdateBoard).toHaveBeenCalled();
  });
});

