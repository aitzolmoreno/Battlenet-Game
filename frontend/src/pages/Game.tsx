import React, { useEffect, useState, type JSX } from 'react';
import Board from '../components/Board';

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

    const exampleCell = getCell('player1', 0, 0);

    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold">Battlenet Game</h1>
                <div className="header-actions">
                    <button className="mt-2 mr-2 px-3 py-1 rounded bg-blue-600 text-white">Attack</button>
                    <button onClick={resetBoards} className="mt-2 px-3 py-1 rounded border">Reset boards</button>
                </div>

                <section className="mt-4 grid gap-2">
                    {scene?.player1?.board?.ships?.length ? (
                        scene.player1.board.ships.map((ship: Ship, idx: number) => (
                            <article key={ship.id ?? idx} className="p-2 border rounded">
                                <strong>{ship.name ?? `Ship ${idx}`}</strong>
                                <div>Cells: {Array.isArray(ship.cell) ? ship.cell.join(', ') : '—'}</div>
                            </article>
                        ))
                    ) : (
                        <p>Loading or no ships...</p>
                    )}

                    <div className="mt-4">
                        <p>
                            Ejemplo: <code>scene.player1.board.ships[0].cell[0]</code> =&nbsp;
                            <strong>{String(exampleCell)}</strong>
                        </p>

                        <div className="mt-2">
                            <button
                                className="mr-2 px-3 py-1 rounded border"
                                onClick={() => console.log('Valor celda ejemplo:', getCell('player1', 0, 0))}
                            >
                                Log cell[0] of ship 0
                            </button>

                            <button
                                className="px-3 py-1 rounded border"
                                onClick={() => setCell('player1', 0, 0, '1000')}
                            >
                                Set example cell to 'X'
                            </button>
                        </div>
                    </div>
                </section>
            </header>
            <section className="game">
                <div className="boards-grid">
                    <div className="player-column">
                        <h2 className="player-title">Player A</h2>
                        <div className="board-wrapper">
                            <div className="board-label">A - Defensa</div>
                            <Board player="A" board={boardA} updateBoard={updateBoard} revealShips={true} />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">A - Ataque</div>
                            <Board player="A" board={boardB} updateBoard={updateBoard} isAttackView={true} />
                        </div>
                    </div>

                    <div className="player-column">
                        <h2 className="player-title">Player B</h2>
                        <div className="board-wrapper">
                            <div className="board-label">B - Defensa</div>
                            <Board player="B" board={boardB} updateBoard={updateBoard} revealShips={true} />
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
