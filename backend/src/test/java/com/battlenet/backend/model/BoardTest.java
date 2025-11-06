package com.battlenet.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BoardTest {

    private Board board;

    @BeforeEach
    void setUp() {
        board = new Board();
    }

    @Test
    void testInitialization() {
        assertEquals(10, board.getSize());
        assertNotNull(board.getGrid());
        assertEquals(0, board.getShips().size());
        assertNotNull(board.getCell(0,0));
        assertNull(board.getCell(-1,0));
    }

    @Test
    void testPlaceShipSuccessfully() {
        List<Cell> cells = Arrays.asList(new Cell(0,0), new Cell(0,1));
        Ship ship = new Ship(Ship.ShipType.DESTROYER, cells, true);
        boolean result = board.placeShip(ship);
        assertTrue(result);
        assertEquals(1, board.getShips().size());
        assertTrue(board.getCell(0,0).hasShip());
        assertTrue(board.getCell(0,1).hasShip());
    }

    @Test
    void testPlaceShipOutOfBounds() {
        List<Cell> cells = Arrays.asList(new Cell(10,0));
        Ship ship = new Ship(Ship.ShipType.DESTROYER, cells, true);
        assertFalse(board.placeShip(ship));
        assertEquals(0, board.getShips().size());
    }

    @Test
    void testPlaceShipOverlapping() {
        List<Cell> cells1 = Arrays.asList(new Cell(1,1));
        Ship ship1 = new Ship(Ship.ShipType.DESTROYER, cells1, true);
        assertTrue(board.placeShip(ship1));

        List<Cell> cells2 = Arrays.asList(new Cell(1,1));
        Ship ship2 = new Ship(Ship.ShipType.CRUISER, cells2, true);
        assertFalse(board.placeShip(ship2));
        assertEquals(1, board.getShips().size());
    }

    @Test
    void testShootOutOfBounds() {
        assertFalse(board.shoot(-1,0));
        assertFalse(board.shoot(10,10));
    }

    @Test
    void testShootAlreadyHit() {
        board.getCell(0,0).markHit();
        assertFalse(board.shoot(0,0));
    }

    @Test
    void testShootHitAndMiss() {
        List<Cell> cells = Arrays.asList(new Cell(2,2));
        Ship ship = new Ship(Ship.ShipType.DESTROYER, cells, true);
        board.placeShip(ship);

        assertTrue(board.shoot(2,2)); // hit
        assertFalse(board.shoot(2,2)); // already hit
        assertFalse(board.shoot(0,0)); // miss
    }

    @Test
    void testAllShipsSunk() {
        List<Cell> cells = Arrays.asList(new Cell(1,1), new Cell(1,2));
        Ship ship = new Ship(Ship.ShipType.DESTROYER, cells, true);
        board.placeShip(ship);
        assertFalse(board.allShipsSunk());
        cells.forEach(Cell::markHit);
        assertTrue(board.allShipsSunk());
    }
}

