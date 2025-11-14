import { renderHook, act } from '@testing-library/react';
import { useShipPlacement } from '../../src/hooks/useShipPlacement';

describe('useShipPlacement additional coverage', () => {
  const mockProps = {
    boardA: Array(100).fill(null),
    boardB: Array(100).fill(null),
    placedShipsA: {},
    placedShipsB: {},
    shipsCatalog: [
      { id: 'carrier', name: 'Carrier', length: 5 },
      { id: 'destroyer', name: 'Destroyer', length: 2 },
    ],
    setBoardAState: jest.fn(),
    setBoardBState: jest.fn(),
    setPlacedShipsA: jest.fn(),
    setPlacedShipsB: jest.fn(),
    setLastActionMessage: jest.fn(),
    setGameStarted: jest.fn(),
  };

  test('placeShip places ship successfully', () => {
    const { result } = renderHook(() => useShipPlacement(mockProps));
    
    act(() => {
      result.current.selectShipToPlace('destroyer', 'Destroyer', 2);
    });

    act(() => {
      result.current.placeShip(0, 'A', 'destroyer', 2, 'horizontal');
    });
    
    expect(mockProps.setBoardAState).toHaveBeenCalled();
    expect(mockProps.setLastActionMessage).toHaveBeenCalledWith('Placed destroyer for player A');
  });

  test('finishPlacing starts game when both ready', () => {
    const propsAllPlaced = {
      ...mockProps,
      placedShipsA: { carrier: [0, 1, 2, 3, 4], destroyer: [10, 11] },
      placedShipsB: { carrier: [0, 1, 2, 3, 4], destroyer: [10, 11] },
    };
    
    const { result } = renderHook(() => useShipPlacement(propsAllPlaced));
    
    act(() => {
      result.current.finishPlacing('A');
    });

    act(() => {
      result.current.finishPlacing('B');
    });
    
    expect(propsAllPlaced.setGameStarted).toHaveBeenCalledWith(true);
  });

  test('allPlacedForPlayer returns correct value', () => {
    const { result } = renderHook(() => useShipPlacement(mockProps));
    
    expect(result.current.allPlacedForPlayer('A')).toBe(false);
  });
});
