import api from './axios';

export const portfolioApi = {
  getPortfolio: (accountId) =>
    api.get(`/api/v1/portfolio/${accountId}`),

  getPositions: (accountId) =>
    api.get(`/api/v1/portfolio/${accountId}/positions`),

  getTradeHistory: (accountId, filters = {}) =>
    api.get(`/api/v1/portfolio/${accountId}/history`, { params: filters }),

  getPnl: (accountId) =>
    api.get(`/api/v1/portfolio/${accountId}/pnl`),
};
