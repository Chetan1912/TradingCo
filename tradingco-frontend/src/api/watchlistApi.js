import api from './axios';

export const watchlistApi = {
  getWatchlists: () =>
    api.get('/api/v1/watchlists'),

  createWatchlist: (name) =>
    api.post('/api/v1/watchlists', { name }),

  getWatchlist: (id) =>
    api.get(`/api/v1/watchlists/${id}`),

  deleteWatchlist: (id) =>
    api.delete(`/api/v1/watchlists/${id}`),

  addSymbol: (watchlistId, symbol) =>
    api.post(`/api/v1/watchlists/${watchlistId}/symbols`, { symbol }),

  removeSymbol: (watchlistId, symbol) =>
    api.delete(`/api/v1/watchlists/${watchlistId}/symbols/${symbol}`),
};
