import { interpretPlaceShipResponse } from '../../src/pages/Game/helpers';

describe('interpretPlaceShipResponse - additional branches', () => {
  it('should handle response with no success flag and use default message', () => {
    const resp = { someOtherField: 'value' };
    const nextBoard = Array(100).fill(null);
    nextBoard[0] = 'ship:1';
    const result = interpretPlaceShipResponse(resp, 'A', nextBoard, 'cruiser', [0, 1]);
    expect(result.accepted).toBe(true);
    expect(result.message).toBe('Ship placed');
    expect(result.board).toEqual(nextBoard);
    expect(result.placed).toEqual({ cruiser: [0, 1] });
  });

  it('should handle response with no success flag and a message field', () => {
    const resp = { message: 'Custom success message' };
    const nextBoard = Array(100).fill(null);
    nextBoard[0] = 'ship:1';
    const result = interpretPlaceShipResponse(resp, 'B', nextBoard, 'destroyer', [5]);
    expect(result.accepted).toBe(true);
    expect(result.message).toBe('Custom success message');
  });

  it('should handle explicit success: true', () => {
    const resp = { success: true, message: 'Server accepted' };
    const nextBoard = Array(100).fill(null);
    const result = interpretPlaceShipResponse(resp, 'A', nextBoard, 'ship1', [0]);
    expect(result.accepted).toBe(true);
    expect(result.message).toBe('Server accepted');
  });

  it('should handle explicit success: false', () => {
    const resp = { success: false, message: 'Server rejected' };
    const nextBoard = Array(100).fill(null);
    const result = interpretPlaceShipResponse(resp, 'B', nextBoard, 'ship2', [1]);
    expect(result.accepted).toBe(false);
    expect(result.message).toBe('Server rejected');
  });

  it('should handle null response gracefully', () => {
    const resp = null;
    const nextBoard = Array(100).fill(null);
    const result = interpretPlaceShipResponse(resp, 'A', nextBoard, 'test', [10]);
    expect(result.accepted).toBe(true);
    expect(result.message).toBe('Ship placed');
  });
});
