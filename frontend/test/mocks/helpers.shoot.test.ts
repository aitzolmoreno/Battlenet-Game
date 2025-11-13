import { interpretShootResponse } from '../../src/pages/Game/helpers';

describe('interpretShootResponse', () => {
  test('interprets hit response and no winner', () => {
    const board = Array(100).fill(null);
    // ship at index 10 and only position
    const placed = { ship1: [10] } as Record<string, number[]>;
    const resp = { result: 'HIT', isGameOver: false };
    const out = interpretShootResponse(resp, 10, 'A', board, placed);
    expect(out.updatedBoard[10]).toBe('Hit');
    expect(out.lastActionMessage).toMatch(/HIT/);
    expect(out.newlySunk).toEqual(['ship1']);
    // local detection will mark player as winner because single ship is sunk
    expect(out.winner).toBe('player1');
  });

  test('interprets miss response', () => {
    const board = Array(100).fill(null);
    const placed = { ship1: [10] } as Record<string, number[]>;
    const resp = { result: 'MISS' };
    const out = interpretShootResponse(resp, 11, 'B', board, placed);
    expect(out.updatedBoard[11]).toBe('Miss');
    expect(out.lastActionMessage).toMatch(/missed/);
    expect(out.newlySunk).toEqual([]);
  });

  test('handles server winner and currentTurn mapping', () => {
    const board = Array(100).fill(null);
    const placed = { ship1: [5] } as Record<string, number[]>;
    const resp = { result: 'HIT', isGameOver: true, winner: 'player2', currentTurn: 'player2' };
    const out = interpretShootResponse(resp, 5, 'A', board, placed);
    expect(out.updatedBoard[5]).toBe('Hit');
    expect(out.winner).toBe('player2');
    expect(out.nextTurn).toBe('B');
  });
});
