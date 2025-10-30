package com.battlenet.backend.model;

public class Game {
    private String gameId;
    private Player player1;
    private Player player2;
    private boolean player1Turn;
    private GameState state;
    private Player winner;

    public enum GameState {
        SETUP,      
        PLAYING,   
        FINISHED   
    }

    public Game(String gameId, String name1, String name2) {
        this.gameId = gameId;
        this.player1 = new Player(name1);
        this.player2 = new Player(name2);
        this.player1Turn = true;
        this.state = GameState.SETUP;
        this.winner = null;
    }

    public String shoot(int x, int y) {
        if (state != GameState.PLAYING) {
            return "Game not ready!";
        }

        Player target = player1Turn ? player2 : player1;
        boolean hit = target.getBoard().shoot(x, y);
        
        if (hit) {
            if (target.getBoard().allShipsSunk()) {
                state = GameState.FINISHED;
                winner = player1Turn ? player1 : player2;
                return "Hit! Game Over! " + winner.getName() + " wins!";
            }
            return "Hit!";
        } else {
            player1Turn = !player1Turn;
            return "Miss!";
        }
    }

    public boolean isGameOver() {
        return state == GameState.FINISHED;
    }

    public void startGame() {
        this.state = GameState.PLAYING;
    }

    public String getGameId() {
        return gameId;
    }

    public Player getPlayer1() {
        return player1;
    }

    public Player getPlayer2() {
        return player2;
    }

    public boolean isPlayer1Turn() {
        return player1Turn;
    }

    public GameState getState() {
        return state;
    }

    public void setState(GameState state) {
        this.state = state;
    }

    public Player getWinner() {
        return winner;
    }

    public Player getCurrentPlayer() {
        return player1Turn ? player1 : player2;
    }

    public Player getOpponent() {
        return player1Turn ? player2 : player1;
    }
}