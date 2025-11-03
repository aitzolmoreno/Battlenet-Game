package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Ship;

import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class ShipTest {

    @Test
    void testShipCreation() {
        Cell c1 = new Cell(0, 0);
        Cell c2 = new Cell(0, 1);
        Ship s = new Ship(2, Arrays.asList(c1, c2));

        assertEquals(2, s.getSize());
        assertEquals(2, s.getCells().size());
        assertFalse(s.isSunk());
    }

    @Test
    void testHitsAndSink() {
        Cell c1 = new Cell(0, 0);
        Cell c2 = new Cell(0, 1);
        Ship s = new Ship(2, Arrays.asList(c1, c2));

        c1.markHit();
        assertEquals(1, s.getHitCount());
        assertFalse(s.isSunk());

        c2.markHit();
        assertTrue(s.isSunk());
    }

    @Test
    void testOrientation() {
        Ship s = new Ship(3, Arrays.asList(new Cell(0, 0), new Cell(0, 1), new Cell(0, 2)));
        s.setHorizontal(true);
        assertTrue(s.isHorizontal());
    }
}
