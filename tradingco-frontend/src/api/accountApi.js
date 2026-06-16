import api from './axios';

export const accountApi = {
  getAccounts: () =>
    api.get('/api/v1/accounts'),

  createAccount: (name, initialBalance) =>
    api.post('/api/v1/accounts', { name, initialBalance }),

  getAccount: (id) =>
    api.get(`/api/v1/accounts/${id}`),

  resetAccount: (id) =>
    api.post(`/api/v1/accounts/${id}/reset`),
};
