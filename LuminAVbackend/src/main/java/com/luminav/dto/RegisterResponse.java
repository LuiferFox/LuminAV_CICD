package com.luminav.dto;

import java.time.Instant;

public class RegisterResponse {
	private Long id;
	  private String fullName;
	  private String email;
	  private String role;
	  private Instant createdAt;

	  public RegisterResponse(Long id, String fullName, String email, String role, Instant createdAt) {
	    this.id = id; this.fullName = fullName; this.email = email; this.role = role; this.createdAt = createdAt;
	  }
	  public Long getId() { return id; }
	  public String getFullName() { return fullName; }
	  public String getEmail() { return email; }
	  public String getRole() { return role; }
	  public Instant getCreatedAt() { return createdAt; }
}
