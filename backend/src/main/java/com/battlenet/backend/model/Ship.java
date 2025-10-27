package com.battlenet.backend.model;

import java.util.List;

public class Ship {
    private int size;
    private List<Cell> cells;

    public Ship(int size, List<Cell> cells) {
        this.size = size;
        this.cells = cells;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public List<Cell> getCells() {
        return cells;
    }

    public void setCells(List<Cell> cells) {
        this.cells = cells;
    }

    public boolean isSunk() {
        for (Cell cell : cells) {
            if (!cell.isHit()) {
                return false;
            }
        }
        return true;
    }
}
