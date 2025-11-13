import { useState } from 'react';
import type { PlayerA } from '../pages/Game/Game';
import { apiFetch } from '../lib/api';
import {
    getBoardA,
    setBoardA,
    getBoardB,
    setBoardB,
    getPlacedShips,
    setPlacedShips,
    resetAll,
} from '../lib/data';

export const useGameLogic = () => {
    const [boardA, setBoardAState] = useState<(string | null)[]>(() => getBoardA());
    const [boardB, setBoardBState] = useState<(string | null)[]>(() => getBoardB());
    const [turn, setTurn] = useState<PlayerA>("A");
    const [gameId, setGameId] = useState<string | null>(null);
    const [sunkShipsA, setSunkShipsA] = useState<Record<string, boolean>>({});
    const [sunkShipsB, setSunkShipsB] = useState<Record<string, boolean>>({});
    const [winner, setWinner] = useState<string | null>(null);
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>(() => getPlacedShips('A'));
    const [placedShipsB, setPlacedShipsB] = useState<Record<string, number[]>>(() => getPlacedShips('B'));
    const [gameStarted, setGameStarted] = useState(false);
    const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

    const detectAndMarkSunk = (player: PlayerA, boardArr: (string | null)[]) => {
        const placed = player === 'A' ? placedShipsA : placedShipsB;
        const sunk = player === 'A' ? sunkShipsA : sunkShipsB;

        for (const shipId of Object.keys(placed)) {
            if (sunk[shipId]) continue;
            const positions = placed[shipId] || [];
            if (positions.length === 0) continue;
            const allHit = positions.every(pos => boardArr[pos] === 'Hit');
            if (allHit) {
                if (player === 'A') {
                    setSunkShipsA(prev => ({ ...prev, [shipId]: true }));
                } else {
                    setSunkShipsB(prev => ({ ...prev, [shipId]: true }));
                }
                setLastActionMessage(`Ship ${shipId} sunk (${player})`);
            }
        }
    };

    const updateBoard = (index: number, player: PlayerA, action: string) => {
        if (action === 'attack' && !gameStarted) {
            console.warn('Cannot attack: game has not started yet');
            return;
        }

        if (player !== turn) return;

        if (action === "attack") {
            const opponent = player === 'A' ? 'B' : 'A';
            const targetBoard = player === "A" ? [...boardB] : [...boardA];
            const current = targetBoard[index];
            
            if (current === 'Hit' || current === 'Miss') {
                setLastActionMessage('Already attacked this cell');
                return;
            }

            const row = Math.floor(index / 10);
            const col = index % 10;

            const updateBoardState = (isHit: boolean) => {
                targetBoard[index] = isHit ? 'Hit' : 'Miss';
                setLastActionMessage(`Player ${player} ${isHit ? 'HIT' : 'missed'} ${opponent} at ${index}`);
                
                if (player === 'A') {
                    setBoardBState(targetBoard);
                    setBoardB(targetBoard);
                    detectAndMarkSunk('B', targetBoard);
                } else {
                    setBoardAState(targetBoard);
                    setBoardA(targetBoard);
                    detectAndMarkSunk('A', targetBoard);
                }
            };

            if (gameId) {
                apiFetch(`/api/game/${gameId}/shoot`, {
                    method: 'POST',
                    body: JSON.stringify({ x: row, y: col }),
                })
                .then((resp: any) => {
                    const result = resp.result;
                    const isHit = typeof result === 'string' && result.toLowerCase().includes('hit');
                    updateBoardState(isHit);

                    if (resp.isGameOver || resp.winner) {
                        setWinner(resp.winner || null);
                        setGameStarted(false);
                        setLastActionMessage(resp.winner ? `Game Over — winner: ${resp.winner}` : 'Game Over');
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
                const isHit = typeof current === 'string' && current.startsWith('ship:');
                updateBoardState(isHit);
                setTurn(prev => prev === 'A' ? 'B' : 'A');
            }
        }
    };

    const resetBoards = async () => {
        const res = resetAll();
        setBoardAState(res.boardA);
        setBoardBState(res.boardB);
        setPlacedShipsA(res.placedA || {});
        setPlacedShipsB(res.placedB || {});
        setWinner(null);
        setSunkShipsA({});
        setSunkShipsB({});
        setGameStarted(false);
        setTurn('A');
        console.log('Boards and game state reset to initial values');
    };

    const createGame = async (): Promise<void> => {
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
    };

    const startGame = async () => {
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

    return {
        boardA,
        boardB,
        turn,
        gameId,
        sunkShipsA,
        sunkShipsB,
        winner,
        placedShipsA,
        placedShipsB,
        gameStarted,
        lastActionMessage,
        setBoardAState,
        setBoardBState,
        setPlacedShipsA,
        setPlacedShipsB,
        setWinner,
        setLastActionMessage,
        updateBoard,
        resetBoards,
        createGame,
        startGame,
    };
};
