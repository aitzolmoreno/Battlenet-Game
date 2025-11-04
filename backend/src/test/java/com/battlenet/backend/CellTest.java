package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;

import static org.junit.jupiter.api.Assertions.*;

class CellTest {

    @Test
    void testInitialStateAndGettersSetters() {
        Cell c = new Cell(2, 3);
        assertEquals(2, c.getX());
        assertEquals(3, c.getY());
        assertFalse(c.isHit());
        assertFalse(c.hasShip());

        c.setX(5);
        c.setY(6);
        c.setHit(true);
        c.setShip(true);

        assertEquals(5, c.getX());
        assertEquals(6, c.getY());
        assertTrue(c.isHit());
        assertTrue(c.hasShip());
    }

    @Test
    void testMarkHitAndGetStateCombinations() {
        Cell c1 = new Cell(0, 0);
        assertEquals("EMPTY", c1.getState());

        c1.setShip(true);
        assertEquals("SHIP", c1.getState());

        c1.markHit();
        assertEquals("HIT", c1.getState());

        Cell c2 = new Cell(1, 1);
        c2.markHit();
        assertEquals("MISS", c2.getState());
    }

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

