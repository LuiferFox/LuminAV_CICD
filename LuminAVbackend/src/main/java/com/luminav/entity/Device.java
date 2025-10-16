package com.luminav.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Device {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false) private String name;
  private String type;      // Nevera, Lavadora, TV...
  private Integer watt;     // potencia
  private String location;  // cocina, sala...
  @ManyToOne(optional=false) private User owner;
  @Column(nullable=false) private Instant createdAt = Instant.now();
  // getters/setters
  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getName(){return name;} public void setName(String n){this.name=n;}
  public String getType(){return type;} public void setType(String t){this.type=t;}
  public Integer getWatt(){return watt;} public void setWatt(Integer w){this.watt=w;}
  public String getLocation(){return location;} public void setLocation(String l){this.location=l;}
  public User getOwner(){return owner;} public void setOwner(User o){this.owner=o;}
  public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
}
