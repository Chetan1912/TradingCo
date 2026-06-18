import { useMemo } from 'react';
import useMarketStore from '../../../store/useMarketStore';
import { formatCurrency } from '../../../utils/formatters';
import styles from './OrderBook.module.css';

// Pseudo-random generator with seed
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export default function OrderBook({ symbol = 'AAPL' }) {
  const quote = useMarketStore((s) => s.quotes[symbol]);
  
  const orderBookData = useMemo(() => {
    if (!quote || !quote.last_price) return { asks: [], bids: [], spread: 0 };
    
    const price = quote.last_price;
    // Use the integer part of the price + string to seed deterministic RNG so it looks stable but moves with price
    const seedStr = symbol + Math.floor(price * 10);
    const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = mulberry32(seed);
    
    const spreadAmount = price * 0.0005; // 0.05% spread
    const midPrice = price;
    
    const asks = [];
    const bids = [];
    
    let currentAsk = midPrice + (spreadAmount / 2);
    let currentBid = midPrice - (spreadAmount / 2);
    
    let maxVolume = 0;
    
    // Generate 15 levels
    for (let i = 0; i < 15; i++) {
      const askVol = Math.floor(rng() * 500) + 50;
      const bidVol = Math.floor(rng() * 500) + 50;
      
      maxVolume = Math.max(maxVolume, askVol, bidVol);
      
      asks.unshift({ price: currentAsk, volume: askVol });
      bids.push({ price: currentBid, volume: bidVol });
      
      currentAsk += (rng() * 0.001 * price);
      currentBid -= (rng() * 0.001 * price);
    }
    
    // Add cumulative totals
    let askCum = 0;
    for (let i = asks.length - 1; i >= 0; i--) {
      askCum += asks[i].volume;
      asks[i].total = askCum;
      asks[i].depthPct = (asks[i].volume / maxVolume) * 100;
    }
    
    let bidCum = 0;
    for (let i = 0; i < bids.length; i++) {
      bidCum += bids[i].volume;
      bids[i].total = bidCum;
      bids[i].depthPct = (bids[i].volume / maxVolume) * 100;
    }
    
    return { asks, bids, spread: (asks[asks.length-1]?.price || 0) - (bids[0]?.price || 0) };
  }, [quote, symbol]);
  
  if (!quote) return <div className={styles.container}>Loading Order Book...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Price (USD)</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      
      <div className={styles.bookArea}>
        <div className={styles.asks}>
          {orderBookData.asks.map((level, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.depthBar} style={{ width: `${level.depthPct}%`, background: 'rgba(248, 81, 73, 0.15)' }} />
              <span className={styles.askPrice}>{formatCurrency(level.price)}</span>
              <span>{level.volume}</span>
              <span>{level.total}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.spread}>
          <span className={styles.currentPrice}>{formatCurrency(quote.last_price)}</span>
          <span className={styles.spreadValue}>Spread {formatCurrency(orderBookData.spread)}</span>
        </div>
        
        <div className={styles.bids}>
          {orderBookData.bids.map((level, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.depthBar} style={{ width: `${level.depthPct}%`, background: 'rgba(63, 185, 80, 0.15)' }} />
              <span className={styles.bidPrice}>{formatCurrency(level.price)}</span>
              <span>{level.volume}</span>
              <span>{level.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
