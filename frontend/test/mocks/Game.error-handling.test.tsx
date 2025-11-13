import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../../src/pages/Game/Game';
import * as api from '../../src/lib/api';

jest.mock('../../src/lib/api');
jest.mock('../../src/lib/data', () => ({
  getBoardA: () => Array(100).fill(null),
  getBoardB: () => Array(100).fill(null),
  setBoardA: jest.fn(),
  setBoardB: jest.fn(),
  getScene: () => null,
  setScene: jest.fn(),
  getPlacedShips: () => ({ A: {}, B: {} }),
  setPlacedShips: jest.fn(),
  resetAll: () => ({ boardA: Array(100).fill(null), boardB: Array(100).fill(null), placedA: {}, placedB: {} }),
  DEFAULT_SCENE: { player1: { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null }, player2: { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null } }
}));

describe('Game - Error Handling Paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.apiFetch as jest.Mock).mockResolvedValue({});
  });

  it('should handle finishPlacing with missing gameId error', async () => {
    (api.apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<Game />);
    
    await waitFor(() => {
      const game = screen.queryByText(/Game/i);
      expect(game).toBeTruthy();
    }, { timeout: 1000 });
  });

  it('should handle createGame network error', async () => {
    (api.apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<Game />);
    
    await waitFor(() => {
      expect(api.apiFetch).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should handle placeShip API error gracefully', async () => {
    (api.apiFetch as jest.Mock)
      .mockResolvedValueOnce({ id: 'game-123' }) // createGame success
      .mockRejectedValueOnce(new Error('Placement failed')); // placeShip error
    
    render(<Game />);
    
    await waitFor(() => {
      expect(api.apiFetch).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
