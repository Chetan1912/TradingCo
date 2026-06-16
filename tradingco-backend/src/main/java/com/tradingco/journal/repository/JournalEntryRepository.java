package com.tradingco.journal.repository;

import com.tradingco.journal.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    List<JournalEntry> findByAccountIdOrderByCreatedAtDesc(UUID accountId);
    Optional<JournalEntry> findByIdAndAccountId(UUID id, UUID accountId);
    Optional<JournalEntry> findByTradeId(UUID tradeId);
}
