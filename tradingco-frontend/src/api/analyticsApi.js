import api from './axios';

export const analyticsApi = {
  getSummary: (accountId, period = '30D') =>
    api.get(`/api/v1/analytics/${accountId}/summary`, { params: { period } }),

  getEquityCurve: (accountId) =>
    api.get(`/api/v1/analytics/${accountId}/equity-curve`),

  getDrawdown: (accountId) =>
    api.get(`/api/v1/analytics/${accountId}/drawdown`),
};
