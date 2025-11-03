package com.battlenet.backend;

import org.junit.jupiter.api.Test;

import com.battlenet.backend.model.Cell;
import com.battlenet.backend.model.Game;
import com.battlenet.backend.model.Player;
import com.battlenet.backend.model.Ship;

import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

class GameTest {

    @Test
    void testGameStartAndTurnSwitching() {
        Game g = new Game("game1", "A", "B");
        g.startGame();
        assertNotNull(g.getCurrentPlayer());
        assertFalse(g.isGameOver());
    }

    @Test
    void testShootMissAndHit() {
        Game g = new Game("game2", "A", "B");

        Ship s = new Ship(1, Arrays.asList(new Cell(0, 0)));
        g.getPlayer2().placeShip(s);
        g.startGame();

        String miss = g.shoot(5, 5);
        assertTrue(miss.contains("Miss"));
        String hit = g.shoot(0, 0);
        assertTrue(hit.contains("Hit"));
    }

    @Test
    void testGameOverAndWinner() {
        Game g = new Game("game3", "A", "B");
        Ship s = new Ship(1, Arrays.asList(new Cell(0, 0)));
        g.getPlayer2().placeShip(s);
        g.startGame();
        g.shoot(0, 0);
        assertTrue(g.isGameOver());
        assertEquals("A", g.getWinner().getName());
    }
}

