package com.tradingco.journal.service;

import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.journal.model.JournalEntry;
import com.tradingco.journal.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalEntryRepository journalEntryRepository;

    @Transactional(readOnly = true)
    public List<JournalEntry> getEntries(UUID accountId) {
        return journalEntryRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    @Transactional(readOnly = true)
    public JournalEntry getEntry(UUID accountId, UUID entryId) {
        return journalEntryRepository.findByIdAndAccountId(entryId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", "id", entryId.toString()));
    }

    @Transactional
    public JournalEntry createEntry(UUID accountId, JournalEntry entry) {
        entry.setAccountId(accountId);
        return journalEntryRepository.save(entry);
    }

    @Transactional
    public JournalEntry updateEntry(UUID accountId, UUID entryId, JournalEntry updates) {
        JournalEntry existing = getEntry(accountId, entryId);
        
        if (updates.getNotes() != null) {
            existing.setNotes(updates.getNotes());
        }
        if (updates.getStrategyTag() != null) {
            existing.setStrategyTag(updates.getStrategyTag());
        }
        if (updates.getEmotion() != null) {
            existing.setEmotion(updates.getEmotion());
        }
        if (updates.getTradeRating() != null) {
            existing.setTradeRating(updates.getTradeRating());
        }
        if (updates.getLessonsLearned() != null) {
            existing.setLessonsLearned(updates.getLessonsLearned());
        }
        if (updates.getSymbol() != null) {
            existing.setSymbol(updates.getSymbol().toUpperCase());
        }
        if (updates.getTradeId() != null) {
            existing.setTradeId(updates.getTradeId());
        }
        
        return journalEntryRepository.save(existing);
    }

    @Transactional
    public void deleteEntry(UUID accountId, UUID entryId) {
        JournalEntry existing = getEntry(accountId, entryId);
        journalEntryRepository.delete(existing);
    }
}
