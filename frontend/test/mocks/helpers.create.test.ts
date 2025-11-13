import { parseCreateGameResponse } from '../../src/pages/Game/helpers';

describe('parseCreateGameResponse', () => {
  test('extracts gameId from top-level', () => {
    const resp = { gameId: 'abc-123' };
    const out = parseCreateGameResponse(resp);
    expect(out.id).toBe('abc-123');
  });

  test('extracts gameId from nested object', () => {
    const resp = { game: { gameId: 'nested-1' } };
    const out = parseCreateGameResponse(resp);
    expect(out.id).toBe('nested-1');
  });

  test('returns message when no id present', () => {
    const resp = { message: 'failed' };
    const out = parseCreateGameResponse(resp);
    expect(out.id).toBeUndefined();
    expect(out.message).toBe('failed');
  });
});
