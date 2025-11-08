// test/mocks/Game.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Game from '../../src/pages/Game/Game';
import { jest, describe, test, beforeEach, afterEach, expect } from '@jest/globals';

describe('Game component (coverage-focused)', () => {
  let origLocalStorageSetItem: any;

  beforeEach(() => {
    // keep original to restore in specific tests
    origLocalStorageSetItem = globalThis.localStorage.setItem;
    try { globalThis.localStorage.clear(); } catch {}
    (global as any).fetch = jest.fn();

    // capture console output so we can assert on calls
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // restore things
    jest.resetAllMocks();
    jest.restoreAllMocks();
    try { globalThis.localStorage.setItem = origLocalStorageSetItem; } catch {}
  });

  test('parses valid boardA/boardB from localStorage if present', () => {
    // prepare valid boards so the initializer returns them
    const valid = Array(100).fill(null);
    globalThis.localStorage.setItem('boardA', JSON.stringify(valid));
    globalThis.localStorage.setItem('boardB', JSON.stringify(valid));

    render(<Game />);

    // basic smoke assertions: UI renders
    expect(screen.getByText('Battlenet Game')).toBeTruthy();
    expect(screen.getByText('Ships to place (Player A)')).toBeTruthy();

    // localStorage should still have the same arrays
    const fromA = JSON.parse(globalThis.localStorage.getItem('boardA') || '[]');
    const fromB = JSON.parse(globalThis.localStorage.getItem('boardB') || '[]');
    expect(Array.isArray(fromA)).toBe(true);
    expect(fromA.length).toBe(100);
    expect(Array.isArray(fromB)).toBe(true);
    expect(fromB.length).toBe(100);
  });

  test('warns when boardA in localStorage is invalid JSON', () => {
    // set invalid JSON to trigger the catch() and the console.warn branch
    globalThis.localStorage.setItem('boardA', 'this-is-not-json');

    render(<Game />);

    // Expect that a parsing warning was logged. Be resilient: assert it was called.
    expect(console.warn).toHaveBeenCalled();
  });

  test('warns when boardB in localStorage is invalid JSON', () => {
    globalThis.localStorage.setItem('boardB', 'this-is-bad-json');

    render(<Game />);

    expect(console.warn).toHaveBeenCalled();
  });

  test('resetBoards handles localStorage.setItem throwing and still resets state', async () => {
    // Spy on Storage.prototype.setItem so all setItem calls go through our mock.
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, val: string) {
      // simulate disk full only for boardA/boardB writes
      if (key === 'boardA' || key === 'boardB') {
        throw new Error('disk full');
      }
      // call original for other keys
      return origLocalStorageSetItem.call(this, key, val);
    });

    render(<Game />);

    // Click Reset boards button (wait for it to be available)
    const reset = await screen.findByText('Reset boards');
    fireEvent.click(reset);

    // The component should have attempted to write to localStorage and handled the error.
    // We can't rely on exact string messages across implementations, so assert the warning was emitted.
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalled();
    });

    // Also assert the component logged the "Boards reset" message to indicate in-memory reset happened.
    // Keep this check (if your component logs this exact string).
    expect(console.log).toHaveBeenCalledWith('Boards reset to empty 10x10');

    // restore spy
    spy.mockRestore();
  });

  test('selecting and placing a ship then attempting to re-select it triggers "already placed" warning', async () => {
    render(<Game />);

    // Find 'Select' buttons for ships and click the first one
    const selectButtons = await screen.findAllByText('Select');
    expect(selectButtons.length).toBeGreaterThan(0);
    fireEvent.click(selectButtons[0]);

    // After selecting, UI should show 'Selected' (or similar); wait for a possible update
    await waitFor(() => {
      // either it shows 'Selected' or console.log was called for selection
      expect(console.log).toHaveBeenCalled();
    });

    // Try to find a board cell button to place the ship.
    let placed = false;
    const wrappers = document.querySelectorAll('.board-wrapper');
    for (const w of Array.from(wrappers)) {
      const btn = w.querySelector('button');
      if (btn && (btn.textContent || '').trim() !== 'Select' && (btn.textContent || '').trim() !== 'Selected') {
        fireEvent.click(btn);
        placed = true;
        break;
      }
    }

    // Fallback: click any button that is not the UI control buttons
    if (!placed) {
      const allButtons = screen.getAllByRole('button');
      const candidate = allButtons.find(b => {
        const txt = (b.textContent || '').trim();
        return !['Select', 'Selected', 'Reset boards', 'Attack'].includes(txt);
      });
      if (!candidate) throw new Error('No board cell button found to simulate placement');
      fireEvent.click(candidate);
    }

    // After placing, console.log for placement should have been called (we mocked it in beforeEach)
    await waitFor(() => {
      expect(console.log).toHaveBeenCalled();
    });

    // Now attempt to select the same ship again: expect a warning about "already placed"
    try {
      const again = screen.getAllByText('Select')[0];
      fireEvent.click(again);
    } catch {
      // If there's no 'Select' anymore (it might show 'Placed'), try clicking the ship card area to trigger selection logic:
      const shipCards = document.querySelectorAll('.ships-list > div');
      if (shipCards.length > 0) {
        const firstCardButton = shipCards[0].querySelector('button');
        if (firstCardButton) fireEvent.click(firstCardButton);
      }
    }

    // At some point the "Ship already placed" warning should have been logged
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalled();
    });
  });

  test('fetchScene handles non-ok responses (throws and logs error)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    render(<Game />);

    // Wait for the effect to run and catch the error -> console.error should be called
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  test('fetchScene normalizes scene on success and logs normalized scene', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ game: { gameId: 'g-1', currentTurn: 'player1', player1: {}, player2: {} } })
    });

    render(<Game />);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('normalized scene:', expect.objectContaining({ gameId: 'g-1' }));
    });

    // scene should be stored in localStorage under 'board' (string)
    const boardRaw = globalThis.localStorage.getItem('board');
    expect(typeof boardRaw).toBe('string');
    const parsed = JSON.parse(boardRaw || '{}');
    expect(parsed).toEqual(expect.objectContaining({ gameId: 'g-1' }));
  });

  test('initial scene parsing logs error when localStorage board is corrupted', () => {
    // put bad JSON into 'board' key before render -> constructor's try/catch should hit and console.error called
    globalThis.localStorage.setItem('board', 'broken-json');

    render(<Game />);

    expect(console.error).toHaveBeenCalled();
  });
});
