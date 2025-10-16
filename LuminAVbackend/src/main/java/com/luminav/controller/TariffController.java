package com.luminav.controller;


import org.springframework.web.bind.annotation.*;

import com.luminav.entity.Tariff;
import com.luminav.entity.User;
import com.luminav.repository.TariffRepository;
import com.luminav.repository.UserRepository;

@RestController
@RequestMapping("/api/tariff")
public class TariffController {
  private final TariffRepository tariffs; private final UserRepository users;
  public TariffController(TariffRepository t, UserRepository u){this.tariffs=t; this.users=u;}

  @GetMapping
  public Tariff get(@RequestParam Long ownerId) {
    return tariffs.findByOwnerId(ownerId).orElse(null);
  }

  @PutMapping
  public Tariff upsert(@RequestParam Long ownerId, @RequestBody Tariff t) {
    User u = users.findById(ownerId).orElseThrow();
    return tariffs.findByOwnerId(ownerId)
      .map(ex -> { ex.setPricePerKwh(t.getPricePerKwh()); ex.setPeakStart(t.getPeakStart()); ex.setPeakEnd(t.getPeakEnd()); return tariffs.save(ex); })
      .orElseGet(() -> { t.setId(null); t.setOwner(u); return tariffs.save(t); });
  }
}