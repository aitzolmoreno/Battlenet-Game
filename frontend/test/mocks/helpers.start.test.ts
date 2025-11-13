import { interpretStartResponse } from '../../src/pages/Game/helpers';

describe('interpretStartResponse', () => {
  test('returns started true when success true', () => {
    const resp = { success: true };
    const out = interpretStartResponse(resp);
    expect(out.started).toBe(true);
    expect(out.message).toBe('Game started (server)');
  });

  test('returns started false and message when success false', () => {
    const resp = { success: false, message: 'cannot start' };
    const out = interpretStartResponse(resp);
    expect(out.started).toBe(false);
    expect(out.message).toBe('cannot start');
  });

  test('handles missing fields gracefully', () => {
    const out = interpretStartResponse(undefined);
    expect(out.started).toBe(false);
    expect(out.message).toBe('Could not start game');
  });
});
