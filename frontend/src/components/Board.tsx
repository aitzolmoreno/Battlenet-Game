import React from "react";
import Cell from "./Cell";
import type { Player } from "./Player";

interface BoardProps {
    player: Player;
    board: (string | null)[];
    updateBoard: (index: number, player: Player, action: string) => void;
    /** Si true se renderiza como vista de ataque (solo mostrar hits/misses) */
    isAttackView?: boolean;
    /** Si true se muestran los barcos/valores tal cual (vista propia/defensa) */
    revealShips?: boolean;
    /** Props para colocar barcos: si se proporciona, las celdas llaman a onPlaceShip en vez de updateBoard */
    isPlacementMode?: boolean;
    placingShipId?: string | null;
    placingShipLength?: number;
    onPlaceShip?: (index: number, player: Player, shipId: string, length: number) => void;
}

const Board: React.FC<BoardProps> = ({ player, board, updateBoard, isAttackView = false, revealShips = false, isPlacementMode = false, placingShipId = null, placingShipLength = 0, onPlaceShip }) => {
    return (
    <div className="board">
        {board.map((cell, index) => (
        <Cell
            key={index}
            index={index}
            player={player}
            value={cell}
            updateBoard={updateBoard}
            isAttackView={isAttackView}
            revealShips={revealShips}
            isPlacementMode={isPlacementMode}
            placingShipId={placingShipId}
            placingShipLength={placingShipLength}
            onPlaceShip={onPlaceShip}
        >
            {cell}
        </Cell>
        ))}
    </div>
    );
};

export default Board;
