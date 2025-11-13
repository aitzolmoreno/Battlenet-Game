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
import { computeSunkShips, allShipsPlaced, computePlacement, interpretShootResponse, interpretPlaceShipResponse, interpretStartResponse, parseCreateGameResponse, computeSceneWithCell, computeResetState, checkLocalWinner, isGameReadyToStart, applyLocalPlacement } from './helpers';

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
                    const opponentPlaced = player === 'A' ? placedShipsB : placedShipsA;
                    const interp = interpretShootResponse(resp, index, player, targetBoard, opponentPlaced);

                    // set immediate last action message (Hit/Miss)
                    if (interp.lastActionMessage) setLastActionMessage(interp.lastActionMessage);

                    if (player === 'A') {
                        setBoardBState(interp.updatedBoard);
                        setBoardB(interp.updatedBoard);
                        for (const shipId of interp.newlySunk) {
                            setSunkShipsB(prev => ({ ...prev, [shipId]: true }));
                            // mirror previous behavior: message about sunk ship (owner is B)
                            setLastActionMessage(`Ship ${shipId} sunk (B)`);
                        }
                    } else {
                        setBoardAState(interp.updatedBoard);
                        setBoardA(interp.updatedBoard);
                        for (const shipId of interp.newlySunk) {
                            setSunkShipsA(prev => ({ ...prev, [shipId]: true }));
                            setLastActionMessage(`Ship ${shipId} sunk (A)`);
                        }
                    }

                    if (interp.winner) {
                        setWinner(interp.winner);
                        setGameStarted(false);
                        setLastActionMessage(interp.winner ? `Game Over — winner: ${interp.winner}` : 'Game Over');
                    }

                    if (interp.nextTurn) setTurn(interp.nextTurn);
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
                        // Check for local win
                        const localWinner = checkLocalWinner('A', placedShipsB, targetBoard);
                        if (localWinner) {
                            setWinner(localWinner);
                            setGameStarted(false);
                            setLastActionMessage(`Game Over — winner: ${localWinner}`);
                        }
                    } else {
                        setBoardAState(targetBoard);
                        setBoardA(targetBoard);
                        detectAndMarkSunk('A', targetBoard);
                        // Check for local win
                        const localWinner = checkLocalWinner('B', placedShipsA, targetBoard);
                        if (localWinner) {
                            setWinner(localWinner);
                            setGameStarted(false);
                            setLastActionMessage(`Game Over — winner: ${localWinner}`);
                        }
                    }

                    setTurn(prev => prev === 'A' ? 'B' : 'A');
            }
        }
    }

    function detectAndMarkSunk(player: PlayerA, boardArr: (string | null)[]) {
        // player is the owner of the board being checked (whose ships might be sunk)
        const placed = player === 'A' ? placedShipsA : placedShipsB;
        const sunk = player === 'A' ? sunkShipsA : sunkShipsB;

        const newlySunk = computeSunkShips(placed, boardArr);
        for (const shipId of newlySunk) {
            if (sunk[shipId]) continue; // already marked
            if (player === 'A') {
                setSunkShipsA(prev => ({ ...prev, [shipId]: true }));
            } else {
                setSunkShipsB(prev => ({ ...prev, [shipId]: true }));
            }
            setLastActionMessage(`Ship ${shipId} sunk (${player})`);
        }
    }

    function resetBoards() {
        // use data layer to reset everything
        const res = resetAll();
        // update in-memory state via helper
        const normalized = computeResetState(res);
        setBoardAState(normalized.boardA);
        setBoardBState(normalized.boardB);
        setPlacedShipsA(normalized.placedA || {});
        setPlacedShipsB(normalized.placedB || {});
        setSelectedShip(null);
        setPlacingPlayer('A');
        setOrientation('horizontal');
        setReadyA(false);
        setReadyB(false);
        setGameStarted(false);
        setTurn('A');
        try {
            setScene(normalized.scene as Scene);
            try { setStoredScene(normalized.scene as Scene); } catch {}
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
        if (isGameReadyToStart(readyA, readyB, player)) {
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
                    const startRes = interpretStartResponse(resp);
                    if (startRes.started) {
                        setGameStarted(true);
                        setTurn('A');
                        setLastActionMessage(startRes.message || 'Game started (server)');
                    } else {
                        setLastActionMessage(startRes.message || 'Could not start game');
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

        const targetBoard = player === 'A' ? boardA : boardB;
        const placement = computePlacement(index, length, orientationParam, targetBoard);
        if (!placement.ok) {
            console.warn(placement.reason);
            return;
        }
        const positions = placement.positions;

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
                // Interpret server response and apply minimal state changes
                const placeResult = interpretPlaceShipResponse(resp, player, next, shipId, positions);

                if (placeResult && placeResult.accepted === false) {
                    setLastActionMessage(placeResult.message || 'Placement failed');
                    return;
                }

                // commit local state if backend accepted (or no explicit success flag)
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
                setLastActionMessage((placeResult && placeResult.message) || resp.message || 'Ship placed');
            })
            .catch(err => {
                console.error('Place ship error', err);
                setLastActionMessage('Error contacting server');
            });
        } else {
            // local-only behavior: just commit
            const localResult = applyLocalPlacement(player, shipId, positions, next);
            if (player === 'A') {
                setBoardAState(localResult.board);
                setBoardA(localResult.board); // persist
                setPlacedShipsA(prev => ({ ...prev, ...localResult.placed }));
            } else {
                setBoardBState(localResult.board);
                setBoardB(localResult.board); // persist
                setPlacedShipsB(prev => ({ ...prev, ...localResult.placed }));
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
            const parsed = parseCreateGameResponse(resp);
            if (parsed.id) {
                setGameId(parsed.id);
                setLastActionMessage(`Created game ${parsed.id}`);
            } else {
                setLastActionMessage(parsed.message || 'Could not create game on server');
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
            const next = computeSceneWithCell(prev, playerKey, shipIndex, cellIndex, value) as Scene;
            try { window.localStorage.setItem('board', JSON.stringify(next)); } catch {}
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
