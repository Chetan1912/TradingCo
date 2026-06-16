import { useEffect, useRef } from 'react';
import useMarketStore from '../store/useMarketStore';

/**
 * Subscribe to live price updates for a list of symbols.
 * Updates the market store on each tick.
 */
export default function usePriceSubscription(symbols, wsHook) {
  const updateQuote = useMarketStore((s) => s.updateQuote);
  const unsubsRef = useRef([]);

  useEffect(() => {
    if (!wsHook?.connected || !symbols?.length) return;

    // Clean previous subscriptions
    unsubsRef.current.forEach((unsub) => unsub());
    unsubsRef.current = [];

    symbols.forEach((symbol) => {
      const unsub = wsHook.subscribe(`/topic/prices/${symbol}`, (tick) => {
        updateQuote(symbol, {
          last_price: tick.last,
          bid: tick.bid,
          ask: tick.ask,
          change_amount: tick.change,
          change_percent: tick.changePct,
          volume: tick.volume,
          day_high: tick.dayHigh,
          day_low: tick.dayLow,
        });
      });
      unsubsRef.current.push(unsub);
    });

    return () => {
      unsubsRef.current.forEach((unsub) => unsub());
      unsubsRef.current = [];
    };
  }, [symbols, wsHook?.connected, updateQuote, wsHook]);
}
