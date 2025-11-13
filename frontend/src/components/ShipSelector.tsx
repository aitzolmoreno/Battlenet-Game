import React from 'react';

interface Ship {
    id: string;
    name: string;
    length: number;
}

interface ShipSelectorProps {
    ships: Ship[];
    placedShips: Record<string, number[]>;
    selectedShip: { id: string; name: string; length: number } | null;
    onSelectShip: (shipId: string, name: string, length: number) => void;
}

const ShipSelector: React.FC<ShipSelectorProps> = ({
    ships,
    placedShips,
    selectedShip,
    onSelectShip
}) => {
    return (
        <div className="ships-list flex gap-2">
            {ships.map(s => {
                const isPlaced = placedShips[s.id];
                return (
                    <div key={s.id} className="p-2 border rounded">
                        <div><strong>{s.name}</strong> ({s.length})</div>
                        <div className="mt-1">
                            {isPlaced ? (
                                <span className="text-sm text-green-600">Placed</span>
                            ) : (
                                <button
                                    className={`px-2 py-1 rounded border ${selectedShip?.id === s.id ? 'selected' : ''}`}
                                    onClick={() => onSelectShip(s.id, s.name, s.length)}
                                >
                                    {selectedShip?.id === s.id ? 'Selected' : 'Select'}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ShipSelector;
