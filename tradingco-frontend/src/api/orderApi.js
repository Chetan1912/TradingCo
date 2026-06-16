import api from './axios';

export const orderApi = {
  placeOrder: (orderData) =>
    api.post('/api/v1/orders', orderData),

  getOrders: (accountId, filters = {}) =>
    api.get('/api/v1/orders', { params: { accountId, ...filters } }),

  getOrder: (orderId) =>
    api.get(`/api/v1/orders/${orderId}`),

  cancelOrder: (orderId) =>
    api.put(`/api/v1/orders/${orderId}/cancel`),
};
