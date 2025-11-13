package com.battlenet.backend.controller;

import com.battlenet.backend.model.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:5173")
public class GameController {
    private static final String PLAYER1NAME = "player1";
    private static final String PLAYER2NAME = "player2";
    private static final String MESSAGE = "message";
    private static final String READY = "ready";
    private static final String SHIPSPLACED = "shipsPlaced";
    private static final String GAMEID_KEY = "gameId";
    private static final String SUCCESS = "success";
    private static final String STATE = "state";
    private static final String CURRENT_TURN = "currentTurn";
    private static final String WINNER = "winner";
    private static final String GAME_NOT_FOUND = "Game not found";
    private Map<String, Game> games = new HashMap<>();
    
    @PostMapping("/create")
    public Map<String, Object> createGame() {
        String gameId = UUID.randomUUID().toString().substring(0, 6);
        
        Game game = new Game(gameId, PLAYER1NAME, PLAYER2NAME);
        games.put(gameId, game);
        
        Map<String, Object> response = new HashMap<>();
        response.put(GAMEID_KEY, gameId);
        response.put(MESSAGE, "Game created successfully");
        
        Map<String, Object> gameInfo = new HashMap<>();
        gameInfo.put(GAMEID_KEY, game.getGameId());
        gameInfo.put(STATE, game.getState().toString());
        
        Map<String, Object> player1Info = new HashMap<>();
        player1Info.put("id", game.getPlayer1().getId());
        player1Info.put("name", game.getPlayer1().getName());
        player1Info.put(READY, game.getPlayer1().isReady());
        player1Info.put(SHIPSPLACED, game.getPlayer1().allShipsPlaced());
        
        Map<String, Object> player2Info = new HashMap<>();
        player2Info.put("id", game.getPlayer2().getId());
        player2Info.put("name", game.getPlayer2().getName());
        player2Info.put(READY, game.getPlayer2().isReady());
        player2Info.put(SHIPSPLACED, game.getPlayer2().allShipsPlaced());
        
        gameInfo.put(PLAYER1NAME, player1Info);
        gameInfo.put(PLAYER2NAME, player2Info);
        gameInfo.put(CURRENT_TURN, game.isPlayer1Turn() ? PLAYER1NAME : PLAYER2NAME);
        gameInfo.put(WINNER, game.getWinner() != null ? game.getWinner().getName() : null);
        
        response.put("game", gameInfo);
        
        return response;
    }

    @PostMapping("/{gameId}")
    public Map<String, Object> getGameInfo(@PathVariable String gameId){
        Game game = games.get(gameId);

        if (game == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", GAME_NOT_FOUND);
            return error;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put(GAMEID_KEY, game.getGameId());
        response.put(STATE, game.getState().toString());
        
        Map<String, Object> player1Info = new HashMap<>();
        player1Info.put("id", game.getPlayer1().getId());
        player1Info.put("name", game.getPlayer1().getName());
        player1Info.put(READY, game.getPlayer1().isReady());
        player1Info.put(SHIPSPLACED, game.getPlayer1().allShipsPlaced());
        player1Info.put("shipsCount", game.getPlayer1().getBoard().getShips().size());
        
        Map<String, Object> player2Info = new HashMap<>();
        player2Info.put("id", game.getPlayer2().getId());
        player2Info.put("name", game.getPlayer2().getName());
        player2Info.put(READY, game.getPlayer2().isReady());
        player2Info.put(SHIPSPLACED, game.getPlayer2().allShipsPlaced());
        player2Info.put("shipsCount", game.getPlayer2().getBoard().getShips().size());
        
        response.put(PLAYER1NAME, player1Info);
        response.put(PLAYER2NAME    , player2Info);
        response.put(CURRENT_TURN, game.isPlayer1Turn() ? game.getPlayer1().getName() : game.getPlayer2().getName());
        response.put("isGameOver", game.isGameOver());
        response.put(WINNER, game.getWinner() != null ? game.getWinner().getName() : null);
        
        return response;
    }

    @PostMapping("/{gameId}/place-ship")
    public Map<String, Object> placeShip(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> request) {
        
        Game game = games.get(gameId);
        if (game == null) {
            Map<String, Object> error = new HashMap<>();
            error.put(SUCCESS, false);
            error.put(MESSAGE, GAME_NOT_FOUND);
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
            error.put(SUCCESS, false);
            error.put(MESSAGE, "Invalid ship type: " + shipType);
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
        response.put(SUCCESS, success);
        
        if (success) {
            response.put(MESSAGE, "Ship placed successfully");
            response.put("shipType", type.name());
            response.put("shipDisplayName", type.getDisplayName());
            response.put("position", Map.of("x", x, "y", y, "horizontal", horizontal));
            response.put(SHIPSPLACED, player.getBoard().getShips().size());
            response.put("allShipsPlaced", player.allShipsPlaced());
        } else {
            response.put(MESSAGE, "Invalid placement: Position occupied or out of bounds");
            response.put("reason", "The position is either already occupied by another ship or goes outside the board boundaries");
        }
        
        return response;
    }

    @PostMapping("/{gameId}/start")
    public Map<String, Object> startGame(@PathVariable String gameId) {
        Game game = games.get(gameId);
        Map<String, Object> response = new HashMap<>();
        if (game == null) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, GAME_NOT_FOUND);
            return response;
        }

        boolean player1Ready = game.getPlayer1().allShipsPlaced();
        boolean player2Ready = game.getPlayer2().allShipsPlaced();
        if (!player1Ready || !player2Ready) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, "Both players must place all ships before starting the game");
            response.put("player1Ready", player1Ready);
            response.put("player2Ready", player2Ready);
            return response;
        }

        game.startGame();
        response.put(SUCCESS, true);
        response.put(MESSAGE, "Game started!");
        response.put(STATE, game.getState().toString());
        response.put(CURRENT_TURN, game.isPlayer1Turn() ? PLAYER1NAME : PLAYER2NAME);
        return response;
    }

    @PostMapping("/{gameId}/shoot")
    public Map<String, Object> shoot(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> request) {

        Game game = games.get(gameId);
        Map<String, Object> response = new HashMap<>();
        if (game == null) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, GAME_NOT_FOUND);
            return response;
        }

        if (game.getState() != Game.GameState.PLAYING) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, "Game is not in PLAYING state");
            return response;
        }

        int x = (Integer) request.get("x");
        int y = (Integer) request.get("y");

        String result = game.shoot(x, y);

        response.put(SUCCESS, true);
        response.put("result", result);
        response.put(CURRENT_TURN, game.isPlayer1Turn() ? PLAYER1NAME : PLAYER2NAME);
        response.put("isGameOver", game.isGameOver());
        if (game.getWinner() != null) {
            response.put(WINNER, game.getWinner().getName());
        }
        return response;
    }

    @GetMapping("/{gameId}/board-state")
    public Map<String, Object> getBoardState(@PathVariable String gameId) {
        Game game = games.get(gameId);
        Map<String, Object> response = new HashMap<>();
        
        if (game == null) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, GAME_NOT_FOUND);
            return response;
        }

        response.put(SUCCESS, true);
        response.put("player1Board", serializeBoard(game.getPlayer1().getBoard()));
        response.put("player2Board", serializeBoard(game.getPlayer2().getBoard()));
        response.put("player1SunkShips", getSunkShips(game.getPlayer1()));
        response.put("player2SunkShips", getSunkShips(game.getPlayer2()));
        response.put(CURRENT_TURN, game.isPlayer1Turn() ? PLAYER1NAME : PLAYER2NAME);
        response.put(STATE, game.getState().toString());
        response.put(WINNER, game.getWinner() != null ? game.getWinner().getName() : null);
        
        return response;
    }

    @PostMapping("/{gameId}/validate-placement")
    public Map<String, Object> validatePlacement(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> request) {
        
        Game game = games.get(gameId);
        Map<String, Object> response = new HashMap<>();
        
        if (game == null) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, GAME_NOT_FOUND);
            return response;
        }

        int playerNum = (Integer) request.get("player");
        String shipType = (String) request.get("shipType");
        int x = (Integer) request.get("x");
        int y = (Integer) request.get("y");
        boolean horizontal = (Boolean) request.get("horizontal");

        Player player = (playerNum == 1) ? game.getPlayer1() : game.getPlayer2();
        Board board = player.getBoard();

        Ship.ShipType type = Ship.ShipType.valueOf(shipType);
        int length = Ship.getShipLength(type);

        boolean valid = validateShipPlacement(board, x, y, length, horizontal);

        response.put(SUCCESS, true);
        response.put("valid", valid);
        response.put("length", length);
        if (!valid) {
            response.put(MESSAGE, "Invalid placement: Position occupied or out of bounds");
        }
        
        return response;
    }

    private List<String> serializeBoard(Board board) {
        List<String> result = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            for (int j = 0; j < 10; j++) {
                Cell cell = board.getCell(i, j);
                if (cell.isHit()) {
                    result.add(cell.getShip() != null ? "Hit" : "Miss");
                } else if (cell.getShip() != null) {
                    result.add("ship:" + cell.getShip().getType().toString());
                } else {
                    result.add(null);
                }
            }
        }
        return result;
    }

    private Map<String, Boolean> getSunkShips(Player player) {
        Map<String, Boolean> sunkShips = new HashMap<>();
        for (Ship ship : player.getBoard().getShips()) {
            sunkShips.put(ship.getType().toString(), ship.isSunk());
        }
        return sunkShips;
    }

    private boolean validateShipPlacement(Board board, int x, int y, int length, boolean horizontal) {
        if (horizontal) {
            if (y + length > 10) return false;
            for (int i = 0; i < length; i++) {
                if (board.getCell(x, y + i).getShip() != null) {
                    return false;
                }
            }
        } else {
            if (x + length > 10) return false;
            for (int i = 0; i < length; i++) {
                if (board.getCell(x + i, y).getShip() != null) {
                    return false;
                }
            }
        }
        return true;
    }
}
