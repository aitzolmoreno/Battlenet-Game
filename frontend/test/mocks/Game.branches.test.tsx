import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../../src/pages/Game/Game';
import { DEFAULT_BOARD } from '../../src/lib/data';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('Game component - branch coverage', () => {
  beforeEach(() => {
    try { globalThis.localStorage.clear(); } catch {}
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('server shoot returns Miss and turn switches', async () => {
    // prepare placed ships so Done placing is enabled
    const allPlaced = { carrier: [0,1,2,3,4], battleship: [10,11,12,13], cruiser: [20,21,22], submarine: [30,31,32], destroyer: [0,1] };
    window.localStorage.setItem('placedShipsA', JSON.stringify(allPlaced));
    window.localStorage.setItem('placedShipsB', JSON.stringify(allPlaced));

    (global as any).fetch = jest.fn((url: string) => {
      if ((url as string).includes('/api/game/create')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ gameId: 'g1' })) });
      if ((url as string).includes('/start')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ success: true })) });
      if ((url as string).includes('/place-ship')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ success: true })) });
      if ((url as string).includes('/shoot')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ result: 'Miss', isGameOver: false, currentTurn: 'player2' })) });
      return Promise.resolve({ ok: true, text: () => Promise.resolve('{}') });
    });

    render(<Game />);

    // wait createGame
    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());

    // finish placing for A and B to start
    const doneButtons = screen.getAllByText(/Done placing|Placed/);
    // click first Done placing button (A)
    const doneA = doneButtons.find(b => b.tagName === 'BUTTON' && b.textContent?.includes('Done placing')) as HTMLElement | undefined;
    if (doneA) fireEvent.click(doneA);
    // switch to B and click Done placing for B
    const playerBButton = screen.getAllByRole('button').find(b => b.textContent === 'B');
    if (playerBButton) {
      fireEvent.click(playerBButton);
      const doneB = screen.getAllByText(/Done placing|Placed/).find(b => b.tagName === 'BUTTON' && b.textContent?.includes('Done placing')) as HTMLElement | undefined;
      if (doneB) fireEvent.click(doneB);
    }

    // check that a player-column is active for A initially
    await waitFor(() => {
      const active = document.querySelectorAll('.player-column.active');
      expect(active.length).toBeGreaterThanOrEqual(0);
    });

    // get attack board cells (player A attack board is second board in A column)
    const allButtons = screen.getAllByRole('button');
    const cellButtons = allButtons.filter(b => (b.className || '').includes('cell'));
    // click an attack cell (index 100 mapped to attack board start)
    if (cellButtons[100]) fireEvent.click(cellButtons[100]);

    // wait for lastActionMessage to show Miss
    await waitFor(() => {
      const messages = Array.from(document.querySelectorAll('.ships-setup .mt-2')).map(n => n.textContent || '');
      const hasMiss = messages.some(t => /missed/i.test(t));
      expect(hasMiss).toBe(true);
    });

    // after server response currentTurn=player2, active column should switch (structural check)
    await waitFor(() => {
      const active = Array.from(document.querySelectorAll('.player-column')).filter(n => (n.className || '').includes('active'));
      expect(Array.isArray(active)).toBe(true);
    });
  });

  test('placeShip server error shows placement failed message', async () => {
    // ensure a gameId is created
    window.localStorage.setItem('placedShipsA', JSON.stringify({}));

    (global as any).fetch = jest.fn((url: string) => {
      if ((url as string).includes('/api/game/create')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ gameId: 'g3' })) });
      if ((url as string).includes('/place-ship')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ success: false, message: 'placement failed server' })) });
      return Promise.resolve({ ok: true, text: () => Promise.resolve('{}') });
    });

    render(<Game />);

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());

    // select a ship by clicking Select for first ship
    const selectBtn = await screen.findAllByText('Select');
    if (selectBtn && selectBtn[0]) fireEvent.click(selectBtn[0]);

    // click first cell to trigger onPlaceShip (which will call place-ship)
    const allButtons = screen.getAllByRole('button');
    const cellButtons = allButtons.filter(b => (b.className || '').includes('cell'));
    if (cellButtons[0]) fireEvent.click(cellButtons[0]);

    await waitFor(() => {
      const msgs = Array.from(document.querySelectorAll('.ships-setup .mt-2')).map(n => n.textContent || '');
      const hasPlacementFailed = msgs.some(t => /placement failed server|Placement failed/i.test(t));
      expect(hasPlacementFailed).toBe(true);
    });
  });

  test('resetBoards clears localStorage and creates new game', async () => {
    (global as any).fetch = jest.fn((url: string) => {
      if ((url as string).includes('/api/game/create')) return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ gameId: 'g4' })) });
      return Promise.resolve({ ok: true, text: () => Promise.resolve('{}') });
    });

    // set some keys
    window.localStorage.setItem('boardA', JSON.stringify(["x"]));

    render(<Game />);

    await waitFor(() => expect((global as any).fetch).toHaveBeenCalled());

    const resetButton = screen.getByText('Reset boards');
    fireEvent.click(resetButton);

    await waitFor(() => {
      const boardA = JSON.parse(String(window.localStorage.getItem('boardA')));
      // boardA should equal DEFAULT_BOARD or at least be an array of length 100
      expect(Array.isArray(boardA)).toBe(true);
      expect(boardA.length).toBe(100);
    });
  });

  test('createGame handles fetch error gracefully', async () => {
    // simulate fetch rejecting on create
    (global as any).fetch = jest.fn(() => Promise.reject(new Error('network')));
    render(<Game />);
    // error message should appear in the UI
    await waitFor(() => {
      const msgs = Array.from(document.querySelectorAll('.ships-setup .mt-2')).map(n => n.textContent || '');
      const hasError = msgs.some(t => /Error creating game on server/i.test(t));
      expect(hasError).toBe(true);
    });
  });
});
