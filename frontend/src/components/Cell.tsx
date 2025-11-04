import React from "react";
import type { Player } from "./Player";

interface CellProps {
    index: number;
    player: Player;
    value: string | null;
    updateBoard: (index: number, player: Player, action: string) => void;
    children?: React.ReactNode;
    isAttackView?: boolean;
    revealShips?: boolean;
    isPlacementMode?: boolean;
    placingShipId?: string | null;
    placingShipLength?: number;
    onPlaceShip?: (index: number, player: Player, shipId: string, length: number) => void;
}

const Cell: React.FC<CellProps> = ({
    index,
    player,
    value,
    updateBoard,
    children,
    isAttackView = false,
    revealShips = false,
    isPlacementMode = false,
    placingShipId = null,
    placingShipLength = 0,
    onPlaceShip,
}) => {
function handleClick() {
    // If we are in placement mode and a ship is selected, call onPlaceShip
    if (isPlacementMode && placingShipId && onPlaceShip) {
        onPlaceShip(index, player, placingShipId, placingShipLength ?? 0);
        return;
    }

    const action = "attack"; 
    updateBoard(index, player, action);
}

function renderContent() {
    // defense view: show actual content (ships/marks)
    if (revealShips) {
        if (typeof value === 'string' && value.startsWith('ship:')) return '🚢';
        return children;
    }

    // attack view: only show known hits/attacks
    if (isAttackView) {
        // current app stores a mark 'Attck' when attacking — show 'X' for that
        if (value === 'Attck' || value === 'Hit') return 'X';
        if (value === 'Miss') return 'O';
        return null;
    }

    // default: show children
    return children;
}

return (
    <div className="cell" onClick={handleClick}>
        {renderContent()}
    </div>
);
};

export default Cell;
