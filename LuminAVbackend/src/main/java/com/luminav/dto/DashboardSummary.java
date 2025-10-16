package com.luminav.dto;

import java.util.List;

public class DashboardSummary {
  public static class Point {
    public String bucket; // "2025-09-10 14:00" o "2025-09-10"
    public double kwh;
    public Point() {}
    public Point(String bucket, double kwh) { this.bucket = bucket; this.kwh = kwh; }
  }
  public static class DeviceUsage {
    public Long deviceId;
    public String name;
    public double kwh;
    public DeviceUsage() {}
    public DeviceUsage(Long deviceId, String name, double kwh) { this.deviceId = deviceId; this.name = name; this.kwh = kwh; }
  }
  public double totalKwh;
  public double totalCost;
  public List<Point> byHour;
  public List<Point> byDay;
  public List<DeviceUsage> topDevices;
}
