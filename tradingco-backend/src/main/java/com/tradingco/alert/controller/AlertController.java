package com.tradingco.alert.controller;

import com.tradingco.alert.model.Alert;
import com.tradingco.alert.service.AlertService;
import com.tradingco.auth.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Price Alerts", description = "Create, edit, toggle, and delete price alerts")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get all alerts for the current user")
    public ResponseEntity<List<Alert>> getAlerts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(alertService.getAlerts(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create a new price alert")
    public ResponseEntity<Alert> createAlert(
            @AuthenticationPrincipal User user,
            @RequestBody Alert alert) {
        Alert created = alertService.createAlert(user.getId(), alert);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Toggle an alert's active status")
    public ResponseEntity<Alert> toggleAlert(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestParam boolean active) {
        Alert updated = alertService.toggleAlert(user.getId(), id, active);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an alert")
    public ResponseEntity<Void> deleteAlert(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        alertService.deleteAlert(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
