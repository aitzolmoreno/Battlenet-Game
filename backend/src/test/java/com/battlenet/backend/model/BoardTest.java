package com.battlenet.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BoardTest {

    private Board board;

    @BeforeEach
    void setup() {
        board = new Board();
    }

    @Test
    void board_initialization_and_getters() {
        assertEquals(10, board.getSize());
        assertNotNull(board.getGrid());
        assertNotNull(board.getShips());
        // in-range cell
        assertNotNull(board.getCell(0, 0));
        // out-of-range returns null
        assertNull(board.getCell(-1, 0));
        assertNull(board.getCell(0, 10));
    }

    @Test
    void placeShip_success_and_grid_marks() {
        // Use the board's real cells so ship.cells references match grid cells
        Cell c0 = board.getCell(2, 2);
        Cell c1 = board.getCell(2, 3);
        Ship s = new Ship(Ship.ShipType.CRUISER, List.of(c0, c1), true);

        boolean placed = board.placeShip(s);
        assertTrue(placed, "Ship must be placed successfully");
        assertEquals(1, board.getShips().size(), "Ships list should contain the placed ship");

        // grid cells must be marked as having ship
        assertTrue(board.getCell(2, 2).hasShip());
        assertTrue(board.getCell(2, 3).hasShip());
    }

    @Test
    void placeShip_outOfBounds_returnsFalse_and_noSideEffect() {
        // create a cell outside the board bounds
        Cell out = new Cell(10, 10);
        Ship s = new Ship(Ship.ShipType.DESTROYER, List.of(out), true);
        assertFalse(board.placeShip(s));
        assertEquals(0, board.getShips().size());
    }

    @Test
    void placeShip_onAlreadyOccupiedCell_returnsFalse() {
        Cell c = board.getCell(4, 4);
        Ship s1 = new Ship(Ship.ShipType.DESTROYER, List.of(c), true);
        assertTrue(board.placeShip(s1));
        // second ship using same board cell
        Ship s2 = new Ship(Ship.ShipType.SUBMARINE, List.of(c), true);
        assertFalse(board.placeShip(s2), "Cannot place on already occupied cell");
        assertEquals(1, board.getShips().size());
    }

    @Test
    void shoot_outOfBounds_returnsFalse() {
        assertFalse(board.shoot(-1, 0));
        assertFalse(board.shoot(0, -1));
        assertFalse(board.shoot(10, 0));
        assertFalse(board.shoot(0, 10));
    }

    @Test
    void shoot_miss_and_repeat_missAlreadyHit() {
        // no ship at 0,0 initially
        assertFalse(board.shoot(0, 0)); // miss
        // now hitting again should return false (already hit)
        assertFalse(board.shoot(0, 0));
    }

    @Test
    void shoot_hit_marksCellAndReturnsTrue() {
        // place ship using real board cell so cell instance is same
        Cell c = board.getCell(5, 5);
        Ship s = new Ship(Ship.ShipType.DESTROYER, List.of(c), true);
        assertTrue(board.placeShip(s));

        // shoot the cell -> should be a hit
        assertTrue(board.shoot(5, 5));
        assertTrue(c.isHit());
        // shooting again returns false (already hit)
        assertFalse(board.shoot(5, 5));
    }

    @Test
    void allShipsSunk_falseAndTrueTransitions() {
        // no ships -> by current implementation allShipsSunk() returns true (empty list means all sunk)
        assertTrue(board.allShipsSunk(), "When no ships exist, allShipsSunk() returns true by implementation");

        // place a single-cell ship
        Cell c = board.getCell(6, 6);
        Ship s = new Ship(Ship.ShipType.DESTROYER, List.of(c), true);
        assertTrue(board.placeShip(s));

        // before hitting, ship not sunk => should be false
        assertFalse(board.allShipsSunk(), "After placing but before hitting, not all sunk");

        // hit the ship
        assertTrue(board.shoot(6, 6));

        // after hitting, now it's sunk
        assertTrue(board.allShipsSunk(), "After hitting the only ship, allShipsSunk() should return true");
    }   

    @Test
    void cell_getState_covers_all_branches() {
        Cell cell = new Cell(0, 0);
        // EMPTY
        assertEquals("EMPTY", cell.getState());

        // SHIP
        cell.setShip(true);
        assertEquals("SHIP", cell.getState());

        // MISS
        cell.setHit(true);
        cell.setShip(false);
        assertEquals("MISS", cell.getState());

        // HIT
        cell.setShip(true);
        assertEquals("HIT", cell.getState());

        // revert to defaults via setters for coverage
        cell.setX(5);
        cell.setY(6);
        assertEquals(5, cell.getX());
        assertEquals(6, cell.getY());
    }
}