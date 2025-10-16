package com.luminav.service;

import com.luminav.dto.DashboardSummary;
import com.luminav.entity.Device;
import com.luminav.entity.Reading;
import com.luminav.entity.Tariff;
import com.luminav.repository.ReadingRepository;
import com.luminav.repository.TariffRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
  private final ReadingRepository readings;
  private final TariffRepository tariffs;

  private static final ZoneId ZONE = ZoneId.systemDefault();
  private static final DateTimeFormatter HOUR_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00");
  private static final DateTimeFormatter DAY_FMT  = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  public DashboardService(ReadingRepository readings, TariffRepository tariffs) {
    this.readings = readings;
    this.tariffs = tariffs;
  }

  public DashboardSummary summarize(Long ownerId, Instant from, Instant to) {
    List<Reading> list = readings.findByDeviceOwnerIdAndRecordedAtBetween(ownerId, from, to);

    double totalKwh = list.stream().mapToDouble(this::kwh).sum();

    // byHour
    Map<String, Double> byHour = new TreeMap<>();
    for (Reading r : list) {
      String bucket = LocalDateTime.ofInstant(r.getRecordedAt(), ZONE)
          .withMinute(0).withSecond(0).withNano(0).format(HOUR_FMT);
      byHour.merge(bucket, kwh(r), Double::sum);
    }

    // byDay
    Map<String, Double> byDay = new TreeMap<>();
    for (Reading r : list) {
      String bucket = LocalDateTime.ofInstant(r.getRecordedAt(), ZONE)
          .toLocalDate().format(DAY_FMT);
      byDay.merge(bucket, kwh(r), Double::sum);
    }

    // top devices
    Map<Device, Double> byDevice = new HashMap<>();
    for (Reading r : list) {
      byDevice.merge(r.getDevice(), kwh(r), Double::sum);
    }
    List<DashboardSummary.DeviceUsage> top = byDevice.entrySet().stream()
        .sorted((a,b) -> Double.compare(b.getValue(), a.getValue()))
        .limit(5)
        .map(e -> new DashboardSummary.DeviceUsage(e.getKey().getId(), e.getKey().getName(), round3(e.getValue())))
        .collect(Collectors.toList());

    // tarifa
    double pricePerKwh = tariffs.findByOwnerId(ownerId)
        .map(Tariff::getPricePerKwh).orElse(650.0); // COP/kWh por defecto
    double totalCost = round2(totalKwh * pricePerKwh);

    DashboardSummary s = new DashboardSummary();
    s.totalKwh = round3(totalKwh);
    s.totalCost = totalCost;
    s.byHour = byHour.entrySet().stream()
        .map(e -> new DashboardSummary.Point(e.getKey(), round3(e.getValue())))
        .collect(Collectors.toList());
    s.byDay = byDay.entrySet().stream()
        .map(e -> new DashboardSummary.Point(e.getKey(), round3(e.getValue())))
        .collect(Collectors.toList());
    s.topDevices = top;
    return s;
  }

  private double kwh(Reading r) {
    double hours = (r.getMinutes() == null ? 60 : r.getMinutes()) / 60.0;
    return (r.getWatt() * hours) / 1000.0;
  }

  private double round2(double v){ return Math.round(v * 100.0)/100.0; }
  private double round3(double v){ return Math.round(v * 1000.0)/1000.0; }
}
