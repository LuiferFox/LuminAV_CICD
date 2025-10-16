package com.luminav.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luminav.entity.Device;

import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, Long> {
  List<Device> findByOwnerId(Long ownerId);
}