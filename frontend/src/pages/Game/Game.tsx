import { useEffect, type JSX } from 'react';
import './Game.css';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useShipPlacement } from '../../hooks/useShipPlacement';
import WinnerModal from '../../components/WinnerModal';
import GameControls from '../../components/GameControls';
import ShipSelector from '../../components/ShipSelector';
import PlayerBoard from '../../components/PlayerBoard';

export type PlayerA = "A" | "B";

export default function Game(): JSX.Element {
    const shipsCatalog = [
        { id: 'carrier', name: 'Carrier', length: 5 },
        { id: 'battleship', name: 'Battleship', length: 4 },
        { id: 'cruiser', name: 'Cruiser', length: 3 },
        { id: 'submarine', name: 'Submarine', length: 3 },
        { id: 'destroyer', name: 'Destroyer', length: 2 },
    ];

    const {
        boardA,
        boardB,
        turn,
        sunkShipsA,
        sunkShipsB,
        winner,
        placedShipsA,
        placedShipsB,
        gameStarted,
        lastActionMessage,
        setBoardAState,
        setBoardBState,
        setPlacedShipsA,
        setPlacedShipsB,
        setWinner,
        setLastActionMessage,
        updateBoard,
        resetBoards,
        createGame,
        startGame,
        gameId,
    } = useGameLogic();

    const {
        selectedShip,
        placingPlayer,
        orientation,
        readyA,
        readyB,
        setPlacingPlayer,
        setOrientation,
        selectShipToPlace,
        allPlacedForPlayer,
        finishPlacing,
        placeShip,
        resetPlacement,
    } = useShipPlacement({
        boardA,
        boardB,
        placedShipsA,
        placedShipsB,
        shipsCatalog,
        gameId,
        setBoardAState,
        setBoardBState,
        setPlacedShipsA,
        setPlacedShipsB,
        setLastActionMessage,
        startGame,
    });

    useEffect(() => {
        createGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResetBoards = () => {
        resetBoards();
        resetPlacement();
    };

    const handleRematch = () => {
        resetBoards();
        resetPlacement();
        setWinner(null);
    };

    return (
        <main className="p-4">
            <header>
                <h1 className="text-2xl font-bold">Battlenet Game</h1>
                
                <WinnerModal 
                    winner={winner} 
                    onRematch={handleRematch} 
                    onClose={() => setWinner(null)} 
                />

                <div className="header-actions">
                    <button onClick={handleResetBoards} className="mt-2 px-3 py-1 rounded border">
                        Reset boards
                    </button>
                </div>

                <div className="ships-setup mt-4">
                    <h3 className="mb-2">Ships to place (Player {placingPlayer})</h3>
                    {lastActionMessage && (
                        <div className="mt-2 text-sm text-gray-700">{lastActionMessage}</div>
                    )}
                    
                    <GameControls
                        placingPlayer={placingPlayer}
                        orientation={orientation}
                        readyA={readyA}
                        readyB={readyB}
                        allShipsPlaced={allPlacedForPlayer(placingPlayer)}
                        onPlayerChange={setPlacingPlayer}
                        onOrientationChange={setOrientation}
                        onFinishPlacing={() => finishPlacing(placingPlayer)}
                    />

                    <ShipSelector
                        ships={shipsCatalog}
                        placedShips={placingPlayer === 'A' ? placedShipsA : placedShipsB}
                        selectedShip={selectedShip}
                        onSelectShip={selectShipToPlace}
                    />
                </div>
            </header>

            <section className="game">
                <div className="boards-grid">
                    <PlayerBoard
                        player="A"
                        playerName="Player A"
                        isActive={gameStarted && turn === 'A'}
                        defenseBoard={boardA}
                        attackBoard={boardB}
                        placedShipsDefense={placedShipsA}
                        placedShipsAttack={placedShipsB}
                        sunkShipsDefense={sunkShipsA}
                        sunkShipsAttack={sunkShipsB}
                        updateBoard={updateBoard}
                        selectedShip={selectedShip}
                        onPlaceShip={placeShip}
                        orientation={orientation}
                    />

                    <PlayerBoard
                        player="B"
                        playerName="Player B"
                        isActive={gameStarted && turn === 'B'}
                        defenseBoard={boardB}
                        attackBoard={boardA}
                        placedShipsDefense={placedShipsB}
                        placedShipsAttack={placedShipsA}
                        sunkShipsDefense={sunkShipsB}
                        sunkShipsAttack={sunkShipsA}
                        updateBoard={updateBoard}
                        selectedShip={selectedShip}
                        onPlaceShip={placeShip}
                        orientation={orientation}
                    />
                </div>
            </section>
        </main>
    );
}
