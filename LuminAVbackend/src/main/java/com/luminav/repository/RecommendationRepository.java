package com.luminav.repository;

import com.luminav.entity.Recommendation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

  // Solo filtra por owner y retorna 100 más recientes
  List<Recommendation> findTop100ByOwner_IdOrderByCreatedAtDesc(Long ownerId);

  // Filtra por owner y status, retorna 100 más recientes
  List<Recommendation> findTop100ByOwner_IdAndStatusOrderByCreatedAtDesc(Long ownerId, String status);

  // Variante con paginación (útil si quieres un límite dinámico)
  List<Recommendation> findByOwner_IdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);

  List<Recommendation> findByOwner_IdAndStatusOrderByCreatedAtDesc(Long ownerId, String status, Pageable pageable);
}
