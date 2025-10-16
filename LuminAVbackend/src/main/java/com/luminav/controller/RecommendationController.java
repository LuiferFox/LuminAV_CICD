package com.luminav.controller;

import com.luminav.entity.Recommendation;
import com.luminav.repository.RecommendationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {

  private final RecommendationRepository recos;

  public RecommendationController(RecommendationRepository recos) {
    this.recos = recos;
  }

  @GetMapping
  public List<Recommendation> list(
      @RequestParam Long ownerId,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "100") int limit
  ) {
    int capped = Math.min(Math.max(limit, 1), 200);
    if (status == null || status.isBlank() || status.equalsIgnoreCase("ALL")) {
      return recos.findByOwner_IdOrderByCreatedAtDesc(ownerId, PageRequest.of(0, capped));
    } else {
      return recos.findByOwner_IdAndStatusOrderByCreatedAtDesc(ownerId, status.toUpperCase(), PageRequest.of(0, capped));
    }
  }

  @PutMapping("/{id}/status")
  public Recommendation updateStatus(@PathVariable Long id, @RequestParam String status) {
    Recommendation r = recos.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recommendation not found"));
    r.setStatus(status.toUpperCase());
    return recos.save(r);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    recos.deleteById(id);
  }
}

