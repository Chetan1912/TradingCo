package com.tradingco.journal.controller;

import com.tradingco.journal.model.JournalEntry;
import com.tradingco.journal.service.JournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/journal")
@RequiredArgsConstructor
@Tag(name = "Trade Journal", description = "CRUD operations for trade notes, strategy tagging, and emotions")
public class JournalController {

    private final JournalService journalService;

    @GetMapping("/{accountId}")
    @Operation(summary = "Get all journal entries for an account")
    public ResponseEntity<List<JournalEntry>> getEntries(@PathVariable UUID accountId) {
        return ResponseEntity.ok(journalService.getEntries(accountId));
    }

    @GetMapping("/{accountId}/{id}")
    @Operation(summary = "Get a specific journal entry details")
    public ResponseEntity<JournalEntry> getEntry(
            @PathVariable UUID accountId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(journalService.getEntry(accountId, id));
    }

    @PostMapping("/{accountId}")
    @Operation(summary = "Create a new journal entry")
    public ResponseEntity<JournalEntry> createEntry(
            @PathVariable UUID accountId,
            @RequestBody JournalEntry entry) {
        JournalEntry created = journalService.createEntry(accountId, entry);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{accountId}/{id}")
    @Operation(summary = "Update an existing journal entry")
    public ResponseEntity<JournalEntry> updateEntry(
            @PathVariable UUID accountId,
            @PathVariable UUID id,
            @RequestBody JournalEntry entry) {
        JournalEntry updated = journalService.updateEntry(accountId, id, entry);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{accountId}/{id}")
    @Operation(summary = "Delete a journal entry")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable UUID accountId,
            @PathVariable UUID id) {
        journalService.deleteEntry(accountId, id);
        return ResponseEntity.noContent().build();
    }
}
