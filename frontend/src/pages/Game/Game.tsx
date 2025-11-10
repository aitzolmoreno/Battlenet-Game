import React, { useEffect, useState, type JSX } from 'react';
import Board from '../../components/Board';
import './Game.css';

export type PlayerA = "A" | "B";

// Types
type Cell = string | number | null | Record<string, unknown>;

interface Ship {
    id?: string | number;
    name?: string;
    description?: string;
    cell?: Cell[];
}

interface Board {
    ships: Ship[];
}

interface Player {
    shipsPlaced: boolean;
    ready: boolean;
    name: string;
    id: string | null;
    board: Board;
}

interface Scene {
    gameId: string;
    currentTurn: 'player1' | 'player2';
    winner: string | null;
    state: string;
    player1: Player;
    player2: Player;
}

// Añade al inicio del archivo, antes de Game()
const API_BASE = 'http://localhost:8080/api/game';

async function createGame(): Promise<Scene> {
    const res = await fetch(`${API_BASE}/create`, { method: 'POST' });
    if (!res.ok) throw new Error(`Error creating game: ${res.status}`);
    const data = await res.json();
    return normalizeScene(data);
}

async function getGameInfo(gameId: string): Promise<Scene> {
    const res = await fetch(`${API_BASE}/${gameId}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Error fetching game info: ${res.status}`);
    const data = await res.json();
    return normalizeScene({ gameId, game: data });
}

async function placeShipBackend(gameId: string, playerNum: number, shipId: string, x: number, y: number, horizontal: boolean) {
    const res = await fetch(`${API_BASE}/${gameId}/place-ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: playerNum, shipType: shipId.toUpperCase(), x, y, horizontal })
    });
    if (!res.ok) throw new Error(`Error placing ship: ${res.status}`);
    return await res.json();
}

async function startGameBackend(gameId: string) {
    const res = await fetch(`${API_BASE}/${gameId}/start`, { method: 'POST' });
    if (!res.ok) throw new Error(`Error starting game: ${res.status}`);
    return await res.json();
}

async function shootBackend(gameId: string, x: number, y: number) {
    const res = await fetch(`${API_BASE}/${gameId}/shoot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y })
    });
    if (!res.ok) throw new Error(`Error shooting: ${res.status}`);
    return await res.json();
}

// Normaliza la respuesta del backend a tu tipo Scene
function normalizeScene(data: any): Scene {
    if (!data || !data.game) return {
        gameId: data.gameId || '',
        currentTurn: 'player1',
        winner: null,
        state: '',
        player1: { shipsPlaced: false, ready: false, name: 'player1', id: null, board: { ships: [] } },
        player2: { shipsPlaced: false, ready: false, name: 'player2', id: null, board: { ships: [] } },
    };

    const g = data.game;

    return {
        gameId: data.gameId || g.gameId || '',
        currentTurn: g.currentTurn || 'player1',
        winner: g.winner ?? null,
        state: g.state || '',
        player1: {
            shipsPlaced: g.player1?.shipsPlaced ?? false,
            ready: g.player1?.ready ?? false,
            name: g.player1?.name || 'player1',
            id: g.player1?.id ?? null,
            board: { ships: [] }, // puedes mapear barcos del backend si quieres
        },
        player2: {
            shipsPlaced: g.player2?.shipsPlaced ?? false,
            ready: g.player2?.ready ?? false,
            name: g.player2?.name || 'player2',
            id: g.player2?.id ?? null,
            board: { ships: [] },
        }
    };
}

export default function Game(): JSX.Element {

    const [boardA, setBoardA] = useState<(string | null)[]>(() => {
    try {
        const loadBoard = window.localStorage.getItem("boardA");
        const parsed = loadBoard ? JSON.parse(loadBoard) : null;
        if (Array.isArray(parsed) && parsed.length === 100) return parsed;
    } catch (e) {
        console.warn('Error parsing boardA from localStorage:', e);
    }
    const defaultBoardA = Array(100).fill(null); // tablero 10x10
    // normalizar en localStorage para evitar reutilizar datos antiguos
    try { window.localStorage.setItem('boardA', JSON.stringify(defaultBoardA)); } catch {}
    return defaultBoardA;
    });

    const [boardB, setBoardB] = useState<(string | null)[]>(() => {
    try {
        const loadBoard = window.localStorage.getItem("boardB");
        const parsed = loadBoard ? JSON.parse(loadBoard) : null;
        if (Array.isArray(parsed) && parsed.length === 100) return parsed;
    } catch (e) {
        console.warn('Error parsing boardB from localStorage:', e);
    }
    const defaultBoardB = Array(100).fill(null);
    try { window.localStorage.setItem('boardB', JSON.stringify(defaultBoardB)); } catch {}
    return defaultBoardB;
    });

    const [turn, setTurn] = useState<PlayerA>("A");

    // lista de barcos
    const shipsCatalog = [
        { id: 'carrier', name: 'Carrier', length: 5 },
        { id: 'battleship', name: 'Battleship', length: 4 },
        { id: 'cruiser', name: 'Cruiser', length: 3 },
        { id: 'submarine', name: 'Submarine', length: 3 },
        { id: 'destroyer', name: 'Destroyer', length: 2 },
    ];

    // Track placed ships for player A (simple map: shipId -> positions[])
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>({});
    const [selectedShip, setSelectedShip] = useState<{id: string; name: string; length: number} | null>(null);

    async function updateBoard(index: number, player: PlayerA, action: string) {
        if (player !== turn) return;

        if (action === "attack") {
            const row = Math.floor(index / 10);
            const col = index % 10;
            try {
                const res = await shootBackend(scene.gameId, row, col);
                console.log(res);

                // Actualizamos el board local
                const targetBoard = player === "A" ? [...boardB] : [...boardA];
                targetBoard[index] = res.result;
                player === "A" ? setBoardB(targetBoard) : setBoardA(targetBoard);

                // --- Actualizamos scene con el ataque ---
                setScene(prev => {
                    const nextScene = { ...prev };
                    const targetPlayerKey = player === "A" ? 'player2' : 'player1';
                    if (!nextScene[targetPlayerKey].board.ships) nextScene[targetPlayerKey].board.ships = [];
                    // Aquí puedes mapear ataques a células si quieres un registro más detallado
                    window.localStorage.setItem('board', JSON.stringify(nextScene));
                    return nextScene;
                });

                if (res.isGameOver) alert(`Game Over! Winner: ${res.winner}`);
                setTurn(turn === "A" ? "B" : "A");
            } catch (e) {
                console.error('Error attacking:', e);
            }
        }
    }



    function resetBoards() {
        const empty = Array(100).fill(null);
        try {
            window.localStorage.setItem('boardA', JSON.stringify(empty));
            window.localStorage.setItem('boardB', JSON.stringify(empty));
        } catch (e) {
            console.warn('Could not write localStorage during reset:', e);
        }
        setBoardA([...empty]);
        setBoardB([...empty]);
        console.log('Boards reset to empty 10x10');
    }

    function selectShipToPlace(shipId: string, name: string, length: number) {
        // toggle selection
        if (selectedShip?.id === shipId) {
            setSelectedShip(null);
            return;
        }
        // don't allow re-selecting an already placed ship
        if (placedShipsA[shipId]) {
            console.warn('Ship already placed:', shipId);
            return;
        }
        setSelectedShip({ id: shipId, name, length });
    }

    async function placeShip(index: number, player: PlayerA, shipId: string, length: number) {
        if (player !== 'A') return;
        if (!selectedShip || selectedShip.id !== shipId) return;

        const row = Math.floor(index / 10);
        const col = index % 10;

        try {
            const horizontal = true;
            const res = await placeShipBackend(scene.gameId, 1, shipId, row, col, horizontal);
            console.log(res);

            if (res.success) {
                // Actualizamos boardA
                const next = [...boardA];
                for (let i = 0; i < length; i++) next[index + i] = `ship:${shipId}`;
                setBoardA(next);
                
                // Marcamos el barco colocado
                setPlacedShipsA(prev => ({ ...prev, [shipId]: Array.from({ length }, (_, k) => index + k) }));
                setSelectedShip(null);

                // --- Actualizamos scene ---
                setScene(prev => {
                    const nextScene = { ...prev };
                    const newShip = {
                        id: shipId,
                        name: shipId,
                        cell: Array.from({ length }, (_, k) => index + k)
                    };
                    nextScene.player1.board.ships = [...(nextScene.player1.board.ships || []), newShip];
                    nextScene.player1.shipsPlaced = true; // opcional, o calcula según número de barcos
                    window.localStorage.setItem('board', JSON.stringify(nextScene));
                    return nextScene;
                });
            } else {
                console.warn(res.message);
            }
        } catch (e) {
            console.error('Error placing ship backend:', e);
        }
    }


    const defaultScene: Scene = {
        player1: {
            board: { ships: [] },
            shipsPlaced: false,
            ready: false,
            name: '',
            id: null
        },
        player2: {
            board: { ships: [] },
            shipsPlaced: false,
            ready: false,
            name: '',
            id: null
        },
        gameId: '',
        currentTurn: 'player1',
        winner: null,
        state: ''
    };

    const [scene, setScene] = useState<Scene>(() => {
        try {
            if (typeof window === 'undefined') return defaultScene;
            const raw = window.localStorage.getItem('board');
            return raw ? (JSON.parse(raw) as Scene) : defaultScene;
        } catch (e) {
            console.error('Error parsing localStorage:', e);
            return defaultScene;
        }
    });

    useEffect(() => {

        async function initGame() {
            try {
                const newScene = await createGame();
                setScene(newScene);
                window.localStorage.setItem('board', JSON.stringify(newScene));
                console.log('Game created:', newScene);
            } catch (e) {
                console.error(e);
            }
        }

        initGame();
    }, []);

    // Safe getter
    function getCell(
        playerKey: 'player1' | 'player2' = 'player1',
        shipIndex = 0,
        cellIndex = 0
    ): Cell | undefined {
        return scene?.[playerKey]?.board?.ships?.[shipIndex]?.cell?.[cellIndex];
    }

    // Safe setter example (updates state + localStorage)
    function setCell(
        playerKey: 'player1' | 'player2',
        shipIndex: number,
        cellIndex: number,
        value: Cell
    ): void {
        setScene(prev => {
            const next: Scene = JSON.parse(JSON.stringify(prev));
            if (!next[playerKey]) next[playerKey] = { board: { ships: [] }, shipsPlaced: false, ready: false, name: '', id: null } as Player;
            if (!next[playerKey].board.ships[shipIndex]) next[playerKey].board.ships[shipIndex] = { cell: [] } as Ship;
            if (!next[playerKey].board.ships[shipIndex].cell) next[playerKey].board.ships[shipIndex].cell = [];
            next[playerKey].board.ships[shipIndex].cell![cellIndex] = value;
            window.localStorage.setItem('board', JSON.stringify(next));
            console.log("scene: ", scene);
            return next;
        });
    }


    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold">Battlenet Game</h1>
                <div className="header-actions">
                    <button className="mt-2 mr-2 px-3 py-1 rounded bg-blue-600 text-white">Attack</button>
                    <button onClick={resetBoards} className="mt-2 px-3 py-1 rounded border">Reset boards</button>
                </div>

                <div className="ships-setup mt-4">
                    <h3 className="mb-2">Ships to place (Player A)</h3>
                    <div className="ships-list flex gap-2">
                        {shipsCatalog.map(s => (
                            <div key={s.id} className="p-2 border rounded">
                                <div><strong>{s.name}</strong> ({s.length})</div>
                                <div className="mt-1">
                                    {placedShipsA[s.id] ? (
                                        <span className="text-sm text-green-600">Placed</span>
                                    ) : (
                                        <button className="px-2 py-1 rounded border" onClick={() => selectShipToPlace(s.id, s.name, s.length)}>
                                            {selectedShip?.id === s.id ? 'Selected' : 'Select'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                
            </header>
            <section className="game">
                <div className="boards-grid">
                    <div className="player-column">
                        <h2 className="player-title">Player A</h2>
                        <div className="board-wrapper">
                            <div className="board-label">A - Defensa</div>
                            <Board
                                player="A"
                                board={boardA}
                                updateBoard={updateBoard}
                                revealShips={true}
                                isPlacementMode={!!selectedShip}
                                placingShipId={selectedShip?.id ?? null}
                                placingShipLength={selectedShip?.length ?? 0}
                                onPlaceShip={placeShip}
                            />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">A - Ataque</div>
                            <Board player="A" board={boardB} updateBoard={updateBoard} isAttackView={true} />
                        </div>
                    </div>

                    <div className="player-column">
                        <h2 className="player-title">Player B</h2>
                        <div className="board-wrapper">
                            <div className="board-label">A - Defensa</div>
                            <Board
                                player="B"
                                board={boardB}
                                updateBoard={updateBoard}
                                revealShips={true}
                                isPlacementMode={!!selectedShip}
                                placingShipId={selectedShip?.id ?? null}
                                placingShipLength={selectedShip?.length ?? 0}
                                onPlaceShip={placeShip}
                            />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">B - Ataque</div>
                            <Board player="B" board={boardA} updateBoard={updateBoard} isAttackView={true} />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
