import { formatCurrency, formatPercent, getPnlClass } from '../../../utils/formatters';
import styles from './PositionsTable.module.css';

export default function PositionsTable({ positions = [] }) {
  if (!positions.length) {
    return <div className={styles.empty}>No open positions. Place your first trade!</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th className={styles.right}>Qty</th>
            <th className={styles.right}>Avg Cost</th>
            <th className={styles.right}>Current</th>
            <th className={styles.right}>Mkt Value</th>
            <th className={styles.right}>Unrealized P&L</th>
            <th className={styles.right}>P&L %</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id || pos.symbol}>
              <td>
                <div className={styles.symbolCell}>
                  <span className={styles.symbolTicker}>{pos.symbol}</span>
                </div>
              </td>
              <td>
                <span className={`${styles.badge} ${pos.side === 'BUY' ? styles.badgeBuy : styles.badgeSell}`}>
                  {pos.side}
                </span>
              </td>
              <td className={`${styles.right} ${styles.mono}`}>{pos.quantity?.toLocaleString()}</td>
              <td className={`${styles.right} ${styles.mono}`}>{formatCurrency(pos.avgCost)}</td>
              <td className={`${styles.right} ${styles.mono}`}>{formatCurrency(pos.currentPrice)}</td>
              <td className={`${styles.right} ${styles.mono}`}>{formatCurrency(pos.marketValue)}</td>
              <td className={`${styles.right} ${styles.mono} ${getPnlClass(pos.unrealizedPnl)}`}>
                {pos.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(pos.unrealizedPnl)}
              </td>
              <td className={`${styles.right} ${styles.mono} ${getPnlClass(pos.unrealizedPnlPct)}`}>
                {pos.unrealizedPnlPct >= 0 ? '+' : ''}{formatPercent(pos.unrealizedPnlPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
