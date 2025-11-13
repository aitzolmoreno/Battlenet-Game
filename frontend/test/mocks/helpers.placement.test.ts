import { computePlacement } from '../../src/pages/Game/helpers';

describe('computePlacement', () => {
  test('horizontal fit returns positions', () => {
    const board = Array(100).fill(null);
    const res = computePlacement(5, 3, 'horizontal', board);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.positions).toEqual([5,6,7]);
  });

  test('horizontal overflow returns reason', () => {
    const board = Array(100).fill(null);
    const res = computePlacement(8, 4, 'horizontal', board);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/does not fit horizontally/i);
  });

  test('vertical fit returns positions', () => {
    const board = Array(100).fill(null);
    const res = computePlacement(10, 3, 'vertical', board);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.positions).toEqual([10,20,30]);
  });

  test('vertical overflow returns reason', () => {
    const board = Array(100).fill(null);
    const res = computePlacement(90, 2, 'vertical', board);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/does not fit vertically/i);
  });

  test('overlap detected horizontally', () => {
    const board = Array(100).fill(null);
    board[2] = 'ship:a';
    const res = computePlacement(1, 3, 'horizontal', board);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/overlap at 2/);
  });
});
