package com.battlenet.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ControllerTest {

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping("/api/test")
    public Map<String, String> testConnection() {
        return Map.of("message", "Backend is connected");
    }

}
