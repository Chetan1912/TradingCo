import api from './axios';

export const alertApi = {
  getAlerts: () =>
    api.get('/api/v1/alerts'),

  createAlert: (alertData) =>
    api.post('/api/v1/alerts', alertData),

  toggleAlert: (id, active) =>
    api.put(`/api/v1/alerts/${id}`, null, { params: { active } }),

  deleteAlert: (id) =>
    api.delete(`/api/v1/alerts/${id}`),
};
