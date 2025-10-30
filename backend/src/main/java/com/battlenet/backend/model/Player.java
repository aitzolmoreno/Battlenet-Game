package com.battlenet.backend.model;

public class Player {
    private String id;
    private String name;
    private Board board;
    private boolean ready;

    public Player(String name) {
        this.name = name;
        this.board = new Board();
        this.ready = false;
    }

    public Player(String id, String name) {
        this.id = id;
        this.name = name;
        this.board = new Board();
        this.ready = false;
    }

    public boolean placeShip(Ship ship) {
        return board.placeShip(ship);
    }

    public boolean allShipsPlaced() {
        return board.getShips().size() == 5;
    }

    // Getters y Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Board getBoard() {
        return board;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isReady() {
        return ready;
    }

    public void setReady(boolean ready) {
        this.ready = ready;
    }
}
