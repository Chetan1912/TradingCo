import api from './axios';

export const authApi = {
  register: (email, password, displayName, experienceLevel = 'BEGINNER', initialBalance = 100000) =>
    api.post('/api/v1/auth/register', { email, password, displayName, experienceLevel, initialBalance }),

  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),

  refreshToken: (refreshToken) =>
    api.post('/api/v1/auth/refresh', { refreshToken }),

  getProfile: () =>
    api.get('/api/v1/auth/me'),

  updateProfile: (data) =>
    api.put('/api/v1/auth/me', data),
};
