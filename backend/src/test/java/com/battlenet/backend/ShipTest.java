package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Ship;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ShipTest {

    @Test
    void testConstructorWithTypeAndCells() {
        List<Cell> cells = Arrays.asList(new Cell(0,0), new Cell(0,1), new Cell(0,2));
        Ship ship = new Ship(Ship.ShipType.CRUISER, cells, true);

        assertEquals(Ship.ShipType.CRUISER, ship.getType());
        assertEquals(3, ship.getSize());
        assertEquals(cells, ship.getCells());
        assertTrue(ship.isHorizontal());
    }

    @Test
    void testConstructorWithSizeAndCells() {
        List<Cell> cells = Arrays.asList(new Cell(1,1), new Cell(1,2));
        Ship ship = new Ship(2, cells);
        assertEquals(2, ship.getSize());
        assertTrue(ship.isHorizontal());
        assertNull(ship.getType());
    }

    @Test
    void testSettersAndGetters() {
        List<Cell> cells = Arrays.asList(new Cell(1,1), new Cell(1,2));
        Ship ship = new Ship(2, cells);
        ship.setHorizontal(false);
        ship.setType(Ship.ShipType.DESTROYER);
        ship.setSize(5);
        ship.setCells(cells);

        assertEquals(Ship.ShipType.DESTROYER, ship.getType());
        assertEquals(5, ship.getSize());
        assertEquals(cells, ship.getCells());
        assertFalse(ship.isHorizontal());
    }

    @Test
    void testIsSunkAndHitCount() {
        List<Cell> cells = Arrays.asList(new Cell(0,0), new Cell(0,1));
        Ship ship = new Ship(2, cells);
        assertFalse(ship.isSunk());
        assertEquals(0, ship.getHitCount());

        cells.get(0).markHit();
        assertFalse(ship.isSunk());
        assertEquals(1, ship.getHitCount());

        cells.get(1).markHit();
        assertTrue(ship.isSunk());
        assertEquals(2, ship.getHitCount());
    }

    @Test
    void testEnumValues() {
        for (Ship.ShipType type : Ship.ShipType.values()) {
            assertTrue(type.getSize() > 0);
            assertNotNull(type.getDisplayName());
        }
    }
}