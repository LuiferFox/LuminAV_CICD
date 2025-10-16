package com.luminav.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  @GetMapping("/summary")
  public Map<String,Object> summary(@RequestParam Long ownerId,
                                    @RequestParam String from,
                                    @RequestParam String to) {
    return Map.of(
      "totalKwh", 23.5,
      "totalCost", 14500.0,
      "topDevices", List.of(
        Map.of("name","Nevera","kwh",8.2,"cost",5000.0),
        Map.of("name","Lavadora","kwh",6.1,"cost",3800.0)
      ),
      "hourly", List.of(
        Map.of("hour",0,"kwh",0.2), Map.of("hour",1,"kwh",0.15)
      )
    );
  }
}