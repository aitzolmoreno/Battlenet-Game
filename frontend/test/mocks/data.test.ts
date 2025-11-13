// test/mocks/data.test.ts
import { 
  getBoardA, 
  setBoardA, 
  getBoardB, 
  setBoardB, 
  getScene, 
  setScene,
  getPlacedShips,
  setPlacedShips,
  resetAll,
  DEFAULT_BOARD,
  DEFAULT_SCENE 
} from '../../src/lib/data';
import { jest, describe, test, beforeEach, expect } from '@jest/globals';

describe('data layer - localStorage wrapper', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('Board A operations', () => {
    test('getBoardA returns default board when localStorage is empty', () => {
      const board = getBoardA();
      expect(board).toEqual(DEFAULT_BOARD);
      expect(board.length).toBe(100);
    });

    test('setBoardA stores board in localStorage', () => {
      const testBoard = Array(100).fill('test');
      setBoardA(testBoard);
      
      const stored = JSON.parse(window.localStorage.getItem('boardA') || '[]');
      expect(stored).toEqual(testBoard);
    });

    test('getBoardA retrieves stored board from localStorage', () => {
      const testBoard = Array(100).fill('ship:carrier');
      setBoardA(testBoard);
      
      const retrieved = getBoardA();
      expect(retrieved).toEqual(testBoard);
    });

    test('getBoardA returns default when invalid data in localStorage', () => {
      window.localStorage.setItem('boardA', 'invalid-json');
      
      const board = getBoardA();
      expect(board).toEqual(DEFAULT_BOARD);
    });

    test('getBoardA returns default when board length is wrong', () => {
      window.localStorage.setItem('boardA', JSON.stringify(Array(50).fill(null)));
      
      const board = getBoardA();
      expect(board).toEqual(DEFAULT_BOARD);
      expect(board.length).toBe(100);
    });
  });

  describe('Board B operations', () => {
    test('getBoardB returns default board when localStorage is empty', () => {
      const board = getBoardB();
      expect(board).toEqual(DEFAULT_BOARD);
      expect(board.length).toBe(100);
    });

    test('setBoardB stores board in localStorage', () => {
      const testBoard = Array(100).fill('test-b');
      setBoardB(testBoard);
      
      const stored = JSON.parse(window.localStorage.getItem('boardB') || '[]');
      expect(stored).toEqual(testBoard);
    });

    test('getBoardB retrieves stored board from localStorage', () => {
      const testBoard = Array(100).fill('ship:destroyer');
      setBoardB(testBoard);
      
      const retrieved = getBoardB();
      expect(retrieved).toEqual(testBoard);
    });

    test('getBoardB returns default when invalid data in localStorage', () => {
      window.localStorage.setItem('boardB', 'bad-json');
      
      const board = getBoardB();
      expect(board).toEqual(DEFAULT_BOARD);
    });
  });

  describe('Scene operations', () => {
    test('getScene returns default scene when localStorage is empty', () => {
      const scene = getScene();
      expect(scene).toEqual(DEFAULT_SCENE);
    });

    test('setScene stores scene in localStorage', () => {
      const testScene = { ...DEFAULT_SCENE, gameId: 'test-123' };
      setScene(testScene);
      
      const stored = JSON.parse(window.localStorage.getItem('board') || '{}');
      expect(stored.gameId).toBe('test-123');
    });

    test('getScene retrieves stored scene from localStorage', () => {
      const testScene = { ...DEFAULT_SCENE, winner: 'player1' };
      setScene(testScene);
      
      const retrieved = getScene();
      expect(retrieved.winner).toBe('player1');
    });

    test('getScene returns default when invalid JSON in localStorage', () => {
      window.localStorage.setItem('board', 'not-json');
      
      const scene = getScene();
      expect(scene).toEqual(DEFAULT_SCENE);
    });
  });

  describe('Placed ships operations', () => {
    test('getPlacedShips returns empty object for player A when not set', () => {
      const placed = getPlacedShips('A');
      expect(placed).toEqual({});
    });

    test('getPlacedShips returns empty object for player B when not set', () => {
      const placed = getPlacedShips('B');
      expect(placed).toEqual({});
    });

    test('setPlacedShips stores ships for player A', () => {
      const ships = { carrier: [0, 1, 2, 3, 4] };
      setPlacedShips('A', ships);
      
      const stored = JSON.parse(window.localStorage.getItem('placedShipsA') || '{}');
      expect(stored).toEqual(ships);
    });

    test('setPlacedShips stores ships for player B', () => {
      const ships = { destroyer: [50, 51] };
      setPlacedShips('B', ships);
      
      const stored = JSON.parse(window.localStorage.getItem('placedShipsB') || '{}');
      expect(stored).toEqual(ships);
    });

    test('getPlacedShips retrieves ships for player A', () => {
      const ships = { battleship: [10, 11, 12, 13] };
      setPlacedShips('A', ships);
      
      const retrieved = getPlacedShips('A');
      expect(retrieved).toEqual(ships);
    });

    test('getPlacedShips retrieves ships for player B', () => {
      const ships = { submarine: [20, 30, 40] };
      setPlacedShips('B', ships);
      
      const retrieved = getPlacedShips('B');
      expect(retrieved).toEqual(ships);
    });

    test('getPlacedShips returns empty object when invalid JSON', () => {
      window.localStorage.setItem('placedShipsA', 'bad-data');
      
      const placed = getPlacedShips('A');
      expect(placed).toEqual({});
    });
  });

  describe('resetAll operation', () => {
    test('resetAll clears all data and returns defaults', () => {
      // Set some data first
      setBoardA(Array(100).fill('test'));
      setBoardB(Array(100).fill('test'));
      setScene({ ...DEFAULT_SCENE, gameId: 'test' });
      setPlacedShips('A', { carrier: [0, 1, 2, 3, 4] });
      setPlacedShips('B', { destroyer: [50, 51] });

      // Reset all
      const result = resetAll();

      // Check returned values
      expect(result.boardA).toEqual(DEFAULT_BOARD);
      expect(result.boardB).toEqual(DEFAULT_BOARD);
      expect(result.scene).toEqual(DEFAULT_SCENE);
      expect(result.placedA).toEqual({});
      expect(result.placedB).toEqual({});

      // Check localStorage was cleared
      expect(getBoardA()).toEqual(DEFAULT_BOARD);
      expect(getBoardB()).toEqual(DEFAULT_BOARD);
      expect(getScene()).toEqual(DEFAULT_SCENE);
      expect(getPlacedShips('A')).toEqual({});
      expect(getPlacedShips('B')).toEqual({});
    });

    test('resetAll handles localStorage errors gracefully', () => {
      // Mock localStorage to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      // Should not throw, just return defaults
      const result = resetAll();
      expect(result.boardA).toEqual(DEFAULT_BOARD);

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('Error handling', () => {
    test('setBoardA handles storage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded');
      });

      // Should not throw
      expect(() => setBoardA(Array(100).fill(null))).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    test('setBoardB handles storage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => setBoardB(Array(100).fill(null))).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    test('setScene handles storage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => setScene(DEFAULT_SCENE)).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    test('setPlacedShips handles storage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded');
      });

      expect(() => setPlacedShips('A', {})).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });
});
