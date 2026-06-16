import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketApi } from '../../api/marketApi';
import TradingChart from '../../components/trading/TradingChart/TradingChart';
import OrderTicket from '../../components/trading/OrderTicket/OrderTicket';
import { formatCurrency, formatPercent, getPnlClass, formatVolume } from '../../utils/formatters';
import styles from './MarketsPage.module.css';

export default function MarketsPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || 'AAPL');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync route param with selection
  useEffect(() => {
    if (symbol) {
      setSelectedSymbol(symbol.toUpperCase());
    }
  }, [symbol]);

  // Fetch all assets on load
  const fetchAssets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await marketApi.getAssets();
      setAssets(data);
    } catch (err) {
      setError('Failed to load assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // Auto-refresh asset quotes every 10 seconds
    const interval = setInterval(fetchAssets, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update selected asset when list loads or selection changes
  useEffect(() => {
    const asset = assets.find(a => a.symbol === selectedSymbol);
    if (asset) {
      setSelectedAsset(asset);
    }
  }, [selectedSymbol, assets]);

  const handleAssetSelect = (sym) => {
    setSelectedSymbol(sym);
    navigate(`/asset/${sym}`);
  };

  const sectors = ['ALL', ...new Set(assets.map(a => a.sector).filter(Boolean))];
  const filtered = filter === 'ALL' ? assets : assets.filter(a => a.sector === filter);

  return (
    <div className={styles.markets}>
      <div className={styles.leftColumn}>
        
        {/* Chart Card */}
        <div className={`card ${styles.chartCard}`}>
          <TradingChart symbol={selectedSymbol} />
        </div>

        {/* Assets List Card */}
        <div className="card">
          <div className={styles.headerRow}>
            <h3 className={styles.headerTitle}>
              Markets
            </h3>
            {sectors.map(s => (
              <button 
                key={s} 
                onClick={() => setFilter(s)} 
                className={`${styles.filterBtn} ${filter === s ? styles.filterBtnActive : ''}`}
              >
                {s}
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorMsg}>
              {error}
            </div>
          )}

          <div className={styles.tableContainer}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Symbol', 'Price', 'Change', 'Volume', 'Mkt Cap'].map(h => (
                    <th 
                      key={h} 
                      style={{ 
                        padding: 'var(--space-sm) var(--space-md)', 
                        textAlign: h === 'Symbol' ? 'left' : 'right', 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--text-muted)', 
                        fontWeight: 600, 
                        textTransform: 'uppercase', 
                        borderBottom: '1px solid var(--border)', 
                        position: 'sticky', 
                        top: 0, 
                        background: 'var(--bg-secondary)' 
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && assets.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                      Loading assets...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                      No assets found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(a => (
                    <tr 
                      key={a.symbol} 
                      onClick={() => handleAssetSelect(a.symbol)} 
                      style={{ 
                        cursor: 'pointer',
                        background: selectedSymbol === a.symbol ? 'rgba(88, 166, 255, 0.08)' : 'none'
                      }}
                    >
                      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                        <div className={styles.ticker}>{a.symbol}</div>
                        <div className={styles.subName}>{a.name}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>
                        {formatCurrency(a.lastPrice || 0)}
                      </td>
                      <td className={getPnlClass(a.changePercent || 0)} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>
                        {a.changePercent >= 0 ? '+' : ''}{formatPercent(a.changePercent || 0)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)' }}>
                        {formatVolume(a.volume || 0)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--text-sm)' }}>
                        {a.marketCap ? `${(a.marketCap / 1e9).toFixed(2)}B` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Ticket Card */}
      <div className={`card ${styles.orderTicketCard}`}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📋 Trade {selectedSymbol}
          </h3>
        </div>
        <OrderTicket 
          symbol={selectedSymbol} 
          lastPrice={selectedAsset?.lastPrice || 0} 
        />
      </div>
    </div>
  );
}
