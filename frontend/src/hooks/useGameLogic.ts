import { useState } from 'react';
import type { PlayerA } from '../pages/Game/Game';

export const useGameLogic = () => {
    const [boardA, setBoardAState] = useState<(string | null)[]>(() => Array(100).fill(null));
    const [boardB, setBoardBState] = useState<(string | null)[]>(() => Array(100).fill(null));
    const [turn, setTurn] = useState<PlayerA>("A");
    const [winner, setWinner] = useState<string | null>(null);
    const [placedShipsA, setPlacedShipsA] = useState<Record<string, number[]>>({});
    const [placedShipsB, setPlacedShipsB] = useState<Record<string, number[]>>({});
    const [gameStarted, setGameStarted] = useState(false);
    const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

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

            const isHit = typeof current === 'string' && current.startsWith('ship:');
            targetBoard[index] = isHit ? 'Hit' : 'Miss';
            setLastActionMessage(`Player ${player} ${isHit ? 'HIT' : 'missed'} ${opponent} at ${index}`);
            
            if (player === 'A') {
                setBoardBState(targetBoard);
            } else {
                setBoardAState(targetBoard);
            }
            setTurn(prev => prev === 'A' ? 'B' : 'A');
        }
    };

    const resetBoards = () => {
        setBoardAState(Array(100).fill(null));
        setBoardBState(Array(100).fill(null));
        setPlacedShipsA({});
        setPlacedShipsB({});
        setWinner(null);
        setGameStarted(false);
        setTurn('A');
        setLastActionMessage('Boards reset');
    };

    return {
        boardA,
        boardB,
        turn,
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
        setGameStarted,
        updateBoard,
        resetBoards,
    };
};
