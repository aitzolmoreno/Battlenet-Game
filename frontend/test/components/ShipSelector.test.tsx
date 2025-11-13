import { render, screen, fireEvent } from '@testing-library/react';
import ShipSelector from '../../src/components/ShipSelector';

describe('ShipSelector', () => {
    const mockShips = [
        { id: 1, name: 'Carrier', length: 5 },
        { id: 2, name: 'Battleship', length: 4 },
        { id: 3, name: 'Destroyer', length: 3 },
    ];

    it('should render all ships', () => {
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={null}
                onSelectShip={jest.fn()}
            />
        );
        
        expect(screen.getByText('Carrier')).toBeInTheDocument();
        expect(screen.getByText('Battleship')).toBeInTheDocument();
        expect(screen.getByText('Destroyer')).toBeInTheDocument();
    });

    it('should show ship lengths', () => {
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={null}
                onSelectShip={jest.fn()}
            />
        );
        
        expect(screen.getByText(/\(5\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(4\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
    });

    it('should show "Placed" for placed ships', () => {
        const placedShips = { 1: true };
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={placedShips}
                selectedShip={null}
                onSelectShip={jest.fn()}
            />
        );
        
        expect(screen.getByText('Placed')).toBeInTheDocument();
    });

    it('should show "Select" button for unplaced ships', () => {
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={null}
                onSelectShip={jest.fn()}
            />
        );
        
        const selectButtons = screen.getAllByText('Select');
        expect(selectButtons).toHaveLength(3);
    });

    it('should call onSelectShip when Select button is clicked', () => {
        const onSelectShip = jest.fn();
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={null}
                onSelectShip={onSelectShip}
            />
        );
        
        const selectButtons = screen.getAllByText('Select');
        fireEvent.click(selectButtons[0]);
        
        expect(onSelectShip).toHaveBeenCalledWith(1, 'Carrier', 5);
    });

    it('should show "Selected" for the selected ship', () => {
        const selectedShip = { id: 2, name: 'Battleship', length: 4 };
        render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={selectedShip}
                onSelectShip={jest.fn()}
            />
        );
        
        expect(screen.getByText('Selected')).toBeInTheDocument();
    });

    it('should apply selected class to selected ship', () => {
        const selectedShip = { id: 2, name: 'Battleship', length: 4 };
        const { container } = render(
            <ShipSelector
                ships={mockShips}
                placedShips={{}}
                selectedShip={selectedShip}
                onSelectShip={jest.fn()}
            />
        );
        
        const selectedButton = screen.getByText('Selected');
        expect(selectedButton.className).toContain('selected');
    });
});
