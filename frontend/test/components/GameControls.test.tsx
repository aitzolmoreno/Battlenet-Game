import { render, screen, fireEvent } from '@testing-library/react';
import GameControls from '../../src/components/GameControls';

describe('GameControls', () => {
    it('should render player controls', () => {
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={false}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        expect(screen.getByText('Player:')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should call onPlayerChange when player button is clicked', () => {
        const onPlayerChange = jest.fn();
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={false}
                onPlayerChange={onPlayerChange}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        const playerBButton = screen.getByText('B');
        fireEvent.click(playerBButton);
        
        expect(onPlayerChange).toHaveBeenCalledWith('B');
    });

    it('should render orientation controls', () => {
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={false}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        expect(screen.getByText('Ships Orientation:')).toBeInTheDocument();
        expect(screen.getByText('Horizontal')).toBeInTheDocument();
        expect(screen.getByText('Vertical')).toBeInTheDocument();
    });

    it('should call onOrientationChange when orientation button is clicked', () => {
        const onOrientationChange = jest.fn();
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={false}
                onPlayerChange={jest.fn()}
                onOrientationChange={onOrientationChange}
                onFinishPlacing={jest.fn()}
            />
        );
        
        const verticalButton = screen.getByText('Vertical');
        fireEvent.click(verticalButton);
        
        expect(onOrientationChange).toHaveBeenCalledWith('vertical');
    });

    it('should disable finish button when not all ships are placed', () => {
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={false}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        const finishButton = screen.getByText('Done placing (A)');
        expect(finishButton).toBeDisabled();
    });

    it('should enable finish button when all ships are placed', () => {
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={true}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        const finishButton = screen.getByText('Done placing (A)');
        expect(finishButton).not.toBeDisabled();
    });

    it('should show "Placed" when player A is ready', () => {
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={true}
                readyB={false}
                allShipsPlaced={true}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={jest.fn()}
            />
        );
        
        expect(screen.getByText('Placed')).toBeInTheDocument();
    });

    it('should call onFinishPlacing when finish button is clicked', () => {
        const onFinishPlacing = jest.fn();
        render(
            <GameControls
                placingPlayer="A"
                orientation="horizontal"
                readyA={false}
                readyB={false}
                allShipsPlaced={true}
                onPlayerChange={jest.fn()}
                onOrientationChange={jest.fn()}
                onFinishPlacing={onFinishPlacing}
            />
        );
        
        const finishButton = screen.getByText('Done placing (A)');
        fireEvent.click(finishButton);
        
        expect(onFinishPlacing).toHaveBeenCalledTimes(1);
    });
});
