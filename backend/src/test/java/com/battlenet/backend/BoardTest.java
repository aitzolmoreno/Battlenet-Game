package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Board;
import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Ship;

import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class BoardTest {

    @Test
    void testPlaceShipValid() {
        Board board = new Board();
        Ship s = new Ship(2, Arrays.asList(new Cell(0, 0), new Cell(0, 1)));
        assertTrue(board.placeShip(s));
    }

    @Test
    void testPlaceShipOverlapOrInvalid() {
        Board board = new Board();
        Ship valid = new Ship(2, Arrays.asList(new Cell(1, 1), new Cell(1, 2)));
        board.placeShip(valid);

        Ship overlap = new Ship(1, Arrays.asList(new Cell(1, 1)));
        assertFalse(board.placeShip(overlap));

        Ship oob = new Ship(1, Arrays.asList(new Cell(12, 12)));
        assertFalse(board.placeShip(oob));
    }

    @Test
    void testShootHitAndMiss() {
        Board board = new Board();
        Cell a = new Cell(0, 0);
        Ship s = new Ship(1, Arrays.asList(a));
        board.placeShip(s);

        assertTrue(board.shoot(0, 0)); // hit
        assertFalse(board.shoot(0, 0)); // already hit
        assertFalse(board.shoot(5, 5)); // miss
    }

    @Test
    void testAllShipsSunk() {
        Board board = new Board();
        Cell a = new Cell(0, 0);
        Ship s = new Ship(1, Arrays.asList(a));
        board.placeShip(s);

        assertFalse(board.allShipsSunk());
        board.shoot(0, 0);
        assertTrue(board.allShipsSunk());
    }
}

