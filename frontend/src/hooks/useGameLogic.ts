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

    // Sincronizar estado desde el backend
    const syncBoardState = async () => {
        if (!gameId) return;
        
        try {
            const response: any = await apiFetch(`/api/game/${gameId}/board-state`);
            if (response.success) {
                setBoardAState(response.player1Board);
                setBoardA(response.player1Board);
                setBoardBState(response.player2Board);
                setBoardB(response.player2Board);
                setSunkShipsA(response.player1SunkShips || {});
                setSunkShipsB(response.player2SunkShips || {});
                setTurn(response.currentTurn === 'player1' ? 'A' : 'B');
                if (response.winner) {
                    setWinner(response.winner);
                }
            }
        } catch (error) {
            console.error('Error syncing board state:', error);
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

            if (gameId) {
                apiFetch(`/api/game/${gameId}/shoot`, {
                    method: 'POST',
                    body: JSON.stringify({ x: row, y: col }),
                })
                .then(async (resp: any) => {
                    // Sincronizar todo el estado desde el backend
                    await syncBoardState();
                    
                    const result = resp.result;
                    const isHit = typeof result === 'string' && result.toLowerCase().includes('hit');
                    setLastActionMessage(`Player ${player} ${isHit ? 'HIT' : 'missed'} ${opponent} at ${index}`);

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
                // Modo local sin backend
                const isHit = typeof current === 'string' && current.startsWith('ship:');
                targetBoard[index] = isHit ? 'Hit' : 'Miss';
                setLastActionMessage(`Player ${player} ${isHit ? 'HIT' : 'missed'} ${opponent} at ${index}`);
                
                if (player === 'A') {
                    setBoardBState(targetBoard);
                    setBoardB(targetBoard);
                } else {
                    setBoardAState(targetBoard);
                    setBoardA(targetBoard);
                }
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
