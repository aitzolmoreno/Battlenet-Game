package com.battlenet.backend.model;

import java.util.List;

public class Ship {
    private ShipType type;
    private int size;
    private List<Cell> cells;
    private boolean horizontal;

    public enum ShipType {
        CARRIER(5, "Portaaviones"),
        BATTLESHIP(4, "Acorazado"),
        CRUISER(3, "Crucero"),
        SUBMARINE(3, "Submarino"),
        DESTROYER(2, "Destructor");

        private final int size;
        private final String displayName;

        ShipType(int size, String displayName) {
            this.size = size;
            this.displayName = displayName;
        }

        public int getSize() {
            return size;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public Ship(ShipType type, List<Cell> cells, boolean horizontal) {
        this.type = type;
        this.size = type.getSize();
        this.cells = cells;
        this.horizontal = horizontal;
    }

    public Ship(int size, List<Cell> cells) {
        this.size = size;
        this.cells = cells;
        this.horizontal = true;
    }

    public boolean isSunk() {
        for (Cell cell : cells) {
            if (!cell.isHit()) {
                return false;
            }
        }
        return true;
    }

    public ShipType getType() {
        return type;
    }

    public void setType(ShipType type) {
        this.type = type;
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

    public boolean isHorizontal() {
        return horizontal;
    }

    public void setHorizontal(boolean horizontal) {
        this.horizontal = horizontal;
    }

    public int getHitCount() {
        int count = 0;
        for (Cell cell : cells) {
            if (cell.isHit()) {
                count++;
            }
        }
        return count;
    }
}
