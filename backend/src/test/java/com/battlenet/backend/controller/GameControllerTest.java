package com.battlenet.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(GameController.class)
class GameControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String gameId;
    
    @BeforeEach
    void setUp() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/game/create"))
                .andExpect(status().isOk())
                .andReturn();
        
        String response = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(response, 
            new TypeReference<Map<String, Object>>() {});
        this.gameId = (String) responseMap.get("gameId");
    }
    
    @Test
    void testCreateGame() throws Exception {
        mockMvc.perform(post("/api/game/create"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").exists())
                .andExpect(jsonPath("$.message").value("Game created successfully"))
                .andExpect(jsonPath("$.game.state").value("SETUP"))
                .andExpect(jsonPath("$.game.player1.name").value("player1"))
                .andExpect(jsonPath("$.game.player2.name").value("player2"))
                .andExpect(jsonPath("$.game.player1.ready").value(false))
                .andExpect(jsonPath("$.game.player2.ready").value(false))
                .andExpect(jsonPath("$.game.currentTurn").value("player1"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testGetGameInfo_ExistingGame() throws Exception {
        mockMvc.perform(post("/api/game/" + gameId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gameId").value(gameId))
                .andExpect(jsonPath("$.state").value("SETUP"))
                .andExpect(jsonPath("$.player1.name").value("player1"))
                .andExpect(jsonPath("$.player2.name").value("player2"))
                .andExpect(jsonPath("$.isGameOver").value(false))
                .andExpect(jsonPath("$.winner").value(nullValue()));
    }
    
    @Test
    void testGetGameInfo_NonExistingGame() throws Exception {
        mockMvc.perform(post("/api/game/nonexistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error").value("Game not found"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_ValidPlacement() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("player", 1);
        request.put("shipType", "CARRIER");
        request.put("x", 0);
        request.put("y", 0);
        request.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Ship placed successfully"))
                .andExpect(jsonPath("$.shipType").value("CARRIER"))
                .andExpect(jsonPath("$.shipsPlaced").value(1));
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_GameNotFound() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("player", 1);
        request.put("shipType", "CARRIER");
        request.put("x", 0);
        request.put("y", 0);
        request.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/nonexistent/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Game not found"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_InvalidShipType() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("player", 1);
        request.put("shipType", "INVALID_SHIP");
        request.put("x", 0);
        request.put("y", 0);
        request.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid ship type: INVALID_SHIP"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_InvalidPlacement() throws Exception {
        Map<String, Object> request1 = new HashMap<>();
        request1.put("player", 1);
        request1.put("shipType", "CARRIER");
        request1.put("x", 0);
        request1.put("y", 0);
        request1.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        
        Map<String, Object> request2 = new HashMap<>();
        request2.put("player", 1);
        request2.put("shipType", "BATTLESHIP");
        request2.put("x", 0);
        request2.put("y", 0);
        request2.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid placement: Position occupied or out of bounds"))
                .andExpect(jsonPath("$.reason").exists());
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_VerticalPlacement() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("player", 1);
        request.put("shipType", "DESTROYER");
        request.put("x", 0);
        request.put("y", 0);
        request.put("horizontal", false);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Ship placed successfully"))
                .andExpect(jsonPath("$.position.horizontal").value(false));
    }
    
    @SuppressWarnings("null")
    @Test
    void testPlaceShip_Player2() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("player", 2);
        request.put("shipType", "SUBMARINE");
        request.put("x", 0);
        request.put("y", 0);
        request.put("horizontal", true);
        
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.shipType").value("SUBMARINE"));
    }
    
    @Test
    void testStartGame_GameNotFound() throws Exception {
        mockMvc.perform(post("/api/game/nonexistent/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Game not found"));
    }
    
    @Test
    void testStartGame_PlayersNotReady() throws Exception {
        mockMvc.perform(post("/api/game/" + gameId + "/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Both players must place all ships before starting the game"))
                .andExpect(jsonPath("$.player1Ready").exists())
                .andExpect(jsonPath("$.player2Ready").exists());
    }
    
    @Test
    void testStartGame_Success() throws Exception {
        placeAllShipsForPlayer(1);
        placeAllShipsForPlayer(2);
        
        mockMvc.perform(post("/api/game/" + gameId + "/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Game started!"))
                .andExpect(jsonPath("$.state").value("PLAYING"))
                .andExpect(jsonPath("$.currentTurn").exists());
    }
    
    @SuppressWarnings("null")
    @Test
    void testShoot_GameNotFound() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("x", 0);
        request.put("y", 0);
        
        mockMvc.perform(post("/api/game/nonexistent/shoot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Game not found"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testShoot_GameNotInPlayingState() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("x", 0);
        request.put("y", 0);
        
        mockMvc.perform(post("/api/game/" + gameId + "/shoot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Game is not in PLAYING state"));
    }
    
    @SuppressWarnings("null")
    @Test
    void testShoot_Success() throws Exception {
        placeAllShipsForPlayer(1);
        placeAllShipsForPlayer(2);
        
        mockMvc.perform(post("/api/game/" + gameId + "/start"))
                .andExpect(status().isOk());
        
        Map<String, Object> request = new HashMap<>();
        request.put("x", 0);
        request.put("y", 0);
        
        mockMvc.perform(post("/api/game/" + gameId + "/shoot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.result").exists())
                .andExpect(jsonPath("$.currentTurn").exists())
                .andExpect(jsonPath("$.isGameOver").exists());
    }
    
    @SuppressWarnings("null")
    private void placeAllShipsForPlayer(int player) throws Exception {
        Map<String, Object> carrier = new HashMap<>();
        carrier.put("player", player);
        carrier.put("shipType", "CARRIER");
        carrier.put("x", 0);
        carrier.put("y", 0);
        carrier.put("horizontal", true);
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(carrier)));
        
        Map<String, Object> battleship = new HashMap<>();
        battleship.put("player", player);
        battleship.put("shipType", "BATTLESHIP");
        battleship.put("x", 1);
        battleship.put("y", 0);
        battleship.put("horizontal", true);
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(battleship)));
        
        Map<String, Object> cruiser = new HashMap<>();
        cruiser.put("player", player);
        cruiser.put("shipType", "CRUISER");
        cruiser.put("x", 2);
        cruiser.put("y", 0);
        cruiser.put("horizontal", true);
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cruiser)));
        
        Map<String, Object> submarine = new HashMap<>();
        submarine.put("player", player);
        submarine.put("shipType", "SUBMARINE");
        submarine.put("x", 3);
        submarine.put("y", 0);
        submarine.put("horizontal", true);
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submarine)));
        
        Map<String, Object> destroyer = new HashMap<>();
        destroyer.put("player", player);
        destroyer.put("shipType", "DESTROYER");
        destroyer.put("x", 4);
        destroyer.put("y", 0);
        destroyer.put("horizontal", true);
        mockMvc.perform(post("/api/game/" + gameId + "/place-ship")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(destroyer)));
    }
}
