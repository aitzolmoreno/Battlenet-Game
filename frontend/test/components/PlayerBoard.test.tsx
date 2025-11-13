import { render, screen } from '@testing-library/react';
import PlayerBoard from '../../src/components/PlayerBoard';
import type { CellState, PlacedShipsMap, SunkShipsMap } from '../../src/pages/Game/Game';

const mockUpdateBoard = jest.fn();
const mockOnPlaceShip = jest.fn();

const emptyBoard: CellState[][] = Array(10).fill(null).map(() =>
    Array(10).fill(null).map(() => ({ state: 'empty' as const, shipId: null }))
);

describe('PlayerBoard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render player name', () => {
        render(
            <PlayerBoard
                player="A"
                playerName="Player A"
                isActive={false}
                defenseBoard={emptyBoard}
                attackBoard={emptyBoard}
                placedShipsDefense={{}}
                placedShipsAttack={{}}
                sunkShipsDefense={{}}
                sunkShipsAttack={{}}
                updateBoard={mockUpdateBoard}
                selectedShip={null}
                onPlaceShip={mockOnPlaceShip}
                orientation="horizontal"
            />
        );
        
        expect(screen.getByText('Player A')).toBeInTheDocument();
    });

    it('should render defense and attack boards', () => {
        render(
            <PlayerBoard
                player="A"
                playerName="Player A"
                isActive={false}
                defenseBoard={emptyBoard}
                attackBoard={emptyBoard}
                placedShipsDefense={{}}
                placedShipsAttack={{}}
                sunkShipsDefense={{}}
                sunkShipsAttack={{}}
                updateBoard={mockUpdateBoard}
                selectedShip={null}
                onPlaceShip={mockOnPlaceShip}
                orientation="horizontal"
            />
        );
        
        expect(screen.getByText(/Defensa/i)).toBeInTheDocument();
        expect(screen.getByText(/Ataque/i)).toBeInTheDocument();
    });

    it('should apply active class when player is active', () => {
        const { container } = render(
            <PlayerBoard
                player="A"
                playerName="Player A"
                isActive={true}
                defenseBoard={emptyBoard}
                attackBoard={emptyBoard}
                placedShipsDefense={{}}
                placedShipsAttack={{}}
                sunkShipsDefense={{}}
                sunkShipsAttack={{}}
                updateBoard={mockUpdateBoard}
                selectedShip={null}
                onPlaceShip={mockOnPlaceShip}
                orientation="horizontal"
            />
        );
        
        const playerColumn = container.querySelector('.player-column');
        expect(playerColumn?.className).toContain('active');
    });

    it('should not apply active class when player is not active', () => {
        const { container } = render(
            <PlayerBoard
                player="A"
                playerName="Player A"
                isActive={false}
                defenseBoard={emptyBoard}
                attackBoard={emptyBoard}
                placedShipsDefense={{}}
                placedShipsAttack={{}}
                sunkShipsDefense={{}}
                sunkShipsAttack={{}}
                updateBoard={mockUpdateBoard}
                selectedShip={null}
                onPlaceShip={mockOnPlaceShip}
                orientation="horizontal"
            />
        );
        
        const playerColumn = container.querySelector('.player-column');
        expect(playerColumn?.className).not.toContain('active');
    });
});
