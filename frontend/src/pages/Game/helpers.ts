// Pure helpers for Game logic to make unit testing easier

export function computeSunkShips(placed: Record<string, number[]>, boardArr: (string | null)[]) {
  const sunk: string[] = [];
  for (const shipId of Object.keys(placed)) {
    const positions = placed[shipId] || [];
    if (positions.length === 0) continue;
    const allHit = positions.every(pos => boardArr[pos] === 'Hit');
    if (allHit) sunk.push(shipId);
  }
  return sunk;
}

export function allShipsPlaced(shipsCatalog: {id: string}[], placed: Record<string, number[]>) {
  return shipsCatalog.every(s => !!placed[s.id]);
}

export type PlacementResult = { ok: true; positions: number[] } | { ok: false; reason: string };

export function computePlacement(index: number, length: number, orientation: 'horizontal' | 'vertical', board: (string | null)[]): PlacementResult {
  const row = Math.floor(index / 10);
  const col = index % 10;
  const positions: number[] = [];

  if (orientation === 'horizontal') {
    if (col + length > 10) return { ok: false, reason: 'does not fit horizontally from this position' };
    for (let i = 0; i < length; i++) {
      if (board[index + i] !== null) return { ok: false, reason: `overlap at ${index + i}` };
      positions.push(index + i);
    }
    return { ok: true, positions };
  }

  // vertical
  if (row + length > 10) return { ok: false, reason: 'does not fit vertically from this position' };
  for (let i = 0; i < length; i++) {
    const pos = index + i * 10;
    if (board[pos] !== null) return { ok: false, reason: `overlap at ${pos}` };
    positions.push(pos);
  }
  return { ok: true, positions };
}

export type ShootInterpretation = {
  updatedBoard: (string | null)[];
  lastActionMessage: string | null;
  newlySunk: string[];
  winner?: string | null;
  nextTurn?: 'A' | 'B' | null;
};

export function interpretShootResponse(resp: any, index: number, player: 'A' | 'B', targetBoard: (string | null)[], opponentPlaced: Record<string, number[]>) : ShootInterpretation {
  const boardCopy = [...targetBoard];
  let lastActionMessage: string | null = null;
  let newlySunk: string[] = [];
  let winner: string | null | undefined = undefined;
  let nextTurn: 'A' | 'B' | null | undefined = undefined;

  const result = resp?.result;
  const opponent = player === 'A' ? 'B' : 'A';

  if (typeof result === 'string' && result.toLowerCase().includes('hit')) {
    boardCopy[index] = 'Hit';
    lastActionMessage = `Player ${player} HIT ${opponent} at ${index}`;
  } else {
    boardCopy[index] = 'Miss';
    lastActionMessage = `Player ${player} missed at ${index}`;
  }

  // detect sunk locally using placed positions
  newlySunk = computeSunkShips(opponentPlaced, boardCopy);

  if (resp?.isGameOver || resp?.winner) {
    winner = resp.winner || null;
  } else {
    // local check of all sunk
    const allSunk = Object.keys(opponentPlaced).length > 0 && allShipsPlaced(Object.keys(opponentPlaced).map(id => ({ id } as any)), opponentPlaced) &&
      Object.keys(opponentPlaced).every(shipId => {
        const positions = opponentPlaced[shipId] || [];
        return positions.every(pos => boardCopy[pos] === 'Hit');
      });
    if (allSunk) {
      winner = player === 'A' ? 'player1' : 'player2';
    }
  }

  if (resp?.currentTurn) {
    nextTurn = resp.currentTurn === 'player1' ? 'A' : 'B';
  }

  return { updatedBoard: boardCopy, lastActionMessage, newlySunk, winner, nextTurn };
}

export function parseCreateGameResponse(resp: any): { id?: string | null; message?: string | null } {
  const id = resp?.gameId || resp?.game?.gameId || null;
  if (id) return { id };
  return { message: resp?.message || null };
}

export function interpretPlaceShipResponse(resp: any, player: 'A' | 'B', nextBoard: (string | null)[], shipId: string, positions: number[]) {
  // Determine if backend accepted placement and return minimal data to apply
  if (resp && (resp.success === false || resp.success === true)) {
    if (!resp.success) return { accepted: false, message: resp.message || 'Placement failed' };
    // accepted
    const placed = { [shipId]: positions } as Record<string, number[]>;
    return { accepted: true, message: resp.message || 'Ship placed', board: nextBoard, placed };
  }
  // If no explicit success flag, assume success but include message
  const placed = { [shipId]: positions } as Record<string, number[]>;
  return { accepted: true, message: resp?.message || 'Ship placed', board: nextBoard, placed };
}

export function interpretStartResponse(resp: any): { started: boolean; message?: string | null } {
  if (resp && resp.success === true) return { started: true, message: resp.message || 'Game started (server)' };
  return { started: false, message: resp?.message || 'Could not start game' };
}

export function computeSceneWithCell(prev: any, playerKey: 'player1' | 'player2', shipIndex: number, cellIndex: number, value: any) {
  const next: any = JSON.parse(JSON.stringify(prev || {}));
  if (!next[playerKey]) next[playerKey] = { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null };
  if (!next[playerKey].board) next[playerKey].board = { ships: [] };
  if (!next[playerKey].board.ships[shipIndex]) next[playerKey].board.ships[shipIndex] = { cell: [] };
  if (!next[playerKey].board.ships[shipIndex].cell) next[playerKey].board.ships[shipIndex].cell = [];
  next[playerKey].board.ships[shipIndex].cell[cellIndex] = value;
  return next as any;
}

export function computeResetState(res: any) {
  // normalize resetAll result into explicit state pieces expected by Game
  return {
    boardA: res?.boardA || Array(100).fill(null),
    boardB: res?.boardB || Array(100).fill(null),
    placedA: res?.placedA || {},
    placedB: res?.placedB || {},
    scene: res?.scene || null,
  };
}

export function checkLocalWinner(
  currentPlayer: 'A' | 'B',
  opponentPlaced: Record<string, number[]>,
  opponentBoard: (string | null)[]
): string | null {
  // Determine if currentPlayer has won by checking if all opponent ships are sunk locally
  if (!opponentPlaced || Object.keys(opponentPlaced).length === 0) return null;
  const sunk = computeSunkShips(opponentPlaced, opponentBoard);
  const allShips = Object.keys(opponentPlaced);
  if (sunk.length === allShips.length) {
    return currentPlayer;
  }
  return null;
}

export function isGameReadyToStart(
  readyA: boolean,
  readyB: boolean,
  currentPlayer: 'A' | 'B'
): boolean {
  // Check if both players are ready to start the game
  if (currentPlayer === 'A') {
    return true && readyB;
  }
  return readyA && true;
}

export function applyLocalPlacement(
  player: 'A' | 'B',
  shipId: string,
  positions: number[],
  targetBoard: (string | null)[]
): { board: (string | null)[]; placed: Record<string, number[]> } {
  // Apply ship placement to board locally (no server call)
  const next = [...targetBoard];
  for (const p of positions) next[p] = `ship:${shipId}`;
  const placed = { [shipId]: positions };
  return { board: next, placed };
}

