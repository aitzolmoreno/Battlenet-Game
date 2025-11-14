import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from '../../src/hooks/useGameLogic';

describe('useGameLogic', () => {
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useGameLogic());
    
    expect(result.current.boardA).toEqual(Array(100).fill(null));
    expect(result.current.boardB).toEqual(Array(100).fill(null));
    expect(result.current.turn).toBe('A');
    expect(result.current.gameStarted).toBe(false);
    expect(result.current.winner).toBe(null);
    expect(result.current.placedShipsA).toEqual({});
    expect(result.current.placedShipsB).toEqual({});
  });

  test('updateBoard prevents attack when game not started', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.updateBoard(0, 'A', 'attack');
    });
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot attack: game has not started yet');
    consoleWarnSpy.mockRestore();
  });

  test('updateBoard does nothing if player is not current turn', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setGameStarted(true);
      result.current.updateBoard(0, 'B', 'attack');
    });
    
    expect(result.current.boardA).toEqual(Array(100).fill(null));
    expect(result.current.turn).toBe('A');
  });

  test('updateBoard marks already attacked cell correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setGameStarted(true);
      const newBoard = [...result.current.boardB];
      newBoard[0] = 'Hit';
      result.current.setBoardBState(newBoard);
    });

    act(() => {
      result.current.updateBoard(0, 'A', 'attack');
    });
    
    expect(result.current.lastActionMessage).toBe('Already attacked this cell');
  });

  test('updateBoard handles successful hit on player B board', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setGameStarted(true);
      const newBoard = [...result.current.boardB];
      newBoard[0] = 'ship:carrier';
      result.current.setBoardBState(newBoard);
    });

    act(() => {
      result.current.updateBoard(0, 'A', 'attack');
    });
    
    expect(result.current.boardB[0]).toBe('Hit');
    expect(result.current.lastActionMessage).toBe('Player A HIT B at 0');
    expect(result.current.turn).toBe('B');
  });

  test('updateBoard handles miss on player B board', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setGameStarted(true);
    });

    act(() => {
      result.current.updateBoard(5, 'A', 'attack');
    });
    
    expect(result.current.boardB[5]).toBe('Miss');
    expect(result.current.lastActionMessage).toBe('Player A missed B at 5');
    expect(result.current.turn).toBe('B');
  });

  test('updateBoard handles player B attacking player A', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setGameStarted(true);
      const newBoard = [...result.current.boardA];
      newBoard[10] = 'ship:destroyer';
      result.current.setBoardAState(newBoard);
    });

    act(() => {
      result.current.updateBoard(0, 'A', 'attack'); // A attacks first
    });

    act(() => {
      result.current.updateBoard(10, 'B', 'attack'); // B attacks A
    });
    
    expect(result.current.boardA[10]).toBe('Hit');
    expect(result.current.lastActionMessage).toBe('Player B HIT A at 10');
    expect(result.current.turn).toBe('A');
  });

  test('resetBoards clears all game state', () => {
    const { result } = renderHook(() => useGameLogic());
    
    // Set up some state
    act(() => {
      result.current.setGameStarted(true);
      result.current.setWinner('A');
      const newBoard = [...result.current.boardA];
      newBoard[0] = 'Hit';
      result.current.setBoardAState(newBoard);
      result.current.setPlacedShipsA({ carrier: [0, 1, 2, 3, 4] });
    });

    act(() => {
      result.current.resetBoards();
    });
    
    expect(result.current.boardA).toEqual(Array(100).fill(null));
    expect(result.current.boardB).toEqual(Array(100).fill(null));
    expect(result.current.placedShipsA).toEqual({});
    expect(result.current.placedShipsB).toEqual({});
    expect(result.current.winner).toBe(null);
    expect(result.current.gameStarted).toBe(false);
    expect(result.current.turn).toBe('A');
    expect(result.current.lastActionMessage).toBe('Boards reset');
  });

  test('state setters work correctly', () => {
    const { result } = renderHook(() => useGameLogic());
    
    act(() => {
      result.current.setWinner('Player A');
      result.current.setLastActionMessage('Test message');
      result.current.setGameStarted(true);
    });
    
    expect(result.current.winner).toBe('Player A');
    expect(result.current.lastActionMessage).toBe('Test message');
    expect(result.current.gameStarted).toBe(true);
  });
});
