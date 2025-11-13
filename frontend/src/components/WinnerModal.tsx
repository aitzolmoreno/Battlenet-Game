import React from 'react';

interface WinnerModalProps {
    winner: string | null;
    onRematch: () => void;
    onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onRematch, onClose }) => {
    if (!winner) return null;

    const displayName = winner === 'player1' ? 'A' : winner === 'player2' ? 'B' : winner;
    const fullName = winner === 'player1' ? 'Player A' : winner === 'player2' ? 'Player B' : winner;

    return (
        <>
            <div className="winner-banner mt-2 px-3 py-1 rounded border bg-yellow-50">
                <strong>Winner:</strong> {winner}
            </div>
            <div className="modal-overlay">
                <div className="modal" role="dialog" aria-modal="true" aria-label="Game result">
                    <h2>Player {displayName} has winned</h2>
                    <p className="mt-2">
                        The game has finished. Final result: <strong>{fullName}</strong>
                    </p>
                    <div className="modal-actions mt-4">
                        <button 
                            className="px-3 py-1 rounded border mr-2 bg-blue-500 text-white hover:bg-blue-600" 
                            onClick={onRematch}
                        >
                            Rematch
                        </button>
                        <button 
                            className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300" 
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WinnerModal;
