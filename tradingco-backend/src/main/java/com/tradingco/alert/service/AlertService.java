package com.tradingco.alert.service;

import com.tradingco.alert.model.Alert;
import com.tradingco.alert.repository.AlertRepository;
import com.tradingco.auth.model.User;
import com.tradingco.auth.repository.UserRepository;
import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.market.model.Quote;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<Alert> getAlerts(UUID userId) {
        return alertRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Alert createAlert(UUID userId, Alert alert) {
        alert.setUserId(userId);
        alert.setIsTriggered(false);
        alert.setIsActive(true);
        return alertRepository.save(alert);
    }

    @Transactional
    public void deleteAlert(UUID userId, UUID alertId) {
        Alert alert = alertRepository.findByIdAndUserId(alertId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", alertId.toString()));
        alertRepository.delete(alert);
    }

    @Transactional
    public Alert toggleAlert(UUID userId, UUID alertId, boolean active) {
        Alert alert = alertRepository.findByIdAndUserId(alertId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", "id", alertId.toString()));
        alert.setIsActive(active);
        if (active) {
            alert.setIsTriggered(false);
            alert.setTriggeredAt(null);
        }
        return alertRepository.save(alert);
    }

    /**
     * Checks active, untriggered alerts against updated quote prices.
     */
    @Transactional
    public void checkAlerts(List<Quote> quotes) {
        List<Alert> activeAlerts = alertRepository.findByIsActiveTrueAndIsTriggeredFalse();
        if (activeAlerts.isEmpty()) return;

        for (Quote q : quotes) {
            List<Alert> symbolAlerts = activeAlerts.stream()
                    .filter(a -> a.getSymbol().equalsIgnoreCase(q.getSymbol()))
                    .toList();

            for (Alert alert : symbolAlerts) {
                boolean shouldTrigger = false;
                if (alert.getAlertType() == Alert.AlertType.PRICE_ABOVE) {
                    shouldTrigger = q.getLastPrice().compareTo(alert.getTargetValue()) >= 0;
                } else if (alert.getAlertType() == Alert.AlertType.PRICE_BELOW) {
                    shouldTrigger = q.getLastPrice().compareTo(alert.getTargetValue()) <= 0;
                }

                if (shouldTrigger) {
                    triggerAlert(alert, q);
                }
            }
        }
    }

    private void triggerAlert(Alert alert, Quote q) {
        alert.setIsTriggered(true);
        alert.setIsActive(false);
        alert.setTriggeredAt(LocalDateTime.now());
        alertRepository.save(alert);

        log.info("Alert triggered: {} is {} (Target: {})", alert.getSymbol(), alert.getAlertType(), alert.getTargetValue());

        // Send WebSocket notification to the user
        Optional<User> userOpt = userRepository.findById(alert.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In STOMP, convertAndSendToUser sends to /user/{username}/queue/alerts
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/alerts",
                    alert
            );
        }
    }
}
