package com.luminav.entity;


	import jakarta.persistence.*;
	import java.time.Instant;


@Entity @Table(name="users")
public class User {
	 @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
	 private Long id;

	  @Column(unique=true, nullable=false)
	  private String username; // usaremos el email como username también (compatibilidad)

	  @Column(unique=true, nullable=false)
	  private String email;

	  @Column(nullable=false)
	  private String fullName;

	  @Column(nullable=false)
	  private String passwordHash;

	  @Column(nullable=false)
	  private String role; // RESIDENT | ADMIN

	  @Column(nullable=false)
	  private Instant createdAt = Instant.now();

	  // getters/setters
	  public Long getId(){return id;} public void setId(Long id){this.id=id;}
	  public String getUsername(){return username;} public void setUsername(String u){this.username=u;}
	  public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
	  public String getFullName(){return fullName;} public void setFullName(String n){this.fullName=n;}
	  public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String p){this.passwordHash=p;}
	  public String getRole(){return role;} public void setRole(String r){this.role=r;}
	  public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant t){this.createdAt=t;}
	}
