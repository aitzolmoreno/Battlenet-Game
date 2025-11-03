package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Player;
import com.battlenet.backend.model.Ship;

import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class PlayerTest {

    @Test
    void testPlayerCreation() {
        Player p = new Player("Alice");
        assertEquals("Alice", p.getName());
        assertNotNull(p.getBoard());
    }

    @Test
    void testPlaceShip() {
        Player p = new Player("Bob");
        Ship s = new Ship(1, Arrays.asList(new Cell(0, 0)));
        assertTrue(p.placeShip(s));
        assertEquals(1, p.getBoard().getShips().size());
    }

    @Test
    void testReadyStatus() {
        Player p = new Player("Carl");
        assertFalse(p.isReady());
        p.setReady(true);
        assertTrue(p.isReady());
    }
}

