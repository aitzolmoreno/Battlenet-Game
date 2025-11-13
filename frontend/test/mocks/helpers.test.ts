import { computeSunkShips, allShipsPlaced } from '../../src/pages/Game/helpers';

describe('Game helpers', () => {
  test('computeSunkShips returns sunk ship ids', () => {
    const placed = { a: [0,1], b: [2,3] };
    const board = Array(100).fill(null);
    board[0] = 'Hit';
    board[1] = 'Hit';
    board[2] = 'Hit';
    // only ship 'a' is fully hit
    const sunk = computeSunkShips(placed, board);
    expect(sunk).toEqual(['a']);
  });

  test('allShipsPlaced returns true only when all catalog ids present', () => {
    const catalog = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const placed1 = { a: [0], b: [1], c: [2] };
    const placed2 = { a: [0], b: [1] };
    expect(allShipsPlaced(catalog, placed1)).toBe(true);
    expect(allShipsPlaced(catalog, placed2)).toBe(false);
  });
});
