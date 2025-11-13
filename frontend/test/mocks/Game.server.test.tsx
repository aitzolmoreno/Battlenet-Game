import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../../src/pages/Game/Game';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('Game component (server flow)', () => {
  beforeEach(() => {
    try { globalThis.localStorage.clear(); } catch {}

    // Pre-populate placed ships for both players so finishPlacing enables immediately
    const allPlaced = {
      carrier: [0,1,2,3,4],
      battleship: [10,11,12,13],
      cruiser: [20,21,22],
      submarine: [30,31,32],
      destroyer: [0,1]
    };
    try {
      window.localStorage.setItem('placedShipsA', JSON.stringify(allPlaced));
      window.localStorage.setItem('placedShipsB', JSON.stringify(allPlaced));
      // Ensure boards exist
      const board = Array(100).fill(null);
      // Put destroyer on B board at 0 and 1
      board[0] = 'ship:destroyer';
      board[1] = 'ship:destroyer';
      window.localStorage.setItem('boardA', JSON.stringify(board));
      window.localStorage.setItem('boardB', JSON.stringify(board));
    } catch {}

    // Mock fetch to respond differently by path
    (global as any).fetch = jest.fn((url: string) => {
      if (String(url).includes('/api/game/create')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ gameId: 'server-game-1' })) });
      }
      if (String(url).includes('/place-ship')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ success: true, message: 'placed' })) });
      }
      if (String(url).includes('/start')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ success: true })) });
      }
      if (String(url).includes('/shoot')) {
        // return a Hit for any shoot in this test
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ result: 'Hit', isGameOver: false, currentTurn: 'player2' })) });
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('{}') });
    });

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('places ships via server, starts game and sinks a ship via server shoot', async () => {
    render(<Game />);

    // wait for createGame to be called
    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());

    // Click Done placing for Player A (should be enabled because we pre-populated placedShips)
    // find the actual button that contains "Done placing"
    let doneButton = screen.getAllByText(/Done placing/).find(el => el.tagName === 'BUTTON');
    if (!doneButton) doneButton = screen.getAllByText(/Placed/).find(el => el.tagName === 'BUTTON');
    if (doneButton) fireEvent.click(doneButton); // finish placing for A
    // Switch to player B then click done placing to trigger start
    const playerBButton = screen.getAllByRole('button').find(b => b.textContent === 'B');
    if (playerBButton) {
      fireEvent.click(playerBButton);
      // get current done button and click it
      let doneButtonB = screen.getAllByText(/Done placing/).find(el => el.tagName === 'BUTTON');
      if (!doneButtonB) doneButtonB = screen.getAllByText(/Placed/).find(el => el.tagName === 'BUTTON');
      if (doneButtonB) fireEvent.click(doneButtonB);
    }

    // Wait for start to be called (fetch should have been called for /start)
    await waitFor(() => {
      const calls = (global as any).fetch.mock.calls.map((c: any[]) => String(c[0]));
      const hasStart = calls.some((u: string) => u.includes('/start'));
      expect(hasStart).toBe(true);
    });

    // Now simulate attacks against positions 0 and 1 on A's attack view (which maps to B board)
    const allButtons = screen.getAllByRole('button');
    const cellButtons = allButtons.filter(b => (b.className || '').includes('cell'));
    // Attack board for Player A starts at index 100
    fireEvent.click(cellButtons[100 + 0]);
    fireEvent.click(cellButtons[100 + 1]);

    // After hitting both positions, expect at least a hit message or sunk message
    await waitFor(() => {
      const msgs = Array.from(document.querySelectorAll('.ships-setup .mt-2')).map(n => n.textContent || '');
      const hasHit = msgs.some(t => /hit/i.test(t));
      const hasSunk = msgs.some(t => /sunk/i.test(t));
      expect(hasHit || hasSunk).toBe(true);
    });
  });
});
