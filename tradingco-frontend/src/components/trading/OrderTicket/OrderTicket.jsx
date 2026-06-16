import { useState, useMemo } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import useOrderStore from '../../../store/useOrderStore';
import useAccountStore from '../../../store/useAccountStore';
import usePortfolioStore from '../../../store/usePortfolioStore';
import OrderConfirmModal from '../OrderConfirmModal/OrderConfirmModal';
import styles from './OrderTicket.module.css';

const ORDER_TYPES = ['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'];

export default function OrderTicket({ symbol = 'AAPL', lastPrice = 189.44 }) {
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(100);
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  
  // Bracket order states
  const [attachBracket, setAttachBracket] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  // Confirmation Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Store actions & data
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const activeAccount = useAccountStore((s) => s.activeAccount);
  const portfolioSummary = usePortfolioStore((s) => s.summary);

  const totalEquity = useMemo(() => {
    if (portfolioSummary?.totalEquity) {
      return Number(portfolioSummary.totalEquity);
    }
    if (activeAccount?.cashBalance) {
      return Number(activeAccount.cashBalance);
    }
    return 100000; // fallback
  }, [portfolioSummary, activeAccount]);

  const estimatedTotal = useMemo(() => {
    const price = orderType === 'MARKET' ? lastPrice : (parseFloat(limitPrice) || lastPrice);
    return price * quantity;
  }, [orderType, lastPrice, limitPrice, quantity]);

  const commission = useMemo(() => Math.max(1.00, quantity * 0.005), [quantity]);

  const portfolioImpactPct = useMemo(() => {
    return totalEquity > 0 ? (estimatedTotal / totalEquity) * 100 : 0;
  }, [estimatedTotal, totalEquity]);

  const adjustQty = (delta) => setQuantity((prev) => Math.max(1, prev + delta));

  const handleOpenConfirm = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!activeAccount) {
      setErrorMessage('No active paper-trading account selected.');
      return;
    }

    const orderData = {
      accountId: activeAccount.id,
      symbol,
      side,
      orderType,
      quantity,
      limitPrice: limitPrice ? parseFloat(limitPrice) : null,
      stopPrice: stopPrice ? parseFloat(stopPrice) : null,
      timeInForce: 'DAY',
      stopLoss: attachBracket && stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: attachBracket && takeProfit ? parseFloat(takeProfit) : null,
    };

    try {
      const res = await placeOrder(orderData);
      setSuccessMessage('Order placed successfully!');
      
      // Clear fields
      setLimitPrice('');
      setStopPrice('');
      setStopLoss('');
      setTakeProfit('');
      setAttachBracket(false);
      setIsConfirmOpen(false);

      // Trigger accounts & portfolio refresh
      useAccountStore.getState().fetchAccounts();
      if (activeAccount) {
        usePortfolioStore.getState().fetchPortfolio(activeAccount.id);
      }
      
      // Auto fade success message
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Order execution failed.');
    }
  };

  return (
    <div className={styles.ticket}>
      {/* Messages */}
      {successMessage && <div className={styles.successBanner}>✅ {successMessage}</div>}
      {errorMessage && <div className={styles.errorBanner}>❌ {errorMessage}</div>}

      {/* Pre-trade Risk Warnings Banner (Reactive UI) */}
      {side === 'BUY' && portfolioImpactPct > 25 && (
        <div className={styles.warningBanner}>
          ⚠️ Warning: Position size represents {portfolioImpactPct.toFixed(1)}% of your portfolio equity (Max recommended: 25.0%).
        </div>
      )}

      {side === 'BUY' && !attachBracket && (
        <div className={styles.infoBanner}>
          💡 Tip: Attach a Stop Loss to define and limit your downside risk.
        </div>
      )}

      {/* Buy/Sell Toggle */}
      <div className={styles.sideTabs}>
        <button
          className={`${styles.sideTab} ${styles.buy} ${side === 'BUY' ? styles.activeBuy : ''}`}
          onClick={() => setSide('BUY')}
        >
          BUY
        </button>
        <button
          className={`${styles.sideTab} ${styles.sell} ${side === 'SELL' ? styles.activeSell : ''}`}
          onClick={() => setSide('SELL')}
        >
          SELL
        </button>
      </div>

      {/* Order Type */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Order Type</span>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          {ORDER_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Quantity</span>
        <div className={styles.qtyControl}>
          <button className={styles.qtyBtn} onClick={() => adjustQty(-10)}>−</button>
          <input
            className={styles.qtyInput}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
          />
          <button className={styles.qtyBtn} onClick={() => adjustQty(10)}>+</button>
        </div>
      </div>

      {/* Limit Price */}
      {(orderType === 'LIMIT' || orderType === 'STOP_LIMIT') && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Limit Price</span>
          <input
            type="number"
            step="0.01"
            placeholder={lastPrice?.toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
          />
        </div>
      )}

      {/* Stop Price */}
      {(orderType === 'STOP' || orderType === 'STOP_LIMIT') && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Stop Price</span>
          <input
            type="number"
            step="0.01"
            placeholder={lastPrice?.toFixed(2)}
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
          />
        </div>
      )}

      {/* Bracket Orders (SL/TP) */}
      <div className={styles.bracketToggle}>
        <label>
          <input
            type="checkbox"
            checked={attachBracket}
            onChange={(e) => setAttachBracket(e.target.checked)}
          />
          Attach Bracket (SL / TP)
        </label>
      </div>

      {attachBracket && (
        <div className={styles.bracketInputs}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Stop Loss</span>
            <input
              type="number"
              step="0.01"
              placeholder="Trigger Price"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Take Profit</span>
            <input
              type="number"
              step="0.01"
              placeholder="Target Price"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Estimate */}
      <div className={styles.estimate}>
        <span className={styles.estimateLabel}>Est. Total</span>
        <span className={styles.estimateValue}>{formatCurrency(estimatedTotal)}</span>
      </div>
      <div className={styles.estimate}>
        <span className={styles.estimateLabel}>Commission</span>
        <span className={styles.estimateValue}>{formatCurrency(commission)}</span>
      </div>

      {/* Submit */}
      <button
        className={`${styles.submitBtn} ${side === 'BUY' ? styles.submitBuy : styles.submitSell}`}
        onClick={handleOpenConfirm}
        disabled={quantity <= 0}
      >
        {side} {quantity} {symbol} — {orderType === 'MARKET' ? 'at Market' : `@ ${formatCurrency(parseFloat(limitPrice) || lastPrice)}`}
      </button>

      {/* Confirmation Modal */}
      <OrderConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmOrder}
        orderDetails={{
          symbol,
          side,
          orderType,
          quantity,
          price: orderType === 'MARKET' ? null : parseFloat(limitPrice),
          estimatedTotal,
          commission,
        }}
      />
    </div>
  );
}
