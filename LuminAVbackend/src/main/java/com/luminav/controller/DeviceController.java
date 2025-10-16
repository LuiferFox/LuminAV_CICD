package com.luminav.controller;



import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.luminav.entity.Device;
import com.luminav.entity.User;
import com.luminav.repository.DeviceRepository;
import com.luminav.repository.UserRepository;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

  private final DeviceRepository devices;
  private final UserRepository users;

  public DeviceController(DeviceRepository devices, UserRepository users){
    this.devices = devices; this.users = users;
  }

  @GetMapping
  public List<Device> list(@RequestParam Long ownerId){
    return devices.findByOwnerId(ownerId);
  }

  @PostMapping
  public Device create(@RequestParam Long ownerId, @RequestBody Device body){
    User u = users.findById(ownerId).orElseThrow();
    body.setId(null);
    body.setOwner(u);
    body.setCreatedAt(Instant.now());
    return devices.save(body);
  }

  @PutMapping("/{id}")
  public Device update(@PathVariable Long id, @RequestParam Long ownerId, @RequestBody Device body){
    Device d = devices.findById(id).orElseThrow();
    if (!d.getOwner().getId().equals(ownerId)) { throw new ResponseStatusException(HttpStatus.FORBIDDEN); }
    d.setName(body.getName());
    d.setType(body.getType());
    d.setWatt(body.getWatt());
    d.setLocation(body.getLocation());
    return devices.save(d);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id, @RequestParam Long ownerId){
    Device d = devices.findById(id).orElseThrow();
    if (!d.getOwner().getId().equals(ownerId)) { throw new ResponseStatusException(HttpStatus.FORBIDDEN); }
    devices.deleteById(id);
  }
}