import React, { useEffect, useState, type JSX } from 'react';

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
        let mounted = true;

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

        return () => { mounted = false; };
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
                <button className="mt-2 px-3 py-1 rounded bg-blue-600 text-white">Attack</button>

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
        </main>
    );
}