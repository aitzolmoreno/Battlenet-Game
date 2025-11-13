import { applyLocalPlacement } from '../../src/pages/Game/helpers';

describe('applyLocalPlacement', () => {
  it('should place a ship horizontally on an empty board', () => {
    const board = Array(100).fill(null);
    const result = applyLocalPlacement('A', 'cruiser', [0, 1, 2], board);
    expect(result.board[0]).toBe('ship:cruiser');
    expect(result.board[1]).toBe('ship:cruiser');
    expect(result.board[2]).toBe('ship:cruiser');
    expect(result.placed).toEqual({ cruiser: [0, 1, 2] });
  });

  it('should place a ship vertically', () => {
    const board = Array(100).fill(null);
    const result = applyLocalPlacement('B', 'destroyer', [5, 15, 25], board);
    expect(result.board[5]).toBe('ship:destroyer');
    expect(result.board[15]).toBe('ship:destroyer');
    expect(result.board[25]).toBe('ship:destroyer');
    expect(result.placed).toEqual({ destroyer: [5, 15, 25] });
  });

  it('should not mutate the input board', () => {
    const board = Array(100).fill(null);
    const originalBoard = [...board];
    applyLocalPlacement('A', 'ship1', [0], board);
    expect(board).toEqual(originalBoard);
  });

  it('should handle single cell ship', () => {
    const board = Array(100).fill(null);
    const result = applyLocalPlacement('A', 'small', [99], board);
    expect(result.board[99]).toBe('ship:small');
    expect(result.placed).toEqual({ small: [99] });
  });

  it('should work for both players', () => {
    const boardA = Array(100).fill(null);
    const boardB = Array(100).fill(null);
    const resultA = applyLocalPlacement('A', 'shipA', [10, 11], boardA);
    const resultB = applyLocalPlacement('B', 'shipB', [20, 21], boardB);
    expect(resultA.board[10]).toBe('ship:shipA');
    expect(resultB.board[20]).toBe('ship:shipB');
  });
});
