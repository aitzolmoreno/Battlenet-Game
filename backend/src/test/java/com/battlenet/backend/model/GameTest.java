package com.battlenet.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GameTest {

    private Game game;

    @BeforeEach
    void setUp() {
        game = new Game("game-1", "Alice", "Bob");
    }

    @Test
    void initial_state_and_getters() {
        assertEquals("game-1", game.getGameId());
        assertEquals(Game.GameState.SETUP, game.getState());
        assertTrue(game.isPlayer1Turn(), "Player1 debe empezar");
        assertFalse(game.isGameOver(), "Juego no terminado en setup");
        assertNull(game.getWinner());
        assertEquals("Alice", game.getPlayer1().getName());
        assertEquals("Bob", game.getPlayer2().getName());
    }

    @Test
    void shoot_when_not_playing_returnsGameNotReady() {
        String res = game.shoot(0, 0);
        assertEquals("Game not ready!", res);
        // still in setup
        assertEquals(Game.GameState.SETUP, game.getState());
    }

    @Test
    void startGame_and_miss_switchesTurn_and_returnsMiss() {
        game.startGame();
        assertEquals(Game.GameState.PLAYING, game.getState());
        // choose coordinates where there is no ship
        String res = game.shoot(9, 9);
        assertEquals("Miss!", res);
        // turn must have switched to player2
        assertFalse(game.isPlayer1Turn());
        assertEquals(game.getPlayer2(), game.getCurrentPlayer());
        assertEquals(game.getPlayer1(), game.getOpponent());
        // still not finished
        assertFalse(game.isGameOver());
    }

    @Test
    void hit_but_not_gameOver_returnsHit() {
        game.startGame();
        // place two ships on player2 so hitting one does not finish the game
        Player target = game.getPlayer2();
        Cell s1 = target.getBoard().getCell(1, 1);
        Cell s2 = target.getBoard().getCell(2, 2);
        Ship ship1 = new Ship(Ship.ShipType.DESTROYER, List.of(s1), true);
        Ship ship2 = new Ship(Ship.ShipType.DESTROYER, List.of(s2), true);
        assertTrue(target.placeShip(ship1));
        assertTrue(target.placeShip(ship2));

        // player1 shoots at first ship
        String res1 = game.shoot(1, 1);
        // Because the state is PLAYING, this is a Hit (and not Game Over since one ship remains)
        assertEquals("Hit!", res1);
        assertFalse(game.isGameOver());
        assertNull(game.getWinner());
    }

    @Test
    void hit_and_then_hit_allShipsSunk_gameOver_and_winnerSet() {
        game.startGame();
        Player target = game.getPlayer2();
        // place a single-cell ship (use board.getCell so same instance)
        Cell s = target.getBoard().getCell(3, 3);
        Ship ship = new Ship(Ship.ShipType.DESTROYER, List.of(s), true);
        assertTrue(target.placeShip(ship));

        // now shoot that position -> should be Hit! Game Over! Alice wins!
        String result = game.shoot(3, 3);
        assertTrue(result.startsWith("Hit!"));
        assertTrue(result.contains("Game Over"));
        assertTrue(game.isGameOver());
        assertNotNull(game.getWinner());
        assertEquals("Alice", game.getWinner().getName());
        // when finished, state should be FINISHED
        assertEquals(Game.GameState.FINISHED, game.getState());
    }

    @Test
    void setters_and_turns_and_current_opponent_logic() {
        // set state directly
        game.setState(Game.GameState.FINISHED);
        assertEquals(Game.GameState.FINISHED, game.getState());

        // reset to playing and test getCurrentPlayer/getOpponent flipping
        game.setState(Game.GameState.PLAYING);
        // initially player1Turn true
        assertEquals(game.getPlayer1(), game.getCurrentPlayer());
        assertEquals(game.getPlayer2(), game.getOpponent());

        // simulate a miss to flip turn
        String res = game.shoot(0, 0); // will be "Miss!"
        assertEquals("Miss!", res);
        // now current player should be player2
        assertEquals(game.getPlayer2(), game.getCurrentPlayer());
    }

    @Test
    void player2_wins_and_winner_set_correctly() {
        game.startGame();

        // Player1 coloca un barco para que Player2 pueda hundirlo
        Player p1 = game.getPlayer1();

        // Cambiamos el turno para que dispare Player2
        // Simulamos un fallo de Player1 para pasar el turno
        assertEquals("Miss!", game.shoot(9, 9));

        // Ahora es turno de Player2
        Cell shipCell = p1.getBoard().getCell(0, 0);
        Ship ship = new Ship(Ship.ShipType.DESTROYER, List.of(shipCell), true);
        assertTrue(p1.placeShip(ship));

        // Player2 dispara y gana
        String result = game.shoot(0, 0);
        assertTrue(result.contains("wins"), "Debe indicar que hay un ganador");
        assertEquals(Game.GameState.FINISHED, game.getState());
        assertNotNull(game.getWinner());
        assertEquals("Bob", game.getWinner().getName());
    }


}