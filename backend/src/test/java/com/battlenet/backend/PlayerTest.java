package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Player;
import com.battlenet.backend.model.Ship;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PlayerTest {

    @Test
    void testPlayerConstructorAndGetters() {
        Player player = new Player("John");
        assertEquals("John", player.getName());
        assertNotNull(player.getBoard());
        assertFalse(player.isReady());
    }

    @Test
    void testPlayerConstructorWithId() {
        Player player = new Player("1", "Alice");
        assertEquals("1", player.getId());
        assertEquals("Alice", player.getName());
    }

    @Test
    void testSetters() {
        Player player = new Player("Bob");
        player.setId("10");
        player.setName("Robert");
        player.setReady(true);

        assertEquals("10", player.getId());
        assertEquals("Robert", player.getName());
        assertTrue(player.isReady());
    }

    @Test
    void testPlaceShipAndAllShipsPlaced() {
        Player player = new Player("PlayerX");
        for (int i = 0; i < 4; i++) {
            Ship ship = new Ship(Ship.ShipType.DESTROYER, List.of(new Cell(i, 0), new Cell(i, 1)), true);
            assertTrue(player.placeShip(ship));
        }
        assertFalse(player.allShipsPlaced());

        // Add a fifth ship
        Ship fifth = new Ship(Ship.ShipType.SUBMARINE, List.of(new Cell(5, 0), new Cell(5, 1), new Cell(5, 2)), true);
        assertTrue(player.placeShip(fifth));

        assertTrue(player.allShipsPlaced());
    }
}