package com.battlenet.backend.model;

public class Cell {
    private int x;
    private int y;
    private boolean hit;
    private boolean hasShip;

    public Cell(int x, int y) {
        this.x = x;
        this.y = y;
        this.hit = false;
        this.hasShip = false;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public boolean isHit() { 
        return hit; 
    }

    public boolean hasShip() { 
        return hasShip; 
    }

    public void setShip(boolean hasShip) {
        this.hasShip = hasShip; 
    }

    public void markHit() { 
        this.hit = true; 
    }
}