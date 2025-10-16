package com.luminav.entity;

import jakarta.persistence.*;

@Entity
public class Tariff {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  @ManyToOne(optional=false) private User owner;
  @Column(nullable=false) private double pricePerKwh;
  private Integer peakStart; // 0-23
  private Integer peakEnd;   // 0-23
  // getters/setters
  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public User getOwner(){return owner;} public void setOwner(User o){this.owner=o;}
  public double getPricePerKwh(){return pricePerKwh;} public void setPricePerKwh(double p){this.pricePerKwh=p;}
  public Integer getPeakStart(){return peakStart;} public void setPeakStart(Integer s){this.peakStart=s;}
  public Integer getPeakEnd(){return peakEnd;} public void setPeakEnd(Integer e){this.peakEnd=e;}
}