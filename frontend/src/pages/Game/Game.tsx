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

    // Track placed ships for player A (simple map: shipId -> positions[])
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>({});
    const [selectedShip, setSelectedShip] = useState<{id: string; name: string; length: number} | null>(null);

    function updateBoard(index: number, player: PlayerA, action: string) {
        if (player !== turn) return;

        if (action === "attack") {
            const targetBoard = player === "A" ? [...boardB] : [...boardA];
            targetBoard[index] = "Attck"; //en este caso hemos puesto que haga ataque, pero deberiamos de poner mas cosas
            player === "A" ? setBoardB(targetBoard) : setBoardA(targetBoard);
        }

        setTurn(turn === "A" ? "B" : "A");
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

    function placeShip(index: number, player: PlayerA, shipId: string, length: number) {
        // only allow placing on player A's defense board in this simple UI
        if (player !== 'A') return;
        if (!selectedShip || selectedShip.id !== shipId) {
            console.warn('No ship selected or mismatch');
            return;
        }

        const col = index % 10;
        if (col + length > 10) {
            console.warn('Ship does not fit horizontally from this position');
            return;
        }

        // check overlap
        for (let i = 0; i < length; i++) {
            if (boardA[index + i] !== null) {
                console.warn('Cannot place ship: overlap at', index + i);
                return;
            }
        }

        const next = [...boardA];
        const positions: number[] = [];
        for (let i = 0; i < length; i++) {
            next[index + i] = `ship:${shipId}`;
            positions.push(index + i);
        }

        try { window.localStorage.setItem('boardA', JSON.stringify(next)); } catch {}
        setBoardA(next);
        setPlacedShipsA(prev => ({ ...prev, [shipId]: positions }));
        setSelectedShip(null);
        console.log(`Placed ${shipId} at`, positions);
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
