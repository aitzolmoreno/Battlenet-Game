import { useState } from 'react';
import type { PlayerA } from '../pages/Game/Game';

interface Ship {
    id: string;
    name: string;
    length: number;
}

interface UseShipPlacementProps {
    boardA: (string | null)[];
    boardB: (string | null)[];
    placedShipsA: Record<string, number[]>;
    placedShipsB: Record<string, number[]>;
    shipsCatalog: Ship[];
    setBoardAState: React.Dispatch<React.SetStateAction<(string | null)[]>>;
    setBoardBState: React.Dispatch<React.SetStateAction<(string | null)[]>>;
    setPlacedShipsA: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
    setPlacedShipsB: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
    setLastActionMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useShipPlacement = ({
    boardA,
    boardB,
    placedShipsA,
    placedShipsB,
    shipsCatalog,
    setBoardAState,
    setBoardBState,
    setPlacedShipsA,
    setPlacedShipsB,
    setLastActionMessage,
    setGameStarted,
}: UseShipPlacementProps) => {
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
    const [placingPlayer, setPlacingPlayer] = useState<PlayerA>('A');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const [readyA, setReadyA] = useState(false);
    const [readyB, setReadyB] = useState(false);

    const selectShipToPlace = (shipId: string, name: string, length: number) => {
        if (selectedShip?.id === shipId) {
            setSelectedShip(null);
            return;
        }
        const already = placingPlayer === 'A' ? placedShipsA[shipId] : placedShipsB[shipId];
        if (already) {
            console.warn('Ship already placed for player', placingPlayer, shipId);
            return;
        }
        setSelectedShip({ id: shipId, name, length });
    };

    const allPlacedForPlayer = (player: PlayerA) => {
        return shipsCatalog.every(s => {
            const record = player === 'A' ? placedShipsA : placedShipsB;
            return !!record[s.id];
        });
    };

    const finishPlacing = (player: PlayerA) => {
        if (!allPlacedForPlayer(player)) {
            console.warn('Not all ships placed for', player);
            return;
        }
        if (player === 'A') setReadyA(true);
        else setReadyB(true);

        if ((player === 'A' ? true : readyA) && (player === 'B' ? true : readyB)) {
            setGameStarted(true);
        }
    };

    const placeShip = (index: number, player: PlayerA, shipId: string, length: number, orientationParam: 'horizontal' | 'vertical' = orientation) => {
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
                setLastActionMessage('Ship does not fit horizontally (out of bounds)');
                return;
            }
            for (let i = 0; i < length; i++) {
                if (targetBoard[index + i] !== null) {
                    setLastActionMessage(`Cannot place ship: overlaps with existing ship`);
                    return;
                }
                positions.push(index + i);
            }
        } else {
            if (row + length > 10) {
                setLastActionMessage('Ship does not fit vertically (out of bounds)');
                return;
            }
            for (let i = 0; i < length; i++) {
                const pos = index + i * 10;
                if (targetBoard[pos] !== null) {
                    setLastActionMessage(`Cannot place ship: overlaps with existing ship`);
                    return;
                }
                positions.push(pos);
            }
        }

        const next = [...targetBoard];
        for (const p of positions) next[p] = `ship:${shipId}`;

        if (player === 'A') {
            setBoardAState(next);
            setPlacedShipsA(prev => ({ ...prev, [shipId]: positions }));
        } else {
            setBoardBState(next);
            setPlacedShipsB(prev => ({ ...prev, [shipId]: positions }));
        }
        setSelectedShip(null);
        setLastActionMessage(`Placed ${shipId} for player ${player}`);
    };

    const resetPlacement = () => {
        setSelectedShip(null);
        setPlacingPlayer('A');
        setOrientation('horizontal');
        setReadyA(false);
        setReadyB(false);
    };

    return {
        selectedShip,
        placingPlayer,
        orientation,
        readyA,
        readyB,
        selectShipToPlace,
        placeShip,
        finishPlacing,
        resetPlacement,
        setPlacingPlayer,
        setOrientation,
        allPlacedForPlayer,
    };
};
