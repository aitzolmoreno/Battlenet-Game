package com.battlenet.backend.model;

public class Player {
    private String name;
    private Board board;

    public Player(String name) {
        this.name = name;
        this.board = new Board();
    }

    public Board getBoard() {
        return board;
    }

    public String getName() {
        return name;
    }
}
