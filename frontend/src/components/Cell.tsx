import React from "react";
import type { Player } from "./Player";

interface CellProps {
    index: number;
    player: Player;
    value: string | null;
    updateBoard: (index: number, player: Player, action: string) => void;
    children?: React.ReactNode;
}

interface CellProps {
    index: number;
    player: Player;
    value: string | null;
    updateBoard: (index: number, player: Player, action: string) => void;
    children?: React.ReactNode;
    isAttackView?: boolean;
    revealShips?: boolean;
}

const Cell: React.FC<CellProps> = ({
    index,
    player,
    value,
    updateBoard,
    children,
    isAttackView = false,
    revealShips = false,
}) => {
function handleClick() {
    const action = "attack"; 
    updateBoard(index, player, action);
}

function renderContent() {
    // defense view: show actual content (ships/marks)
    if (revealShips) return children;

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
    <button className="cell" onClick={handleClick}>
        {renderContent()}
    </button>
);
};

export default Cell;
