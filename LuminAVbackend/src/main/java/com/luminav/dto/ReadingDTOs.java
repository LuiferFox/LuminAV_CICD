package com.luminav.dto;

import java.time.Instant;
import java.util.List;

public class ReadingDTOs {
  public static class CreateReading {
    public Long deviceId;
    public Integer watt;
    public Integer minutes;   // opcional (default 60)
    public Instant recordedAt; // opcional (default now)
  }
  public static class BulkCreateRequest {
    public List<CreateReading> readings;
  }
}
