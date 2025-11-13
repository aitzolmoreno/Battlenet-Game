import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../../src/components/Board';
import type { Player } from '../../src/components/Player';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';

describe('Board component', () => {
  const mockPlayer: Player = "A";
  const mockBoard = Array(100).fill(null);
  const mockUpdateBoard = jest.fn();

  beforeEach(() => {
    mockUpdateBoard.mockClear();
  });

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
        revealShips={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].textContent).toBe('💥');
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

    expect(mockOnPlaceShip).toHaveBeenCalledWith(0, mockPlayer, 'carrier', 5, 'horizontal');
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

    const board = container.querySelector('.board');
    expect(board).toBeTruthy();
    expect(board?.children).toHaveLength(100);
  });

  test('marks sunk ships correctly when sunkShips provided', () => {
    const boardWithShip = [...mockBoard];
    boardWithShip[0] = 'ship:carrier';
    boardWithShip[1] = 'ship:carrier';
    
    const sunkShips = { carrier: true };
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithShip}
        updateBoard={mockUpdateBoard}
        revealShips={true}
        sunkShips={sunkShips}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).toContain('sunk');
    expect(buttons[1].className).toContain('sunk');
  });

  test('marks sunk ships in attack view', () => {
    const boardWithHits = [...mockBoard];
    boardWithHits[0] = 'Hit';
    boardWithHits[1] = 'Hit';
    
    const placedShips = { carrier: [0, 1, 2, 3, 4] };
    const sunkShips = { carrier: true };
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithHits}
        updateBoard={mockUpdateBoard}
        isAttackView={true}
        placedShips={placedShips}
        sunkShips={sunkShips}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).toContain('sunk');
  });

  test('does not mark cells as sunk when ship is not sunk', () => {
    const boardWithShip = [...mockBoard];
    boardWithShip[0] = 'ship:carrier';
    
    const sunkShips = { destroyer: true };
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithShip}
        updateBoard={mockUpdateBoard}
        revealShips={true}
        sunkShips={sunkShips}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].className).not.toContain('sunk');
  });

  test('passes orientation prop to cells', () => {
    const mockOnPlaceShip = jest.fn();
    
    render(
      <Board
        player={mockPlayer}
        board={mockBoard}
        updateBoard={mockUpdateBoard}
        isPlacementMode={true}
        placingShipId="battleship"
        placingShipLength={4}
        onPlaceShip={mockOnPlaceShip}
        orientation="vertical"
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[10]);

    expect(mockOnPlaceShip).toHaveBeenCalledWith(10, mockPlayer, 'battleship', 4, 'vertical');
  });

  test('handles board with mixed cell values', () => {
    const mixedBoard = [...mockBoard];
    mixedBoard[0] = 'ship:carrier';
    mixedBoard[10] = 'Hit';
    mixedBoard[20] = 'Miss';
    mixedBoard[30] = 'Attck';
    
    render(
      <Board
        player={mockPlayer}
        board={mixedBoard}
        updateBoard={mockUpdateBoard}
        revealShips={true}
      />
    );

    expect(screen.getByText('🚢')).toBeTruthy();
    expect(screen.getByText('💥')).toBeTruthy();
    expect(screen.getByText('O')).toBeTruthy();
  });

  test('works with player B', () => {
    render(
      <Board
        player="B"
        board={mockBoard}
        updateBoard={mockUpdateBoard}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(mockUpdateBoard).toHaveBeenCalledWith(0, 'B', 'attack');
  });

  test('handles multiple ships on board', () => {
    const boardWithShips = [...mockBoard];
    boardWithShips[0] = 'ship:carrier';
    boardWithShips[10] = 'ship:destroyer';
    boardWithShips[20] = 'ship:battleship';
    
    render(
      <Board
        player={mockPlayer}
        board={boardWithShips}
        updateBoard={mockUpdateBoard}
        revealShips={true}
      />
    );

    const ships = screen.getAllByText('🚢');
    expect(ships.length).toBe(3);
  });

  test('handles placedShips prop correctly', () => {
    const placedShips = {
      carrier: [0, 1, 2, 3, 4],
      destroyer: [10, 11]
    };
    
    render(
      <Board
        player={mockPlayer}
        board={mockBoard}
        updateBoard={mockUpdateBoard}
        placedShips={placedShips}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(100);
  });
});
