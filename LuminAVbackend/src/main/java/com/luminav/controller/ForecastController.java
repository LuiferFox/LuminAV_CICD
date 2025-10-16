package com.luminav.controller;

import com.luminav.service.ForecastService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

  private final ForecastService forecast;

  public ForecastController(ForecastService forecast) { this.forecast = forecast; }

  // ejemplo: GET /api/forecast/hourly?ownerId=1&days=7
  @GetMapping("/hourly")
  public Map<Integer, Double> hourly(@RequestParam Long ownerId, @RequestParam(defaultValue = "7") int days) {
    return forecast.hourlyBaseline(ownerId, days);
  }
}
