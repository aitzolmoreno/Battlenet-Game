// Capa simple de datos para encapsular localStorage
const BOARD_A_KEY = 'boardA';
const BOARD_B_KEY = 'boardB';
const SCENE_KEY = 'board';
const PLACED_A_KEY = 'placedShipsA';
const PLACED_B_KEY = 'placedShipsB';

export const DEFAULT_BOARD = Array(100).fill(null) as (string | null)[];

export const DEFAULT_SCENE = {
    player1: { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null },
    player2: { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null },
    gameId: '',
    currentTurn: 'player1',
    winner: null,
    state: ''
};

function safeParse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
        const parsed = JSON.parse(raw) as T;
        return parsed;
    } catch {
        return fallback;
    }
}

export function getBoardA(): (string | null)[] {
    const raw = window.localStorage.getItem(BOARD_A_KEY);
    const parsed = safeParse<(string | null)[]>(raw, DEFAULT_BOARD.slice());
    // ensure length
    if (!Array.isArray(parsed) || parsed.length !== 100) {
        setBoardA(DEFAULT_BOARD.slice());
        return DEFAULT_BOARD.slice();
    }
    return parsed;
}

export function setBoardA(board: (string | null)[]): void {
    try { window.localStorage.setItem(BOARD_A_KEY, JSON.stringify(board)); } catch {}
}

export function getBoardB(): (string | null)[] {
    const raw = window.localStorage.getItem(BOARD_B_KEY);
    const parsed = safeParse<(string | null)[]>(raw, DEFAULT_BOARD.slice());
    if (!Array.isArray(parsed) || parsed.length !== 100) {
        setBoardB(DEFAULT_BOARD.slice());
        return DEFAULT_BOARD.slice();
    }
    return parsed;
}

export function setBoardB(board: (string | null)[]): void {
    try { window.localStorage.setItem(BOARD_B_KEY, JSON.stringify(board)); } catch {}
}

export function getScene(): any {
    const raw = window.localStorage.getItem(SCENE_KEY);
    return safeParse<any>(raw, DEFAULT_SCENE);
}

export function setScene(scene: any): void {
    try { window.localStorage.setItem(SCENE_KEY, JSON.stringify(scene)); } catch {}
}

export function getPlacedShips(player: 'A' | 'B') {
    const key = player === 'A' ? PLACED_A_KEY : PLACED_B_KEY;
    const raw = window.localStorage.getItem(key);
    return safeParse<Record<string, number[]>>(raw, {});
}

export function setPlacedShips(player: 'A' | 'B', map: Record<string, number[]>): void {
    const key = player === 'A' ? PLACED_A_KEY : PLACED_B_KEY;
    try { window.localStorage.setItem(key, JSON.stringify(map)); } catch {}
}

// reset everything in localStorage and return the initial values
export function resetAll() {
    try {
        window.localStorage.setItem(BOARD_A_KEY, JSON.stringify(DEFAULT_BOARD));
        window.localStorage.setItem(BOARD_B_KEY, JSON.stringify(DEFAULT_BOARD));
        window.localStorage.setItem(SCENE_KEY, JSON.stringify(DEFAULT_SCENE));
        window.localStorage.setItem(PLACED_A_KEY, JSON.stringify({}));
        window.localStorage.setItem(PLACED_B_KEY, JSON.stringify({}));
    } catch {}

    return {
        boardA: DEFAULT_BOARD.slice(),
        boardB: DEFAULT_BOARD.slice(),
        scene: JSON.parse(JSON.stringify(DEFAULT_SCENE)),
        placedA: {},
        placedB: {}
    };
}
