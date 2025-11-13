import React, { useEffect, useState, type JSX } from 'react';
import Board from '../../components/Board';
import './Game.css';
import {
    getBoardA,
    setBoardA,
    getBoardB,
    setBoardB,
    getScene as getStoredScene,
    setScene as setStoredScene,
    getPlacedShips,
    setPlacedShips,
    resetAll,
    DEFAULT_SCENE,
} from '../../lib/data';

import { apiFetch } from '../../lib/api';

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

    const [boardA, setBoardAState] = useState<(string | null)[]>(() => getBoardA());

    const [boardB, setBoardBState] = useState<(string | null)[]>(() => getBoardB());

    const [turn, setTurn] = useState<PlayerA>("A");
    const [gameId, setGameId] = useState<string | null>(null);
    const [sunkShipsA, setSunkShipsA] = useState<Record<string, boolean>>({});
    const [sunkShipsB, setSunkShipsB] = useState<Record<string, boolean>>({});
    const [winner, setWinner] = useState<string | null>(null);

    // lista de barcos
    const shipsCatalog = [
        { id: 'carrier', name: 'Carrier', length: 5 },
        { id: 'battleship', name: 'Battleship', length: 4 },
        { id: 'cruiser', name: 'Cruiser', length: 3 },
        { id: 'submarine', name: 'Submarine', length: 3 },
        { id: 'destroyer', name: 'Destroyer', length: 2 },
    ];

    // Track placed ships for players (simple map: shipId -> positions[])
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>(() => getPlacedShips('A'));
    const [placedShipsB, setPlacedShipsB] = useState<Record<string, number[]>>(() => getPlacedShips('B'));
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

            // compute coordinates
            const row = Math.floor(index / 10);
            const col = index % 10;

            if (gameId) {
                apiFetch(`/api/game/${gameId}/shoot`, {
                    method: 'POST',
                    body: JSON.stringify({ x: row, y: col }),
                })
                .then((resp: any) => {
                    console.log('Shoot response:', resp);
                    const result = resp.result;
                    if (typeof result === 'string' && result.toLowerCase().includes('hit')) {
                        targetBoard[index] = 'Hit';
                        setLastActionMessage(`Player ${player} HIT ${opponent} at ${index}`);
                    } else {
                        targetBoard[index] = 'Miss';
                        setLastActionMessage(`Player ${player} missed at ${index}`);
                    }

                    if (player === 'A') {
                        setBoardBState(targetBoard);
                        setBoardB(targetBoard);
                        // detect sunk for player B's ships
                        detectAndMarkSunk('B', targetBoard);
                    } else {
                        setBoardAState(targetBoard);
                        setBoardA(targetBoard);
                        detectAndMarkSunk('A', targetBoard);
                    }

                    // handle game over / winner from server
                    console.log('Checking winner: isGameOver=', resp.isGameOver, 'winner=', resp.winner);
                    if (resp.isGameOver || resp.winner) {
                        const winName = resp.winner || null;
                        console.log('Setting winner to:', winName);
                        setWinner(winName);
                        setGameStarted(false);
                        setLastActionMessage(winName ? `Game Over — winner: ${winName}` : 'Game Over');
                    } else {
                        // also check local state: if all opponent ships are sunk locally
                        const opponentPlaced = player === 'A' ? placedShipsB : placedShipsA;
                        const allSunk = Object.keys(opponentPlaced).length > 0 && 
                                        Object.keys(opponentPlaced).every(shipId => {
                                            const positions = opponentPlaced[shipId] || [];
                                            return positions.every(pos => targetBoard[pos] === 'Hit');
                                        });
                        console.log('Local check: all ships sunk?', allSunk);
                        if (allSunk) {
                            // local detection: this player won
                            const winnerName = player === 'A' ? 'player1' : 'player2';
                            console.log('Setting winner to (local):', winnerName);
                            setWinner(winnerName);
                            setGameStarted(false);
                            setLastActionMessage(`Game Over — winner: ${winnerName}`);
                        }
                    }

                    if (resp.currentTurn) {
                        setTurn(resp.currentTurn === 'player1' ? 'A' : 'B');
                    }
                })
                .catch(err => {
                    console.error('Error shooting', err);
                    setLastActionMessage('Error contacting server');
                });
            } else {
                // fallback local behavior
                if (typeof current === 'string' && current.startsWith('ship:')) {
                    targetBoard[index] = 'Hit';
                    setLastActionMessage(`Player ${player} HIT ${opponent} at ${index}`);
                } else {
                    targetBoard[index] = 'Miss';
                    setLastActionMessage(`Player ${player} missed at ${index}`);
                }

                    if (player === 'A') {
                        setBoardBState(targetBoard);
                        setBoardB(targetBoard);
                        detectAndMarkSunk('B', targetBoard);
                    } else {
                        setBoardAState(targetBoard);
                        setBoardA(targetBoard);
                        detectAndMarkSunk('A', targetBoard);
                    }

                    setTurn(prev => prev === 'A' ? 'B' : 'A');
            }
        }
    }

    function detectAndMarkSunk(player: PlayerA, boardArr: (string | null)[]) {
        // player is the owner of the board being checked (whose ships might be sunk)
        const placed = player === 'A' ? placedShipsA : placedShipsB;
        const sunk = player === 'A' ? sunkShipsA : sunkShipsB;

        for (const shipId of Object.keys(placed)) {
            if (sunk[shipId]) continue; // already marked
            const positions = placed[shipId] || [];
            if (positions.length === 0) continue;
            const allHit = positions.every(pos => boardArr[pos] === 'Hit');
            if (allHit) {
                // mark sunk
                if (player === 'A') {
                    setSunkShipsA(prev => ({ ...prev, [shipId]: true }));
                } else {
                    setSunkShipsB(prev => ({ ...prev, [shipId]: true }));
                }
                setLastActionMessage(`Ship ${shipId} sunk (${player})`);
            }
        }
    }

    function resetBoards() {
        // use data layer to reset everything
        const res = resetAll();
        // update in-memory state
        setBoardAState(res.boardA);
        setBoardBState(res.boardB);
        setPlacedShipsA(res.placedA || {});
        setPlacedShipsB(res.placedB || {});
        setSelectedShip(null);
        setPlacingPlayer('A');
        setOrientation('horizontal');
        setReadyA(false);
        setReadyB(false);
        setGameStarted(false);
        setTurn('A');
        try {
            setScene(res.scene as Scene);
            try { setStoredScene(res.scene as Scene); } catch {}
        } catch {}

        // clear winner and sunk markers
        setWinner(null);
        setSunkShipsA({});
        setSunkShipsB({});

        console.log('Boards and game state reset to initial values (via data layer)');
        // create a fresh backend game as well
        try { createGame(); } catch {}
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

        // if both ready, start the game (call backend)
        if ((player === 'A' ? true : readyA) && (player === 'B' ? true : readyB)) {
            // ensure we have a game on the server
            const start = async () => {
                try {
                    if (!gameId) {
                        await createGame();
                        if (!gameId) {
                            setLastActionMessage('Unable to create game on server');
                            return;
                        }
                    }
                    const resp: any = await apiFetch(`/api/game/${gameId}/start`, { method: 'POST' });
                    if (resp.success) {
                        setGameStarted(true);
                        setTurn('A');
                        setLastActionMessage('Game started (server)');
                    } else {
                        setLastActionMessage(resp.message || 'Could not start game');
                    }
                } catch (e) {
                    console.error('start game error', e);
                    setLastActionMessage('Error starting game on server');
                }
            };
            start();
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

        // If we have a backend game, call place-ship endpoint first
        if (gameId) {
            const row = Math.floor(index / 10);
            const col = index % 10;
            apiFetch(`/api/game/${gameId}/place-ship`, {
                method: 'POST',
                body: JSON.stringify({
                    player: player === 'A' ? 1 : 2,
                    shipType: shipId.toString().toUpperCase(),
                    x: row,
                    y: col,
                    horizontal: orientationParam === 'horizontal'
                })
            })
            .then((resp: any) => {

                if (!resp.success && resp.success !== undefined) {
                    setLastActionMessage(resp.message || 'Placement failed');
                    return;
                }

                // commit local state if backend accepted
                if (player === 'A') {
                    setBoardAState(next);
                    setBoardA(next);
                    setPlacedShipsA(prev => {
                        const newPlaced = { ...prev, [shipId]: positions };
                        try { setPlacedShips('A', newPlaced); } catch {}
                        return newPlaced;
                    });
                } else {
                    setBoardBState(next);
                    setBoardB(next);
                    setPlacedShipsB(prev => {
                        const newPlaced = { ...prev, [shipId]: positions };
                        try { setPlacedShips('B', newPlaced); } catch {}
                        return newPlaced;
                    });
                }
                setSelectedShip(null);
                setLastActionMessage(resp.message || 'Ship placed');
            })
            .catch(err => {
                console.error('Place ship error', err);
                setLastActionMessage('Error contacting server');
            });
        } else {
            // local-only behavior: just commit
            if (player === 'A') {
                setBoardAState(next);
                setBoardA(next); // persist
                setPlacedShipsA(prev => ({ ...prev, [shipId]: positions }));
            } else {
                setBoardBState(next);
                setBoardB(next); // persist
                setPlacedShipsB(prev => ({ ...prev, [shipId]: positions }));
            }

            setSelectedShip(null);
            console.log(`Placed ${shipId} for player ${player} at`, positions);
        }
    }


    // default scene moved to data layer (DEFAULT_SCENE)

    const [scene, setScene] = useState<Scene>(() => {
        try {
            const stored = getStoredScene();
            return stored ? (stored as Scene) : (DEFAULT_SCENE as Scene);
        } catch (e) {
            console.error('Error getting stored scene:', e);
            return DEFAULT_SCENE as Scene;
        }
    });

    useEffect(() => {
        // scene is initialized from the data layer (getStoredScene) on mount.
        // Keep this effect minimal for now; it can be expanded to fetch/normalize
        // remote scene data later if needed.
        // create a backend game when the component mounts (dev convenience)
        createGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // create a backend game and set gameId
    async function createGame(): Promise<void> {
        try {
            const resp: any = await apiFetch('/api/game/create', { method: 'POST' });
            const id = resp.gameId || resp.game?.gameId;
            if (id) {
                setGameId(id);
                setLastActionMessage(`Created game ${id}`);
            } else {
                setLastActionMessage('Could not create game on server');
            }
        } catch (e) {
            console.error('createGame error', e);
            setLastActionMessage('Error creating game on server');
        }
    }

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
                {winner && (
                    <div className="winner-banner mt-2 px-3 py-1 rounded border bg-yellow-50">
                        <strong>Winner:</strong> {winner}
                    </div>
                )}
                {winner && (
                    <div className="modal-overlay">
                        <div className="modal" role="dialog" aria-modal="true" aria-label="Game result">
                            <h2>Player {winner === 'player1' ? 'A' : winner === 'player2' ? 'B' : winner} has winned</h2>
                            <p className="mt-2">The game has finished. Final result: <strong>{winner === 'player1' ? 'Player A' : winner === 'player2' ? 'Player B' : winner}</strong></p>
                            <div className="modal-actions mt-4">
                                <button className="px-3 py-1 rounded border mr-2 bg-blue-500 text-white hover:bg-blue-600" onClick={() => { resetBoards(); setWinner(null); }}>Rematch</button>
                                <button className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300" onClick={() => setWinner(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
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
                                placedShips={placedShipsA}
                                sunkShips={sunkShipsA}
                                isPlacementMode={!!selectedShip}
                                placingShipId={selectedShip?.id ?? null}
                                placingShipLength={selectedShip?.length ?? 0}
                                onPlaceShip={placeShip}
                                orientation={orientation}
                            />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">A - Ataque</div>
                            <Board player="A" board={boardB} updateBoard={updateBoard} isAttackView={true} placedShips={placedShipsB} sunkShips={sunkShipsB} />
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
                                placedShips={placedShipsB}
                                sunkShips={sunkShipsB}
                                isPlacementMode={!!selectedShip}
                                placingShipId={selectedShip?.id ?? null}
                                placingShipLength={selectedShip?.length ?? 0}
                                onPlaceShip={placeShip}
                                orientation={orientation}
                            />
                        </div>

                        <div className="board-wrapper">
                            <div className="board-label">B - Ataque</div>
                            <Board player="B" board={boardA} updateBoard={updateBoard} isAttackView={true} placedShips={placedShipsA} sunkShips={sunkShipsA} />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
