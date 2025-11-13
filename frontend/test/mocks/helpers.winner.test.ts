import { checkLocalWinner, isGameReadyToStart } from '../../src/pages/Game/helpers';

describe('checkLocalWinner', () => {
  it('should return null when opponent has no placed ships', () => {
    const board = Array(100).fill(null);
    const placed = {};
    expect(checkLocalWinner('A', placed, board)).toBeNull();
  });

  it('should return null when not all opponent ships are sunk', () => {
    const board = Array(100).fill(null);
    board[0] = 'Hit';
    board[1] = null; // second ship cell not hit
    const placed = { cruiser: [0, 1] };
    expect(checkLocalWinner('A', placed, board)).toBeNull();
  });

  it('should return current player when all opponent ships are sunk', () => {
    const board = Array(100).fill(null);
    board[0] = 'Hit';
    board[1] = 'Hit';
    board[10] = 'Hit';
    const placed = {
      cruiser: [0, 1],
      destroyer: [10]
    };
    expect(checkLocalWinner('A', placed, board)).toBe('A');
  });

  it('should return null when opponent placed is undefined', () => {
    const board = Array(100).fill(null);
    expect(checkLocalWinner('B', undefined as any, board)).toBeNull();
  });

  it('should work for player B as well', () => {
    const board = Array(100).fill(null);
    board[0] = 'Hit';
    board[1] = 'Hit';
    const placed = { ship1: [0, 1] };
    expect(checkLocalWinner('B', placed, board)).toBe('B');
  });
});

describe('isGameReadyToStart', () => {
  it('should return true when both players are ready and current is A', () => {
    expect(isGameReadyToStart(true, true, 'A')).toBe(true);
  });

  it('should return true when current is B and readyB implied true and readyA is true', () => {
    expect(isGameReadyToStart(true, true, 'B')).toBe(true);
  });

  it('should return false when current is A and readyB is false', () => {
    expect(isGameReadyToStart(true, false, 'A')).toBe(false);
  });

  it('should return false when current is B and readyA is false', () => {
    expect(isGameReadyToStart(false, true, 'B')).toBe(false);
  });

  it('should return true when current is A and readyA is true (implicit)', () => {
    expect(isGameReadyToStart(false, true, 'A')).toBe(true);
  });

  it('should return true when current is B and readyB is true (implicit)', () => {
    expect(isGameReadyToStart(true, false, 'B')).toBe(true);
  });
});
