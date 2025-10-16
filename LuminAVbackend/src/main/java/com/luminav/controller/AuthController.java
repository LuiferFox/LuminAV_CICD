package com.luminav.controller;
import com.luminav.dto.RegisterRequest;
import com.luminav.dto.RegisterResponse;
import com.luminav.entity.User;
import com.luminav.repository.UserRepository;


import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository users;
  private final PasswordEncoder encoder;

  public AuthController(UserRepository users, PasswordEncoder encoder) {
    this.users = users; this.encoder = encoder;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    // Validaciones básicas
    if (req.getFullName() == null || req.getFullName().isBlank()
        || req.getEmail() == null || req.getEmail().isBlank()
        || req.getPassword() == null || req.getPassword().isBlank()) {
      return ResponseEntity.badRequest().body("fullName, email y password son obligatorios");
    }
    // Email con '@' (validación simple)
    if (!Pattern.compile(".+@.+\\..+").matcher(req.getEmail()).matches()) {
      return ResponseEntity.badRequest().body("email no es válido");
    }
    // Único por email
    if (users.findByEmail(req.getEmail()).isPresent()) {
      return ResponseEntity.status(409).body("email ya está registrado");
    }

    // Crear usuario
    User u = new User();
    u.setFullName(req.getFullName());
    u.setEmail(req.getEmail());
    u.setUsername(req.getEmail()); // para compatibilidad con código que usa 'username'
    u.setPasswordHash(encoder.encode(req.getPassword()));
    u.setRole("RESIDENT");
    u.setCreatedAt(Instant.now());
    u = users.save(u);

    return ResponseEntity.ok(new RegisterResponse(
      u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getCreatedAt()
    ));
  }
  
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String password = body.get("password");
    if (email == null || password == null || email.isBlank() || password.isBlank()) {
      return ResponseEntity.badRequest().body("email y password son obligatorios");
    }
    var userOpt = users.findByEmail(email);
    if (userOpt.isEmpty()) return ResponseEntity.status(401).body("Credenciales inválidas");

    var u = userOpt.get();
    if (!encoder.matches(password, u.getPasswordHash()))
      return ResponseEntity.status(401).body("Credenciales inválidas");

    // Por ahora devolvemos datos básicos (sin JWT)
    Map<String, Object> resp = Map.of(
        "id", u.getId(),
        "fullName", u.getFullName(),
        "email", u.getEmail(),
        "role", u.getRole()
    );
    return ResponseEntity.ok(resp);
  }
}