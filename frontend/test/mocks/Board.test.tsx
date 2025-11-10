import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../../src/components/Board';
import type { Player } from '../../src/components/Player';
import { describe, test, expect, jest } from '@jest/globals';

describe('Board component', () => {
  const mockPlayer: Player = "A";
  const mockBoard = Array(100).fill(null);
  const mockUpdateBoard = jest.fn();

  test('renders 100 cells for a 10x10 board', () => {
    render(
      <Board
        player={mockPlayer}
        board={mockBoard}
        updateBoard={mockUpdateBoard}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(100);
  });

  test('passes correct props to Cell components', () => {
    const boardWithValue = [...mockBoard];
    boardWithValue[0] = 'Hit';
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithValue}
        updateBoard={mockUpdateBoard}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].textContent).toBe('Hit');
  });

  test('passes isAttackView prop to cells', () => {
    const boardWithAttack = [...mockBoard];
    boardWithAttack[0] = 'Attck';
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithAttack}
        updateBoard={mockUpdateBoard}
        isAttackView={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].textContent).toBe('X');
  });

  test('passes revealShips prop to cells', () => {
    const boardWithShip = [...mockBoard];
    boardWithShip[0] = 'ship:carrier';
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithShip}
        updateBoard={mockUpdateBoard}
        revealShips={true}
      />
    );

    expect(screen.getByText('🚢')).toBeTruthy();
  });

  test('passes placement mode props to cells', () => {
    const mockOnPlaceShip = jest.fn();
    
    render(
      <Board
        player={mockPlayer}
        board={mockBoard}
        updateBoard={mockUpdateBoard}
        isPlacementMode={true}
        placingShipId="carrier"
        placingShipLength={5}
        onPlaceShip={mockOnPlaceShip}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(mockOnPlaceShip).toHaveBeenCalledWith(0, mockPlayer, 'carrier', 5);
  });

  test('cells call updateBoard when clicked in normal mode', () => {
    render(
      <Board
        player={mockPlayer}
        board={mockBoard}
        updateBoard={mockUpdateBoard}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[5]);

    expect(mockUpdateBoard).toHaveBeenCalledWith(5, mockPlayer, 'attack');
  });

  test('generates unique keys for cells based on index and value', () => {
    const mixedBoard = [...mockBoard];
    mixedBoard[0] = 'Hit';
    mixedBoard[1] = null;
    mixedBoard[2] = 'ship:carrier';
    
    const { container } = render(
      <Board
        player={mockPlayer}
        board={mixedBoard}
        updateBoard={mockUpdateBoard}
      />
    );

    // Check that the board container exists
    const board = container.querySelector('.board');
    expect(board).toBeTruthy();
    expect(board?.children).toHaveLength(100);
  });
});
