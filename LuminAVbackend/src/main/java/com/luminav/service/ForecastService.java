package com.luminav.service;

import com.luminav.entity.Reading;
import com.luminav.repository.ReadingRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForecastService {
  private final ReadingRepository readings;
  private static final ZoneId ZONE = ZoneId.systemDefault();

  public ForecastService(ReadingRepository readings) { this.readings = readings; }

  // Retorna kWh promedio esperado por HORA del día (0..23), usando últimos N días
  public Map<Integer, Double> hourlyBaseline(Long ownerId, int days) {
    Instant to = Instant.now();
    Instant from = to.minus(Duration.ofDays(days));
    List<Reading> list = readings.findByDeviceOwnerIdAndRecordedAtBetween(ownerId, from, to);

    // agrupar por hora del día (0..23)
    Map<Integer, List<Reading>> byHour = list.stream().collect(Collectors.groupingBy(r ->
        LocalDateTime.ofInstant(r.getRecordedAt(), ZONE).getHour()
    ));

    Map<Integer, Double> kwhPerHour = new HashMap<>();
    for (int h=0; h<24; h++) {
      List<Reading> bucket = byHour.getOrDefault(h, Collections.emptyList());
      double sumKwh = bucket.stream().mapToDouble(this::kwh).sum();
      // promedio por hora del día a lo largo de 'days' días
      double avg = days > 0 ? sumKwh / days : 0.0;
      kwhPerHour.put(h, round3(avg));
    }
    return kwhPerHour;
  }

  private double kwh(Reading r) {
    double hours = (r.getMinutes() == null ? 60 : r.getMinutes()) / 60.0;
    return (r.getWatt() * hours) / 1000.0;
  }
  private double round3(double v){ return Math.round(v * 1000.0)/1000.0; }
}
