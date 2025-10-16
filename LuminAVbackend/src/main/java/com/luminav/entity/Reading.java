package com.luminav.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "reading")
public class Reading {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private Device device;

  @Column(nullable = false)
  private Integer watt;        // potencia instantánea del muestreo

  @Column(nullable = false)
  private Integer minutes = 60; // duración que representa este muestreo (minutos)

  @Column(nullable = false)
  private Instant recordedAt = Instant.now();

  // getters/setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Device getDevice() { return device; }
  public void setDevice(Device device) { this.device = device; }
  public Integer getWatt() { return watt; }
  public void setWatt(Integer watt) { this.watt = watt; }
  public Integer getMinutes() { return minutes; }
  public void setMinutes(Integer minutes) { this.minutes = minutes; }
  public Instant getRecordedAt() { return recordedAt; }
  public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}
