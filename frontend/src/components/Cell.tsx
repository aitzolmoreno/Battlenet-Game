import React from "react";
import type { Player } from "./Player";

interface CellProps {
    index: number;
    player: Player;
    value: string | null;
    updateBoard: (index: number, player: Player, action: string) => void;
    children?: React.ReactNode;
}

const Cell: React.FC<CellProps> = ({
    index,
    player,
    value,
    updateBoard,
    children,
}) => {
function handleClick() {
    const action = "attack"; 
    updateBoard(index, player, action);
}

return (
    <div className="cell" onClick={handleClick}>
        {children}
    </div>
);
};

export default Cell;
