import { computeSceneWithCell, computeResetState } from '../../src/pages/Game/helpers';

describe('computeSceneWithCell', () => {
  test('creates nested objects and sets cell', () => {
    const prev = undefined;
    const next = computeSceneWithCell(prev, 'player1', 0, 1, 'X');
    expect(next.player1).toBeDefined();
    expect(next.player1.board.ships[0].cell[1]).toBe('X');
  });

  test('preserves existing values', () => {
    const prev = { player1: { board: { ships: [{ cell: ['a'] }] } } };
    const next = computeSceneWithCell(prev, 'player1', 0, 0, 'b');
    expect(next.player1.board.ships[0].cell[0]).toBe('b');
  });
});

describe('computeResetState', () => {
  test('normalizes partial reset result', () => {
    const res = { boardA: [1,2,3], placedA: { s: [1] } };
    const out = computeResetState(res as any);
    expect(out.boardA).toEqual([1,2,3]);
    expect(out.placedA).toEqual({ s: [1] });
    expect(Array.isArray(out.boardB)).toBe(true);
  });
});
