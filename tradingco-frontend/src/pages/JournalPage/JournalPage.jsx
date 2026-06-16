import { useState, useEffect } from 'react';
import useAccountStore from '../../store/useAccountStore';
import { journalApi } from '../../api/journalApi';
import styles from './JournalPage.module.css';

export default function JournalPage() {
  const activeAccount = useAccountStore((s) => s.activeAccount);

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    symbol: '', strategyTag: '', notes: '', emotion: 'CONFIDENT', tradeRating: 5, lessonsLearned: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchEntries = async () => {
    if (!activeAccount?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await journalApi.getEntries(activeAccount.id);
      setEntries(data);
    } catch {
      setError('Failed to fetch journal entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [activeAccount?.id]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleEdit = (entry) => {
    setForm({
      symbol: entry.symbol || '',
      strategyTag: entry.strategyTag || '',
      notes: entry.notes || '',
      emotion: entry.emotion || 'CONFIDENT',
      tradeRating: entry.tradeRating || 5,
      lessonsLearned: entry.lessonsLearned || ''
    });
    setEditingId(entry.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setForm({ symbol: '', strategyTag: '', notes: '', emotion: 'CONFIDENT', tradeRating: 5, lessonsLearned: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAccount?.id) return;

    try {
      if (editingId) {
        await journalApi.updateEntry(activeAccount.id, editingId, form);
      } else {
        await journalApi.createEntry(activeAccount.id, form);
      }
      fetchEntries();
      handleCancel();
    } catch {
      alert('Failed to save journal entry.');
    }
  };

  const handleDelete = async (id) => {
    if (!activeAccount?.id || !window.confirm('Delete this journal entry?')) return;
    try {
      await journalApi.deleteEntry(activeAccount.id, id);
      fetchEntries();
    } catch {
      alert('Failed to delete entry.');
    }
  };

  if (!activeAccount) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Please login and select an account to view your trade journal.
      </div>
    );
  }

  return (
    <div className={showAddForm ? "grid-responsive-journal" : ""} style={{ animation: 'fadeIn 300ms ease-out' }}>
      
      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>📓 Trade Journal</h1>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn-primary" 
              style={{
                padding: '8px 16px',
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Log
            </button>
          )}
        </div>

        {error && (
          <div style={{ padding: 'var(--space-md)', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid var(--loss-red)', color: 'var(--loss-red)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}

        {isLoading && entries.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading journal logs...
          </div>
        ) : entries.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No journal entries logged yet. Keep track of your trade reasoning, emotions, and lessons learned.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {entries.map((entry) => (
              <div key={entry.id} className="card" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--accent-blue)' }}>
                      {entry.symbol ? entry.symbol.toUpperCase() : 'GENERAL LOG'}
                    </span>
                    {entry.strategyTag && (
                      <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        🏷️ {entry.strategyTag}
                      </span>
                    )}
                    <span style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', background: 'rgba(88,166,255,0.1)', color: 'var(--accent-blue)' }}>
                      🎭 {entry.emotion}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)' }}>
                      {'⭐'.repeat(entry.tradeRating || 5)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button onClick={() => handleEdit(entry)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }} title="Edit">✏️</button>
                    <button onClick={() => handleDelete(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }} title="Delete">🗑️</button>
                  </div>
                </div>

                <p style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)', lineHeight: 1.5, margin: 'var(--space-xs) 0' }}>
                  {entry.notes}
                </p>

                {entry.lessonsLearned && (
                  <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-blue)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <strong>Lessons Learned:</strong> {entry.lessonsLearned}
                  </div>
                )}
                
                <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Logged on {new Date(entry.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Sidebar */}
      {showAddForm && (
        <div className="card" style={{ padding: 'var(--space-lg)', alignSelf: 'start' }}>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-lg)' }}>
            {editingId ? '✏️ Edit Log Entry' : '📓 Add Log Entry'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Symbol (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. AAPL" 
                value={form.symbol} 
                onChange={handleChange('symbol')} 
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Strategy Tag</label>
              <input 
                type="text" 
                placeholder="e.g. Breakout, Support Bounce" 
                value={form.strategyTag} 
                onChange={handleChange('strategyTag')} 
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Emotion Tag</label>
              <select 
                value={form.emotion} 
                onChange={handleChange('emotion')}
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {['CONFIDENT', 'UNCERTAIN', 'FOMO', 'REVENGE', 'DISCIPLINED'].map(em => (
                  <option key={em} value={em}>{em}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rating (1-5)</label>
              <select 
                value={form.tradeRating} 
                onChange={handleChange('tradeRating')}
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {[1, 2, 3, 4, 5].map(r => (
                  <option key={r} value={r}>{'⭐'.repeat(r)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trade Notes / Reasoning</label>
              <textarea 
                rows="4"
                placeholder="Why did you take this trade? What did you see on the chart?"
                value={form.notes} 
                onChange={handleChange('notes')} 
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lessons Learned</label>
              <textarea 
                rows="3"
                placeholder="What could you have done better?"
                value={form.lessonsLearned} 
                onChange={handleChange('lessonsLearned')} 
                style={{ padding: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <button 
                type="button" 
                onClick={handleCancel} 
                style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ padding: '8px 20px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
