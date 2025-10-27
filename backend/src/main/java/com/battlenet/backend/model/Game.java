package com.battlenet.backend.model;

public class Game {
    private Player player1;
    private Player player2;
    private boolean player1Turn;

    public Game(String name1, String name2) {
        this.player1 = new Player(name1);
        this.player2 = new Player(name2);
        this.player1Turn = true;
    }

    public String shoot(int x, int y) {
        Player target = player1Turn ? player2 : player1;
        boolean hit = target.getBoard().shoot(x, y);
        if (!hit) player1Turn = !player1Turn;
        return hit ? "Hit!" : "Miss!";
    }

    public boolean isGameOver() {
        return player1.getBoard().allShipsSunk() || player2.getBoard().allShipsSunk();
    }
}