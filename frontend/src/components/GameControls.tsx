import React from 'react';
import type { PlayerA } from '../pages/Game/Game';

interface GameControlsProps {
    placingPlayer: PlayerA;
    orientation: 'horizontal' | 'vertical';
    readyA: boolean;
    readyB: boolean;
    allShipsPlaced: boolean;
    onPlayerChange: (player: PlayerA) => void;
    onOrientationChange: (orientation: 'horizontal' | 'vertical') => void;
    onFinishPlacing: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
    placingPlayer,
    orientation,
    readyA,
    readyB,
    allShipsPlaced,
    onPlayerChange,
    onOrientationChange,
    onFinishPlacing
}) => {
    const isReady = placingPlayer === 'A' ? readyA : readyB;

    return (
        <div className="ships-controls mb-2 flex items-center gap-3">
            <div>
                <label className="text-sm mr-2">Player:</label>
                <button 
                    className={`px-2 py-1 rounded border ${placingPlayer === 'A' ? 'selected' : ''}`} 
                    onClick={() => onPlayerChange('A')}
                >
                    A
                </button>
                <button 
                    className={`px-2 py-1 rounded border ${placingPlayer === 'B' ? 'selected' : ''} ml-2`} 
                    onClick={() => onPlayerChange('B')}
                >
                    B
                </button>
            </div>
            <div>
                <label className="text-sm mr-2">Ships Orientation:</label>
                <button
                    className={`px-2 py-1 rounded border ${orientation === 'horizontal' ? 'selected' : ''}`}
                    onClick={() => onOrientationChange('horizontal')}
                >
                    Horizontal
                </button>
                <button
                    className={`px-2 py-1 rounded border ${orientation === 'vertical' ? 'selected' : ''} ml-2`}
                    onClick={() => onOrientationChange('vertical')}
                >
                    Vertical
                </button>
            </div>
            <div>
                <button
                    className="ml-4 px-3 py-1 rounded border bg-green-50"
                    onClick={onFinishPlacing}
                    disabled={!allShipsPlaced || isReady}
                >
                    {isReady ? 'Placed' : `Done placing (${placingPlayer})`}
                </button>
            </div>
        </div>
    );
};

export default GameControls;
