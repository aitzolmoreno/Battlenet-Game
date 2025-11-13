import { render, screen, fireEvent } from '@testing-library/react';
import WinnerModal from '../../src/components/WinnerModal';

describe('WinnerModal', () => {
    it('should not render when winner is null', () => {
        const { container } = render(
            <WinnerModal winner={null} onRematch={jest.fn()} onClose={jest.fn()} />
        );
        expect(container.querySelector('.modal-overlay')).toBeNull();
    });

    it('should render when winner is provided', () => {
        render(<WinnerModal winner="player1" onRematch={jest.fn()} onClose={jest.fn()} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Player A has winned/i)).toBeInTheDocument();
    });

    it('should display Player B when winner is player2', () => {
        render(<WinnerModal winner="player2" onRematch={jest.fn()} onClose={jest.fn()} />);
        expect(screen.getByText(/Player B has winned/i)).toBeInTheDocument();
    });

    it('should call onRematch when Rematch button is clicked', () => {
        const onRematch = jest.fn();
        render(<WinnerModal winner="player1" onRematch={onRematch} onClose={jest.fn()} />);
        
        const rematchButton = screen.getByText('Rematch');
        fireEvent.click(rematchButton);
        
        expect(onRematch).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Close button is clicked', () => {
        const onClose = jest.fn();
        render(<WinnerModal winner="player1" onRematch={jest.fn()} onClose={onClose} />);
        
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should display custom winner name', () => {
        render(<WinnerModal winner="custom" onRematch={jest.fn()} onClose={jest.fn()} />);
        expect(screen.getByText(/custom has winned/i)).toBeInTheDocument();
    });
});
