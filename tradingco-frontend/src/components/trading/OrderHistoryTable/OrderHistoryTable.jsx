import { formatCurrency, formatDate, getPnlClass } from '../../../utils/formatters';
import styles from '../PositionsTable/PositionsTable.module.css';

export default function OrderHistoryTable({ orders = [] }) {
  if (!orders.length) {
    return <div className={styles.empty}>No orders placed yet.</div>;
  }

  const statusColor = (status) => {
    switch (status) {
      case 'FILLED': return 'var(--profit-green)';
      case 'CANCELLED': return 'var(--text-muted)';
      case 'REJECTED': return 'var(--loss-red)';
      case 'PENDING': case 'ACCEPTED': return 'var(--accent-yellow)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Side</th>
          <th>Type</th>
          <th className={styles.right}>Qty</th>
          <th className={styles.right}>Price</th>
          <th>Status</th>
          <th className={styles.right}>Time</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td className={styles.symbolTicker}>{order.symbol}</td>
            <td>
              <span className={`${styles.badge} ${order.side === 'BUY' ? styles.badgeBuy : styles.badgeSell}`}>
                {order.side}
              </span>
            </td>
            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              {order.orderType?.replace('_', ' ')}
            </td>
            <td className={`${styles.right} ${styles.mono}`}>
              {order.filledQuantity || 0}/{order.quantity}
            </td>
            <td className={`${styles.right} ${styles.mono}`}>
              {order.avgFillPrice ? formatCurrency(order.avgFillPrice)
                : order.limitPrice ? formatCurrency(order.limitPrice) : '—'}
            </td>
            <td>
              <span style={{ color: statusColor(order.status), fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                {order.status}
              </span>
            </td>
            <td className={`${styles.right}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {order.createdAt ? formatDate(order.createdAt) : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
