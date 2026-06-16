import { useState, useEffect } from 'react';
import useAccountStore from '../../store/useAccountStore';
import usePortfolioStore from '../../store/usePortfolioStore';
import PositionsTable from '../../components/trading/PositionsTable/PositionsTable';
import { formatCurrency, formatPercent, getPnlClass } from '../../utils/formatters';
import api from '../../api/axios';

function MetricCard({ label, value, subValue, isProfit }) {
  return (
    <div className="card" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}</div>
      {subValue !== undefined && <div className={getPnlClass(isProfit)} style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{subValue}</div>}
    </div>
  );
}

export default function PortfolioPage() {
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const portfolioSummary = usePortfolioStore((s) => s.summary);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const positions = usePortfolioStore((s) => s.positions);

  const [tab, setTab] = useState('positions');
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch portfolio summary and positions
  useEffect(() => {
    if (activeAccount?.id) {
      fetchPortfolio(activeAccount.id);
    }
  }, [activeAccount?.id, fetchPortfolio]);

  // Fetch trade history when tab switches to 'trades'
  useEffect(() => {
    if (tab === 'trades' && activeAccount?.id) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const { data } = await api.get(`/api/v1/portfolio/${activeAccount.id}/history`);
          setTradeHistory(data);
        } catch {
          setTradeHistory([]);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [tab, activeAccount?.id]);

  const s = portfolioSummary || {
    totalEquity: activeAccount?.cashBalance || 0,
    cashBalance: activeAccount?.cashBalance || 0,
    positionsValue: 0,
    unrealizedPnl: 0,
    dayPnl: 0,
    dayPnlPct: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', animation: 'fadeIn 300ms ease-out' }}>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
        <MetricCard label="Total Equity" value={formatCurrency(s.totalEquity)} subValue={`${Number(s.dayPnl) >= 0 ? '+' : ''}${formatCurrency(s.dayPnl)} today`} isProfit={Number(s.dayPnl)} />
        <MetricCard label="Cash Balance" value={formatCurrency(s.cashBalance)} />
        <MetricCard label="Positions Value" value={formatCurrency(s.positionsValue)} />
        <MetricCard label="Unrealized P&L" value={`${Number(s.unrealizedPnl) >= 0 ? '+' : ''}${formatCurrency(s.unrealizedPnl)}`} isProfit={Number(s.unrealizedPnl)} />
        <MetricCard label="Day P&L" value={`${Number(s.dayPnl) >= 0 ? '+' : ''}${formatPercent(s.dayPnlPct)}`} isProfit={Number(s.dayPnl)} />
      </div>

      {/* Tabbed Content */}
      <div className="card">
        <div style={{ display: 'flex', gap: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setTab('positions')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
            fontWeight: tab === 'positions' ? 600 : 400, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: tab === 'positions' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: tab === 'positions' ? '2px solid var(--accent-blue)' : '2px solid transparent', paddingBottom: '4px',
          }}>
            Positions ({positions.length})
          </button>
          <button onClick={() => setTab('trades')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)',
            fontWeight: tab === 'trades' ? 600 : 400, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: tab === 'trades' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: tab === 'trades' ? '2px solid var(--accent-blue)' : '2px solid transparent', paddingBottom: '4px',
          }}>
            Trade History ({tradeHistory.length})
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          {tab === 'positions' && <PositionsTable positions={positions} />}
          {tab === 'trades' && (
            isLoadingHistory ? (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading trade history...</div>
            ) : tradeHistory.length === 0 ? (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>No closed trades found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Symbol', 'Side', 'Qty', 'Entry', 'Exit', 'P&L', 'P&L %', 'Exit Date'].map(h => (
                      <th key={h} style={{ padding: 'var(--space-sm) var(--space-md)', textAlign: h === 'Symbol' || h === 'Side' ? 'left' : 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map(t => (
                    <tr key={t.id}>
                      <td style={{ padding: 'var(--space-sm) var(--space-md)', fontWeight: 600 }}>{t.symbol}</td>
                      <td style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: 'var(--text-xs)', 
                          fontWeight: 600, 
                          background: t.side === 'BUY' || t.side === 'LONG' ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)', 
                          color: t.side === 'BUY' || t.side === 'LONG' ? 'var(--profit-green)' : 'var(--loss-red)' 
                        }}>
                          {t.side}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>{t.quantity}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>{formatCurrency(t.entryPrice)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>{formatCurrency(t.exitPrice)}</td>
                      <td className={getPnlClass(t.pnl)} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>
                        {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
                      </td>
                      <td className={getPnlClass(t.pnlPercent)} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)' }}>
                        {t.pnlPercent >= 0 ? '+' : ''}{formatPercent(t.pnlPercent)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        {new Date(t.exitTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
}
