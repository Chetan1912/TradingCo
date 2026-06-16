import api from './axios';

export const marketApi = {
  getQuote: (symbol) =>
    api.get(`/api/v1/quotes/${symbol}`),

  getBatchQuotes: (symbols) =>
    api.get('/api/v1/quotes/batch', { params: { symbols: symbols.join(',') } }),

  getCandles: (symbol, timeframe, from, to) =>
    api.get(`/api/v1/candles/${symbol}`, { params: { tf: timeframe, from, to } }),

  getAsset: (symbol) =>
    api.get(`/api/v1/assets/${symbol}`),

  getAssets: (params) =>
    api.get('/api/v1/assets', { params }),

  searchAssets: (query) =>
    api.get('/api/v1/assets/search', { params: { q: query } }),
};
