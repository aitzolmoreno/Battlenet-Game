package com.battlenet.backend.controller;

import com.battlenet.backend.model.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {
    
    private Map<String, Game> games = new HashMap<>();
    
    @PostMapping("/create")
    public Map<String, Object> createGame() {
        String gameId = UUID.randomUUID().toString();
        String player1Name = "player1";
        String player2Name = "player2";
        
        Game game = new Game(gameId, player1Name, player2Name);
        games.put(gameId, game);
        
        Map<String, Object> response = new HashMap<>();
        response.put("gameId", gameId);
        response.put("message", "Game created successfully");
        
        Map<String, Object> gameInfo = new HashMap<>();
        gameInfo.put("gameId", game.getGameId());
        gameInfo.put("state", game.getState().toString());
        
        Map<String, Object> player1Info = new HashMap<>();
        player1Info.put("id", game.getPlayer1().getId());
        player1Info.put("name", game.getPlayer1().getName());
        player1Info.put("ready", game.getPlayer1().isReady());
        player1Info.put("shipsPlaced", game.getPlayer1().allShipsPlaced());
        
        Map<String, Object> player2Info = new HashMap<>();
        player2Info.put("id", game.getPlayer2().getId());
        player2Info.put("name", game.getPlayer2().getName());
        player2Info.put("ready", game.getPlayer2().isReady());
        player2Info.put("shipsPlaced", game.getPlayer2().allShipsPlaced());
        
        gameInfo.put("player1", player1Info);
        gameInfo.put("player2", player2Info);
        gameInfo.put("currentTurn", game.isPlayer1Turn() ? "player1" : "player2");
        gameInfo.put("winner", game.getWinner() != null ? game.getWinner().getName() : null);
        
        response.put("game", gameInfo);
        
        return response;
    }

    @PostMapping("/{gameId}")
    public Map<String, Object> getGameInfo(@PathVariable String gameId){
        Game game = games.get(gameId);

        if (game == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Game not found");
            return error;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("gameId", game.getGameId());
        response.put("state", game.getState().toString());
        
        Map<String, Object> player1Info = new HashMap<>();
        player1Info.put("id", game.getPlayer1().getId());
        player1Info.put("name", game.getPlayer1().getName());
        player1Info.put("ready", game.getPlayer1().isReady());
        player1Info.put("shipsPlaced", game.getPlayer1().allShipsPlaced());
        player1Info.put("shipsCount", game.getPlayer1().getBoard().getShips().size());
        
        Map<String, Object> player2Info = new HashMap<>();
        player2Info.put("id", game.getPlayer2().getId());
        player2Info.put("name", game.getPlayer2().getName());
        player2Info.put("ready", game.getPlayer2().isReady());
        player2Info.put("shipsPlaced", game.getPlayer2().allShipsPlaced());
        player2Info.put("shipsCount", game.getPlayer2().getBoard().getShips().size());
        
        response.put("player1", player1Info);
        response.put("player2", player2Info);
        response.put("currentTurn", game.isPlayer1Turn() ? game.getPlayer1().getName() : game.getPlayer2().getName());
        response.put("isGameOver", game.isGameOver());
        response.put("winner", game.getWinner() != null ? game.getWinner().getName() : null);
        
        return response;
    }

    @PostMapping("/{gameId}/place-ship")
    public Map<String, Object> placeShip(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> request) {
        
        Game game = games.get(gameId);
        if (game == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Game not found");
            return error;
        }
        
        int playerNum = (Integer) request.get("player");
        String shipType = (String) request.get("shipType");
        int x = (Integer) request.get("x");
        int y = (Integer) request.get("y");
        boolean horizontal = (Boolean) request.get("horizontal");
        
        Player player = playerNum == 1 ? game.getPlayer1() : game.getPlayer2();
        
        Ship.ShipType type;
        try {
            type = Ship.ShipType.valueOf(shipType);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid ship type: " + shipType);
            return error;
        }
        
        List<Cell> cells = new ArrayList<>();
        for (int i = 0; i < type.getSize(); i++) {
            if (horizontal) {
                cells.add(new Cell(x, y + i));
            } else {
                cells.add(new Cell(x + i, y));
            }
        }
        
        Ship ship = new Ship(type, cells, horizontal);
        boolean success = player.placeShip(ship);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        
        if (success) {
            response.put("message", "Ship placed successfully");
            response.put("shipType", type.name());
            response.put("shipDisplayName", type.getDisplayName());
            response.put("position", Map.of("x", x, "y", y, "horizontal", horizontal));
            response.put("shipsPlaced", player.getBoard().getShips().size());
            response.put("allShipsPlaced", player.allShipsPlaced());
        } else {
            response.put("message", "Invalid placement: Position occupied or out of bounds");
            response.put("reason", "The position is either already occupied by another ship or goes outside the board boundaries");
        }
        
        return response;
    }
}
