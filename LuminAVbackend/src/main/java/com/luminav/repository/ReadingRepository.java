package com.luminav.repository;

import com.luminav.entity.Reading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ReadingRepository extends JpaRepository<Reading, Long> {
  List<Reading> findByDeviceOwnerIdAndRecordedAtBetween(Long ownerId, Instant from, Instant to);
  List<Reading> findByDeviceOwnerIdAndRecordedAtBetweenAndDeviceId(Long ownerId, Instant from, Instant to, Long deviceId);
}
