import React from "react";
import type { Player } from "./Player";

interface CellProps {
    index: number;
    player: Player;
    value: string | null;
    updateBoard: (index: number, player: Player, action: string) => void;
    isAttackView?: boolean;
    revealShips?: boolean;
    isPlacementMode?: boolean;
    placingShipId?: string | null;
    placingShipLength?: number;
    onPlaceShip?: (index: number, player: Player, shipId: string, length: number, orientation?: 'horizontal' | 'vertical') => void;
    orientation?: 'horizontal' | 'vertical';
    isSunk?: boolean;
}

const Cell: React.FC<CellProps> = ({
    index,
    player,
    value,
    updateBoard,
    isAttackView = false,
    revealShips = false,
    isPlacementMode = false,
    placingShipId = null,
    placingShipLength = 0,
    onPlaceShip,
    orientation = 'horizontal',
    isSunk = false,
}) => {
    const handleClick = () => {
        if (isPlacementMode && placingShipId && onPlaceShip) {
            onPlaceShip(index, player, placingShipId, placingShipLength, orientation);
            return;
        }
        updateBoard(index, player, "attack");
    };

    const renderContent = () => {
        if (revealShips) {
            if (value === 'Hit') return '💥';
            if (value === 'Miss') return 'O';
            if (typeof value === 'string' && value.startsWith('ship:')) return '🚢';
            return null;
        }

        if (isAttackView) {
            if (value === 'Attck' || value === 'Hit') return 'X';
            if (value === 'Miss') return 'O';
            return null;
        }

        return null;
    };

    return (
        <button className={`cell${isSunk ? ' sunk' : ''}`} onClick={handleClick}>
            {renderContent()}
        </button>
    );
};

export default Cell;
