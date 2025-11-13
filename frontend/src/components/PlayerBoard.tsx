import React from 'react';
import Board from './Board';
import type { Player } from './Player';

interface PlayerBoardProps {
    player: Player;
    playerName: string;
    isActive: boolean;
    defenseBoard: (string | null)[];
    attackBoard: (string | null)[];
    placedShipsDefense: Record<string, number[]>;
    placedShipsAttack: Record<string, number[]>;
    sunkShipsDefense: Record<string, boolean>;
    sunkShipsAttack: Record<string, boolean>;
    updateBoard: (index: number, player: Player, action: string) => void;
    selectedShip: { id: string; name: string; length: number } | null;
    onPlaceShip: (index: number, player: Player, shipId: string, length: number, orientation?: 'horizontal' | 'vertical') => void;
    orientation: 'horizontal' | 'vertical';
}

const PlayerBoard: React.FC<PlayerBoardProps> = ({
    player,
    playerName,
    isActive,
    defenseBoard,
    attackBoard,
    placedShipsDefense,
    placedShipsAttack,
    sunkShipsDefense,
    sunkShipsAttack,
    updateBoard,
    selectedShip,
    onPlaceShip,
    orientation
}) => {
    return (
        <div className={`player-column ${isActive ? 'active' : ''}`}>
            <h2 className="player-title">{playerName}</h2>
            <div className="board-wrapper">
                <div className="board-label">{player} - Defensa</div>
                <Board
                    player={player}
                    board={defenseBoard}
                    updateBoard={updateBoard}
                    revealShips={true}
                    placedShips={placedShipsDefense}
                    sunkShips={sunkShipsDefense}
                    isPlacementMode={!!selectedShip}
                    placingShipId={selectedShip?.id ?? null}
                    placingShipLength={selectedShip?.length ?? 0}
                    onPlaceShip={onPlaceShip}
                    orientation={orientation}
                />
            </div>

            <div className="board-wrapper">
                <div className="board-label">{player} - Ataque</div>
                <Board 
                    player={player} 
                    board={attackBoard} 
                    updateBoard={updateBoard} 
                    isAttackView={true} 
                    placedShips={placedShipsAttack} 
                    sunkShips={sunkShipsAttack} 
                />
            </div>
        </div>
    );
};

export default PlayerBoard;
