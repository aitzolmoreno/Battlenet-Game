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

    // Track placed ships for players (simple map: shipId -> positions[])
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>({});
    const [placedShipsB, setPlacedShipsB] = useState<Record<string, number[]>>({});
    const [selectedShip, setSelectedShip] = useState<{id: string; name: string; length: number} | null>(null);
    const [placingPlayer, setPlacingPlayer] = useState<PlayerA>('A');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [readyA, setReadyA] = useState(false);
    const [readyB, setReadyB] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

    function updateBoard(index: number, player: PlayerA, action: string) {
        // only allow attacks when the game has started
        if (action === 'attack' && !gameStarted) {
            console.warn('Cannot attack: game has not started yet');
            return;
        }

        // ensure it's the player's turn
        if (player !== turn) return;

        if (action === "attack") {
            // target board is opponent's defense board
            const opponent = player === 'A' ? 'B' : 'A';
            const targetBoard = player === "A" ? [...boardB] : [...boardA];

            const current = targetBoard[index];
            // prevent attacking same cell twice
            if (current === 'Hit' || current === 'Miss') {
                setLastActionMessage('Already attacked this cell');
                return;
            }

            if (typeof current === 'string' && current.startsWith('ship:')) {
                // it's a hit
                targetBoard[index] = 'Hit';
                setLastActionMessage(`Player ${player} HIT ${opponent} at ${index}`);
            } else {
                // miss
                targetBoard[index] = 'Miss';
                setLastActionMessage(`Player ${player} missed at ${index}`);
            }

            if (player === 'A') setBoardB(targetBoard); else setBoardA(targetBoard);
            // advance turn after attack
            setTurn(turn === "A" ? "B" : "A");
        }
    }

    function resetBoards() {
        const empty = Array(100).fill(null);
        try {
            window.localStorage.setItem('boardA', JSON.stringify(empty));
            window.localStorage.setItem('boardB', JSON.stringify(empty));
            try { window.localStorage.setItem('board', JSON.stringify(defaultScene)); } catch {}
        } catch (e) {
            console.warn('Could not write localStorage during reset:', e);
        }

        // reset in-memory state
        setBoardA([...empty]);
        setBoardB([...empty]);
        setPlacedShipsA({});
        setPlacedShipsB({});
        setSelectedShip(null);
        setPlacingPlayer('A');
        setOrientation('horizontal');
        setReadyA(false);
        setReadyB(false);
        setGameStarted(false);
        setTurn('A');
        try { setScene(defaultScene); } catch {}

        console.log('Boards and game state reset to initial values');
    }

    function selectShipToPlace(shipId: string, name: string, length: number) {
        // toggle selection
        if (selectedShip?.id === shipId) {
            setSelectedShip(null);
            return;
        }
        // don't allow re-selecting an already placed ship for the current placing player
        const already = placingPlayer === 'A' ? placedShipsA[shipId] : placedShipsB[shipId];
        if (already) {
            console.warn('Ship already placed for player', placingPlayer, shipId);
            return;
        }
        setSelectedShip({ id: shipId, name, length });
    }

    function allPlacedForPlayer(player: PlayerA) {
        return shipsCatalog.every(s => {
            const record = player === 'A' ? placedShipsA : placedShipsB;
            return !!record[s.id];
        });
    }

    function finishPlacing(player: PlayerA) {
        if (!allPlacedForPlayer(player)) {
            console.warn('Not all ships placed for', player);
            return;
        }
        if (player === 'A') setReadyA(true);
        else setReadyB(true);

        // if both ready, start the game
        if ((player === 'A' ? true : readyA) && (player === 'B' ? true : readyB)) {
            // both ready
            setGameStarted(true);
            setTurn('A'); // decide starting player (A by default)
            console.log('Game started');
        }
    }

    function placeShip(index: number, player: PlayerA, shipId: string, length: number, orientationParam: 'horizontal' | 'vertical' = orientation) {
        // only allow placing on the currently selected placing player
        if (player !== placingPlayer) return;
        if (!selectedShip || selectedShip.id !== shipId) {
            console.warn('No ship selected or mismatch');
            return;
        }

        const row = Math.floor(index / 10);
        const col = index % 10;
        const positions: number[] = [];

        const targetBoard = player === 'A' ? boardA : boardB;

        if (orientationParam === 'horizontal') {
            if (col + length > 10) {
                console.warn('Ship does not fit horizontally from this position');
                return;
            }
            // check overlap horizontally
            for (let i = 0; i < length; i++) {
                if (targetBoard[index + i] !== null) {
                    console.warn('Cannot place ship: overlap at', index + i);
                    return;
                }
                positions.push(index + i);
            }
        } else {
            // vertical
            if (row + length > 10) {
                console.warn('Ship does not fit vertically from this position');
                return;
            }
            for (let i = 0; i < length; i++) {
                const pos = index + i * 10;
                if (targetBoard[pos] !== null) {
                    console.warn('Cannot place ship: overlap at', pos);
                    return;
                }
                positions.push(pos);
            }
        }

        const next = [...targetBoard];
        for (const p of positions) next[p] = `ship:${shipId}`;

        try {
            const key = player === 'A' ? 'boardA' : 'boardB';
            window.localStorage.setItem(key, JSON.stringify(next));
        } catch {}

        if (player === 'A') {
            setBoardA(next);
            setPlacedShipsA(prev => ({ ...prev, [shipId]: positions }));
        } else {
            setBoardB(next);
            setPlacedShipsB(prev => ({ ...prev, [shipId]: positions }));
        }

        setSelectedShip(null);
        console.log(`Placed ${shipId} for player ${player} at`, positions);
    }


    const url = '/data/scene.json';

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

        function normalizeScene(data: any): Scene {
            if (!data || !data.game) {
                // fallback a default
                return {
                    gameId: '',
                    currentTurn: 'player1',
                    winner: null,
                    state: '',
                    player1: { shipsPlaced: false, ready: false, name: '', id: null, board: { ships: [] } },
                    player2: { shipsPlaced: false, ready: false, name: '', id: null, board: { ships: [] } },
                };
            }

            const g = data.game;

            const scene: Scene = {
                gameId: data.gameId || g.gameId || '',
                currentTurn: g.currentTurn || 'player1',
                winner: g.winner ?? null,
                state: g.state || '',
                player1: {
                    shipsPlaced: g.player1?.shipsPlaced ?? false,
                    ready: g.player1?.ready ?? false,
                    name: g.player1?.name || 'player1',
                    id: g.player1?.id ?? null,
                    board: { ships: [] }, // por ahora vacío, puedes poblarlo después
                },
                player2: {
                    shipsPlaced: g.player2?.shipsPlaced ?? false,
                    ready: g.player2?.ready ?? false,
                    name: g.player2?.name || 'player2',
                    id: g.player2?.id ?? null,
                    board: { ships: [] },
                }
            };

            return scene;
        }


        async function fetchScene(): Promise<void> {
            try {
                const response = await fetch("http://localhost:8080/api/game/create", {
                    method: "POST", // <- changed from GET to POST
                    headers: {
                        "Content-Type": "application/json", // <- set if sending JSON
                    },
                    body: JSON.stringify({ /* any payload you want to send */ })
                });

                if (!response.ok) throw new Error(`Error al cargar el JSON: ${response.status}`);
                const data = await response.json();

                const normalized = normalizeScene(data);
                setScene(normalized);
                window.localStorage.setItem('board', JSON.stringify(normalized));
                console.log('normalized scene:', normalized);

            } catch (error) {
                console.error(error);
            }
        }
        fetchScene();

        return () => { /* cleanup */ };
    }, [url]);

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
                    <button onClick={resetBoards} className="mt-2 px-3 py-1 rounded border">Reset boards</button>
                </div>

                    <div className="ships-setup mt-4">
                    <h3 className="mb-2">Ships to place (Player {placingPlayer})</h3>
                        {lastActionMessage && (
                            <div className="mt-2 text-sm text-gray-700">{lastActionMessage}</div>
                        )}
                    <div className="ships-controls mb-2 flex items-center gap-3">
                        <div>
                            <label className="text-sm mr-2">Player:</label>
                            <button className={`px-2 py-1 rounded border ${placingPlayer === 'A' ? 'selected' : ''}`} onClick={() => setPlacingPlayer('A')}>A</button>
                            <button className={`px-2 py-1 rounded border ${placingPlayer === 'B' ? 'selected' : ''} ml-2`} onClick={() => setPlacingPlayer('B')}>B</button>
                        </div>
                        <div>
                            <label className="text-sm mr-2">Ships Orientation:</label>
                            <button
                                className={`px-2 py-1 rounded border ${orientation === 'horizontal' ? 'selected' : ''}`}
                                onClick={() => setOrientation('horizontal')}
                            >
                                Horizontal
                            </button>
                            <button
                                className={`px-2 py-1 rounded border ${orientation === 'vertical' ? 'selected' : ''} ml-2`}
                                onClick={() => setOrientation('vertical')}
                            >
                                Vertical
                            </button>
                        </div>
                        <div>
                            <button
                                className="ml-4 px-3 py-1 rounded border bg-green-50"
                                onClick={() => finishPlacing(placingPlayer)}
                                disabled={!allPlacedForPlayer(placingPlayer) || (placingPlayer === 'A' ? readyA : readyB)}
                            >
                                {placingPlayer === 'A' ? (readyA ? 'Placed' : 'Done placing (A)') : (readyB ? 'Placed' : 'Done placing (B)')}
                            </button>
                        </div>
                    </div>

                    <div className="ships-list flex gap-2">
                        {shipsCatalog.map(s => {
                            const isPlaced = placingPlayer === 'A' ? placedShipsA[s.id] : placedShipsB[s.id];
                            return (
                                <div key={s.id} className="p-2 border rounded">
                                    <div><strong>{s.name}</strong> ({s.length})</div>
                                    <div className="mt-1">
                                        {isPlaced ? (
                                            <span className="text-sm text-green-600">Placed</span>
                                        ) : (
                                            <button
                                                className={`px-2 py-1 rounded border ${selectedShip?.id === s.id ? 'selected' : ''}`}
                                                onClick={() => selectShipToPlace(s.id, s.name, s.length)}
                                            >
                                                {selectedShip?.id === s.id ? 'Selected' : 'Select'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                
            </header>
            <section className="game">
                <div className="boards-grid">
                    <div className={`player-column ${gameStarted && turn === 'A' ? 'active' : ''}`}>
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
                                orientation={orientation}
                            />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">A - Ataque</div>
                            <Board player="A" board={boardB} updateBoard={updateBoard} isAttackView={true} />
                        </div>
                    </div>

                    <div className={`player-column ${gameStarted && turn === 'B' ? 'active' : ''}`}>
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
                                orientation={orientation}
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
