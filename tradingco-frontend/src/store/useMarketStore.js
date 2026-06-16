import { create } from 'zustand';

const useMarketStore = create((set, get) => ({
  quotes: {},
  subscribedSymbols: new Set(),

  updateQuote: (symbol, quoteData) => {
    set((state) => ({
      quotes: {
        ...state.quotes,
        [symbol]: {
          ...state.quotes[symbol],
          ...quoteData,
          prevLast: state.quotes[symbol]?.last_price || quoteData.last_price,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  setBatchQuotes: (quotesArray) => {
    const quotesMap = {};
    quotesArray.forEach((q) => {
      quotesMap[q.symbol] = { ...q, updatedAt: Date.now() };
    });
    set((state) => ({ quotes: { ...state.quotes, ...quotesMap } }));
  },

  getQuote: (symbol) => get().quotes[symbol] || null,

  subscribeToSymbol: (symbol) => {
    set((state) => {
      const next = new Set(state.subscribedSymbols);
      next.add(symbol);
      return { subscribedSymbols: next };
    });
  },

  unsubscribeFromSymbol: (symbol) => {
    set((state) => {
      const next = new Set(state.subscribedSymbols);
      next.delete(symbol);
      return { subscribedSymbols: next };
    });
  },
}));

export default useMarketStore;
