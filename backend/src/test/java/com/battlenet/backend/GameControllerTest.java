package com.battlenet.backend;

import com.battlenet.backend.controller.GameController;
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
public class GameControllerTest {
    
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
}
