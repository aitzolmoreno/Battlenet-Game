import React from "react";
import Cell from "./Cell";
import type { Player } from "./Player";

interface BoardProps {
    player: Player;
    board: (string | null)[];
    updateBoard: (index: number, player: Player, action: string) => void;
}

const Board: React.FC<BoardProps> = ({ player, board, updateBoard }) => {
    return (
    <div className="board">
        {board.map((cell, index) => (
        <Cell
            key={index}
            index={index}
            player={player}
            value={cell}
            updateBoard={updateBoard}
        >
            {cell}
        </Cell>
        ))}
    </div>
    );
};

export default Board;
