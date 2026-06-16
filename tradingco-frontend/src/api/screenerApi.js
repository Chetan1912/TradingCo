import api from './axios';

export const screenerApi = {
  getGainers: (limit = 10) =>
    api.get('/api/v1/screener/gainers', { params: { limit } }),

  getLosers: (limit = 10) =>
    api.get('/api/v1/screener/losers', { params: { limit } }),

  getActive: (limit = 10) =>
    api.get('/api/v1/screener/active', { params: { limit } }),
};
