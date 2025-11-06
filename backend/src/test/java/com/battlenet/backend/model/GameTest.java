package com.battlenet.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game("g1", "Aitzol", "Xanet");
    }

    @Test
    void testInitialState() {
        assertEquals("g1", game.getGameId());
        assertEquals(Game.GameState.SETUP, game.getState());
        assertTrue(game.isPlayer1Turn());
        assertFalse(game.isGameOver());
    }

    @Test
    void testStartGameAndShootMiss() {
        game.startGame();
        String result = game.shoot(9, 9);
        assertEquals("Miss!", result);
        assertFalse(game.isPlayer1Turn()); 
        assertEquals(Game.GameState.PLAYING, game.getState());
    }

    @Test
    void testShootWhenNotPlaying() {
        String msg = game.shoot(0,0);
        assertEquals("Game not ready!", msg);
        assertEquals(Game.GameState.SETUP, game.getState());
    }

    @Test
    void testHitAndWinCondition() {
        game.startGame();
        Player p2 = game.getPlayer2();

        Cell cell = p2.getBoard().getCell(0, 0);
        cell.setShip(true);
        Ship ship = new Ship(1, List.of(cell));
        p2.getBoard().placeShip(ship);

        String result = game.shoot(0, 0);
        assertTrue(result.startsWith("Hit"));
        assertTrue(result.contains("Game Over"));
        assertTrue(game.isGameOver());
        assertEquals("Aitzol", game.getWinner().getName());
    }

    @Test
    void testTurnSwitchAfterMiss() {
        game.startGame();
        String res = game.shoot(9,9);
        assertTrue(res.startsWith("Miss"));
        assertFalse(game.isPlayer1Turn());
    }

    @Test
    void testGettersAndOpponents() {
        assertEquals(game.getPlayer1(), game.getCurrentPlayer());
        assertEquals(game.getPlayer2(), game.getOpponent());
        game.startGame();
        game.shoot(9,9);
        assertEquals(game.getPlayer2(), game.getCurrentPlayer());
    }
}

