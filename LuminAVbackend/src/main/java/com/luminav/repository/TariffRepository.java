package com.luminav.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luminav.entity.Tariff;

import java.util.Optional;

public interface TariffRepository extends JpaRepository<Tariff, Long> {
  Optional<Tariff> findByOwnerId(Long ownerId);
}