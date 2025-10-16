package com.luminav.controller;

import com.luminav.dto.ReadingDTOs;
import com.luminav.entity.Device;
import com.luminav.entity.Reading;
import com.luminav.repository.DeviceRepository;
import com.luminav.repository.ReadingRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class ReadingController {

  private final ReadingRepository readings;
  private final DeviceRepository devices;

  public ReadingController(ReadingRepository readings, DeviceRepository devices) {
    this.readings = readings; this.devices = devices;
  }

  @GetMapping
  public List<Reading> list(
      @RequestParam Long ownerId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
      @RequestParam(required = false) Long deviceId
  ) {
    if (deviceId != null) {
      return readings.findByDeviceOwnerIdAndRecordedAtBetweenAndDeviceId(ownerId, from, to, deviceId);
    }
    return readings.findByDeviceOwnerIdAndRecordedAtBetween(ownerId, from, to);
  }

  @PostMapping
  public Reading create(@RequestBody ReadingDTOs.CreateReading body) {
    Device d = devices.findById(body.deviceId).orElseThrow();
    Reading r = new Reading();
    r.setDevice(d);
    r.setWatt(body.watt);
    r.setMinutes(body.minutes == null ? 60 : body.minutes);
    r.setRecordedAt(body.recordedAt == null ? Instant.now() : body.recordedAt);
    return readings.save(r);
  }

  @PostMapping("/bulk")
  public ResponseEntity<?> bulk(@RequestBody ReadingDTOs.BulkCreateRequest req) {
    if (req.readings == null || req.readings.isEmpty()) return ResponseEntity.badRequest().body("readings vacío");
    for (ReadingDTOs.CreateReading c : req.readings) {
      Device d = devices.findById(c.deviceId).orElseThrow();
      Reading r = new Reading();
      r.setDevice(d);
      r.setWatt(c.watt);
      r.setMinutes(c.minutes == null ? 60 : c.minutes);
      r.setRecordedAt(c.recordedAt == null ? Instant.now() : c.recordedAt);
      readings.save(r);
    }
    return ResponseEntity.ok().build();
  }
}

