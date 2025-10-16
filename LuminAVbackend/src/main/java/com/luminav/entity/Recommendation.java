package com.luminav.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recommendation")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // extra seguro
public class Recommendation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // NO serializar el objeto User para evitar el proxy LAZY
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "owner_id")
  @JsonIgnore
  private User owner;

  @Column(nullable = false, length = 500)
  private String message;

  // INFO | WARN | ALERT
  @Column(nullable = false, length = 16)
  private String level;

  // NEW | DONE (String según tu esquema)
  @Column(name = "status", nullable = false, length = 16)
  private String status = "NEW";

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  // ---------- Exponer ownerId en el JSON ----------
  @Transient
  @JsonProperty("ownerId")
  public Long getOwnerId() {
    return owner != null ? owner.getId() : null;
  }

  // ---------- getters/setters ----------
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public User getOwner() { return owner; }
  public void setOwner(User owner) { this.owner = owner; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }

  public String getLevel() { return level; }
  public void setLevel(String level) { this.level = level; }

  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

