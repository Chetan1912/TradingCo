import { useState, useEffect, useMemo } from 'react';
import useAccountStore from '../../store/useAccountStore';
import usePortfolioStore from '../../store/usePortfolioStore';
import useOrderStore from '../../store/useOrderStore';
import useMarketStore from '../../store/useMarketStore';
import usePriceSubscription from '../../hooks/usePriceSubscription';
import useWebSocket from '../../hooks/useWebSocket';
import TradingChart from '../../components/trading/TradingChart/TradingChart';
import OrderTicket from '../../components/trading/OrderTicket/OrderTicket';
import WatchlistPanel from '../../components/trading/WatchlistPanel/WatchlistPanel';
import PositionsTable from '../../components/trading/PositionsTable/PositionsTable';
import OrderHistoryTable from '../../components/trading/OrderHistoryTable/OrderHistoryTable';
import { formatCurrency, formatPercent, getPnlClass } from '../../utils/formatters';
import styles from './DashboardPage.module.css';

const INDEX_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX'];

export default function DashboardPage() {
  const wsHook = useWebSocket();
  const [activeSymbol, setActiveSymbol] = useState('AAPL');
  const [bottomTab, setBottomTab] = useState('positions');

  // Stores
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const fetchAccounts = useAccountStore((s) => s.fetchAccounts);
  const portfolioSummary = usePortfolioStore((s) => s.summary);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const fetchPositions = usePortfolioStore((s) => s.fetchPositions);
  const positions = usePortfolioStore((s) => s.positions);
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  
  const quotes = useMarketStore((s) => s.quotes);

  // Subscribe to live index price updates via WebSocket
  usePriceSubscription(INDEX_SYMBOLS, wsHook);

  // Subscribe to active symbol price updates
  usePriceSubscription([activeSymbol], wsHook);

  // Load account on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Load portfolio/orders when active account changes
  useEffect(() => {
    if (activeAccount?.id) {
      fetchPortfolio(activeAccount.id);
      fetchOrders(activeAccount.id);
    }
  }, [activeAccount?.id, fetchPortfolio, fetchOrders]);

  // Watch/Subscribe private queues for order updates & portfolio updates
  useEffect(() => {
    if (!wsHook?.connected || !activeAccount?.id) return;

    // Listen to order fill/status changes
    const unsubOrders = wsHook.subscribe(`/topic/orders/${activeAccount.id}`, (order) => {
      useOrderStore.getState().updateOrderStatus(order.id, order);
      // Refresh portfolio and positions
      fetchPortfolio(activeAccount.id);
      fetchPositions(activeAccount.id);
    });

    return () => {
      unsubOrders();
    };
  }, [wsHook?.connected, activeAccount?.id, fetchPortfolio, fetchPositions]);

  const handleSymbolSelect = (symbol) => {
    setActiveSymbol(symbol);
  };

  const selectedSymbolPrice = useMemo(() => {
    return quotes[activeSymbol]?.last_price || 189.44;
  }, [activeSymbol, quotes]);

  return (
    <div className={styles.dashboard}>
      {/* Market Indices Strip */}
      <div className={styles.indicesStrip}>
        {INDEX_SYMBOLS.map((sym) => {
          const quote = quotes[sym] || {};
          const price = quote.last_price || 0;
          const changePct = quote.change_percent || 0;
          
          return (
            <div key={sym} className={styles.indexCard} onClick={() => handleSymbolSelect(sym)}>
              <h4>{sym}</h4>
              <div className={styles.indexPrice}>{price > 0 ? formatCurrency(price) : 'Loading...'}</div>
              {price > 0 && (
                <div className={`${styles.indexChange} ${getPnlClass(changePct)}`}>
                  {changePct >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(changePct))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Watchlist Panel */}
      <div className={`${styles.panel} ${styles.watchlistPanel}`}>
        <WatchlistPanel activeSymbol={activeSymbol} onSelect={handleSymbolSelect} />
      </div>

      {/* Chart Area */}
      <div className={`${styles.panel} ${styles.chartArea}`}>
        <TradingChart symbol={activeSymbol} />
      </div>

      {/* Order Ticket */}
      <div className={`${styles.panel} ${styles.orderPanel}`}>
        <div className={styles.panelHeader}>
          <h3>📋 Order Ticket</h3>
        </div>
        <div className={styles.panelBody}>
          <OrderTicket symbol={activeSymbol} lastPrice={selectedSymbolPrice} />
        </div>
      </div>

      {/* Bottom Area */}
      <div className={styles.bottomArea}>
        <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.panelHeader}>
            <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
              {['positions', 'orders', 'trades'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: bottomTab === tab ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    fontWeight: bottomTab === tab ? 600 : 400,
                    fontSize: 'var(--text-sm)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: bottomTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    paddingBottom: '4px',
                  }}
                >
                  {tab === 'positions' ? `💼 Positions (${positions.length})`
                    : tab === 'orders' ? `📋 Active Orders (${orders.filter(o => o.status === 'PENDING' || o.status === 'ACCEPTED').length})`
                    : '📊 Order History'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.panelBody} style={{ overflowY: 'auto', maxHeight: '250px' }}>
            {bottomTab === 'positions' && <PositionsTable positions={positions} />}
            {bottomTab === 'orders' && <OrderHistoryTable orders={orders.filter(o => o.status === 'PENDING' || o.status === 'ACCEPTED')} />}
            {bottomTab === 'trades' && <OrderHistoryTable orders={orders} />}
          </div>
        </div>
      </div>
    </div>
  );
}
