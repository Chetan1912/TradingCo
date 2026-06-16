import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import styles from './OrderConfirmModal.module.css';

export default function OrderConfirmModal({ isOpen, onClose, onConfirm, orderDetails }) {
  if (!isOpen || !orderDetails) return null;

  const { symbol, side, orderType, quantity, price, estimatedTotal, commission } = orderDetails;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Confirm Order execution</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.summaryCard}>
            <div className={styles.sideBadge} style={{
              background: side === 'BUY' ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)',
              color: side === 'BUY' ? 'var(--profit-green)' : 'var(--loss-red)'
            }}>
              {side} {quantity} {symbol}
            </div>
            <div className={styles.typeLabel}>{orderType} Order</div>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span>Order Type</span>
              <span>{orderType}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Limit / Stop Price</span>
              <span>{price ? formatCurrency(price) : 'Market Price'}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Quantity</span>
              <span>{quantity}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Est. Commission</span>
              <span>{formatCurrency(commission)}</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.detailRow} style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>
              <span>Estimated Total</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>

          <div className={styles.disclaimer}>
            ⚠️ This is a simulated paper trade. No real money or brokerage execution will occur.
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button 
            className={`${styles.confirmBtn} ${side === 'BUY' ? styles.btnBuy : styles.btnSell}`} 
            onClick={onConfirm}
          >
            Confirm {side}
          </button>
        </div>
      </div>
    </div>
  );
}
