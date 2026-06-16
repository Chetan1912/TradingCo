import api from './axios';

export const newsApi = {
  getNews: (symbol, limit = 20) =>
    api.get('/api/v1/news', { params: { symbol, limit } }),

  getTrendingNews: () =>
    api.get('/api/v1/news/trending'),
};
