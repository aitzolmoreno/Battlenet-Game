package com.battlenet.backend.model;

import java.util.ArrayList;
import java.util.List;

public class Board {
    private int size = 10;
    private Cell[][] grid;
    private List<Ship> ships;

    public Board() {
        grid = new Cell[size][size];
        for (int i = 0; i < size; i++)
            for (int j = 0; j < size; j++)
                grid[i][j] = new Cell(i, j);
        ships = new ArrayList<>();
    }

    public boolean placeShip(Ship ship) {
        for (Cell cell : ship.getCells()) {
            int x = cell.getX();
            int y = cell.getY();
            
            if (x < 0 || x >= size || y < 0 || y >= size) {
                return false;
            }
            
            if (grid[x][y].hasShip()) {
                return false;
            }
        }
        
        ships.add(ship);
        ship.getCells().forEach(c -> grid[c.getX()][c.getY()].setShip(true));
        return true;
    }

    public boolean shoot(int x, int y) {
        if (x < 0 || x >= size || y < 0 || y >= size) {
            return false;
        }
        
        Cell cell = grid[x][y];
        
        if (cell.isHit()) {
            return false;
        }
        
        cell.markHit();
        return cell.hasShip();
    }

    public boolean allShipsSunk() {
        for (Ship ship : ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    }

    public int getSize() {
        return size;
    }

    public Cell[][] getGrid() {
        return grid;
    }

    public List<Ship> getShips() {
        return ships;
    }

    public Cell getCell(int x, int y) {
        if (x >= 0 && x < size && y >= 0 && y < size) {
            return grid[x][y];
        }
        return null;
    }
}