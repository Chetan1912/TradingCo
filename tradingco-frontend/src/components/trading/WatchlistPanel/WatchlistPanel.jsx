import { useState, useEffect } from 'react';
import useWatchlistStore from '../../../store/useWatchlistStore';
import useMarketStore from '../../../store/useMarketStore';
import { marketApi } from '../../../api/marketApi';
import usePriceSubscription from '../../../hooks/usePriceSubscription';
import useWebSocket from '../../../hooks/useWebSocket';
import { formatCurrency, formatPercent, getPnlClass } from '../../../utils/formatters';
import styles from './WatchlistPanel.module.css';

export default function WatchlistPanel({ activeSymbol, onSelect }) {
  const wsHook = useWebSocket();
  const watchlists = useWatchlistStore((s) => s.watchlists);
  const activeWatchlistId = useWatchlistStore((s) => s.activeWatchlistId);
  const fetchWatchlists = useWatchlistStore((s) => s.fetchWatchlists);
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const createWatchlist = useWatchlistStore((s) => s.createWatchlist);
  const setActiveWatchlist = useWatchlistStore((s) => s.setActiveWatchlist);
  
  const quotes = useMarketStore((s) => s.quotes);

  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load user watchlists
  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  // Find active watchlist object
  const activeWatchlist = watchlists.find((wl) => wl.id === activeWatchlistId) || null;
  const watchlistSymbols = activeWatchlist?.symbols || [];

  // Live WebSocket price subscription for watchlist symbols
  usePriceSubscription(watchlistSymbols, wsHook);

  // Search assets when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await marketApi.searchAssets(searchQuery);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const created = await createWatchlist(newListName);
      setActiveWatchlist(created.id);
      setNewListName('');
      setIsCreatingList(false);
    } catch (err) {
      alert('Failed to create watchlist');
    }
  };

  const handleAddSymbol = async (symbol) => {
    if (!activeWatchlistId) return;
    try {
      await addSymbol(activeWatchlistId, symbol);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      alert('Failed to add symbol');
    }
  };

  const handleRemoveSymbol = async (e, symbol) => {
    e.stopPropagation(); // Prevent row selection
    if (!activeWatchlistId) return;
    try {
      await removeSymbol(activeWatchlistId, symbol);
    } catch {
      alert('Failed to remove symbol');
    }
  };

  return (
    <div className={styles.watchlist}>
      {/* Header with Switcher / Create List Button */}
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
          <span className={styles.title}>👁️ Watchlists</span>
          {watchlists.length > 1 && (
            <select
              value={activeWatchlistId || ''}
              onChange={(e) => setActiveWatchlist(e.target.value)}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 4px',
                fontSize: 'var(--text-xs)',
                outline: 'none',
              }}
            >
              {watchlists.map((wl) => (
                <option key={wl.id} value={wl.id}>{wl.name}</option>
              ))}
            </select>
          )}
        </div>
        <button className={styles.addBtn} onClick={() => setIsCreatingList(!isCreatingList)}>
          {isCreatingList ? 'Cancel' : '+ New'}
        </button>
      </div>

      {/* Create List Form Overlay/Section */}
      {isCreatingList && (
        <form onSubmit={handleCreateList} style={{ display: 'flex', padding: 'var(--space-sm)', gap: 'var(--space-xs)', borderBottom: '1px solid var(--border)' }}>
          <input
            type="text"
            placeholder="Watchlist Name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: 'var(--text-xs)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
            }}
            autoFocus
          />
          <button type="submit" style={{
            background: 'var(--accent-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Create
          </button>
        </form>
      )}

      {/* Add Symbol Search */}
      {activeWatchlistId && (
        <div style={{ position: 'relative', padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--border)' }}>
          <input
            type="text"
            placeholder="Type symbol to add... (e.g. MSFT)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              fontSize: 'var(--text-xs)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 'var(--space-md)',
              right: 'var(--space-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              zIndex: 10,
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              {searchResults.map((res) => (
                <div
                  key={res.symbol}
                  onClick={() => handleAddSymbol(res.symbol)}
                  style={{
                    padding: '6px 10px',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <span style={{ fontWeight: 600 }}>{res.symbol}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{res.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Rows */}
      <div className={styles.list}>
        {watchlistSymbols.length === 0 ? (
          <div className={styles.empty}>
            {activeWatchlistId ? 'Watchlist is empty. Search above to add assets.' : 'No watchlists available.'}
          </div>
        ) : (
          watchlistSymbols.map((symbol) => {
            const quote = quotes[symbol] || {};
            // Resolve last price, change info
            const price = quote.last_price || 0;
            const changePct = quote.change_percent || 0;

            return (
              <div
                key={symbol}
                className={`${styles.row} ${activeSymbol === symbol ? styles.active : ''}`}
                onClick={() => onSelect?.(symbol)}
                style={{ position: 'relative' }}
              >
                <div className={styles.left}>
                  <span className={styles.ticker}>{symbol}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div className={styles.right}>
                    <div className={styles.price}>{price > 0 ? formatCurrency(price) : 'Loading...'}</div>
                    {price > 0 && (
                      <div className={`${styles.change} ${getPnlClass(changePct)}`}>
                        {changePct >= 0 ? '+' : ''}{formatPercent(changePct)}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button shown on hover */}
                  <button
                    onClick={(e) => handleRemoveSymbol(e, symbol)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-sm)',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--loss-red)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    title="Remove from Watchlist"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
