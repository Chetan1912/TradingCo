package com.tradingco.alert.repository;

import com.tradingco.alert.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Alert> findByIsActiveTrueAndIsTriggeredFalse();
    Optional<Alert> findByIdAndUserId(UUID id, UUID userId);
}
