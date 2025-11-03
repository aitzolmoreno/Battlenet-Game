package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;

import static org.junit.jupiter.api.Assertions.*;

class CellTest {

    @Test
    void testInitialValues() {
        Cell c = new Cell(1, 2);
        assertEquals(1, c.getX());
        assertEquals(2, c.getY());
        assertFalse(c.isHit());
        assertFalse(c.hasShip());
    }

    @Test
    void testMarkHitWithoutShip() {
        Cell c = new Cell(0, 0);
        c.markHit();
        assertTrue(c.isHit());
        assertFalse(c.hasShip());
    }

    @Test
    void testMarkHitWithShip() {
        Cell c = new Cell(1, 1);
        c.setShip(true);
        c.markHit();
        assertTrue(c.isHit());
        assertTrue(c.hasShip());
    }

    @Test
    void testToString() {
        Cell c = new Cell(0, 0);
        assertNotNull(c.toString());
    }
}

