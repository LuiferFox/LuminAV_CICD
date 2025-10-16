

package com.luminav.service;

import com.luminav.entity.Reading;
import com.luminav.entity.Recommendation;
import com.luminav.entity.User;
import com.luminav.repository.ReadingRepository;
import com.luminav.repository.RecommendationRepository;
import com.luminav.repository.TariffRepository;
import com.luminav.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Component
public class RecommendationAgent {

  private final UserRepository users;
  private final ReadingRepository readings;
  private final RecommendationRepository recos;
  private final ForecastService forecast;
  private final TariffRepository tariffs;

  // Usa la misma TZ que tu front (Colombia)
  private static final ZoneId ZONE = ZoneId.of("America/Bogota");

  // Ventana móvil (minutos) configurable (por defecto 60)
  @Value("${app.agent.window-minutes:60}")
  private int windowMinutes;

  public RecommendationAgent(
      UserRepository users,
      ReadingRepository readings,
      RecommendationRepository recos,
      ForecastService forecast,
      TariffRepository tariffs
  ) {
    this.users = users;
    this.readings = readings;
    this.recos = recos;
    this.forecast = forecast;
    this.tariffs = tariffs;
  }

  /**
   * En desarrollo: ejecuta cada 15s (configurable).
   * app.agent.fixed-delay-ms=60000
   * app.agent.initial-delay-ms=5000
   */
  @Scheduled(
      fixedDelayString = "${app.agent.fixed-delay-ms:60000}",
      initialDelayString = "${app.agent.initial-delay-ms:5000}"
  )
  @Transactional
  public void scheduledRun() {
    for (User u : users.findAll()) {
      generateForOwner(u.getId());
    }
  }

  /** Permite disparar manualmente desde un endpoint */
  @Transactional
  public void generateForOwner(Long ownerId) {
    // Ventana móvil: [now - windowMinutes, now)
    final ZonedDateTime nowZ = ZonedDateTime.now(ZONE);
    final ZonedDateTime startZ = nowZ.minusMinutes(Math.max(1, windowMinutes));
    final Instant start = startZ.toInstant();
    final Instant end   = nowZ.toInstant();
    final int hourLabel = nowZ.getHour(); // para baseline por hora

    // Lecturas recientes del owner
    final List<Reading> window =
        readings.findByDeviceOwnerIdAndRecordedAtBetween(ownerId, start, end);
    if (window == null || window.isEmpty()) return;

    // kWh sumados en la ventana
    final double kwh = window.stream().mapToDouble(this::kwh).sum();
    if (kwh < 0.01d) return; // ignora valores muy pequeños

    // Baseline esperado para esta hora (últimos 7 días)
    Map<Integer, Double> baseline;
    try {
      baseline = forecast.hourlyBaseline(ownerId, 7);
    } catch (Exception ex) {
      baseline = Map.of();
    }
    double expected = baseline.getOrDefault(hourLabel, 0.0);
    if (expected <= 0.0) expected = 0.01;

    // ¿Hora pico? según tarifa (peakStart/peakEnd en horas)
    final boolean isPeak = tariffs.findByOwnerId(ownerId)
        .map(t -> inPeak(hourLabel, t.getPeakStart(), t.getPeakEnd()))
        .orElse(false);

    // Regla: exceso > +25% sobre lo esperado
    final double threshold = expected * 1.25;
    if (kwh > threshold) {
      final String level = isPeak ? "ALERT" : "WARN";
      final String msg = String.format(
          "Consumo alto (últimos %d min) — %.3f kWh (esperado ~%.3f kWh). %s",
          Math.max(1, windowMinutes),
          kwh,
          expected,
          isPeak
              ? "Hora pico: programa cargas fuera de 14:00–20:00."
              : "Revisa luces/equipos encendidos innecesariamente."
      );

      final Recommendation r = new Recommendation();
      final User owner = new User(); owner.setId(ownerId);
      r.setOwner(owner);
      r.setLevel(level);     // "INFO" | "WARN" | "ALERT"
      r.setStatus("NEW");    // importante: evita NOT NULL
      r.setMessage(msg);
      r.setCreatedAt(Instant.now());
      recos.save(r);
    }
  }

  private boolean inPeak(int hour, Integer peakStart, Integer peakEnd) {
    if (peakStart == null || peakEnd == null) return false;
    if (peakStart.equals(peakEnd)) return true; // todo el día
    if (peakStart < peakEnd) { // [start, end)
      return hour >= peakStart && hour < peakEnd;
    }
    // Cruza medianoche (ej: 21–6)
    return hour >= peakStart || hour < peakEnd;
  }

  private double kwh(Reading r) {
    final double hours = (r.getMinutes() == null ? 60 : r.getMinutes()) / 60.0;
    return (r.getWatt() * hours) / 1000.0;
  }
}
