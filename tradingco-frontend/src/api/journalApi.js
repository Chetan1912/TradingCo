import api from './axios';

export const journalApi = {
  getEntries: (accountId) =>
    api.get(`/api/v1/journal/${accountId}`),

  getEntry: (accountId, id) =>
    api.get(`/api/v1/journal/${accountId}/${id}`),

  createEntry: (accountId, entryData) =>
    api.post(`/api/v1/journal/${accountId}`, entryData),

  updateEntry: (accountId, id, entryData) =>
    api.put(`/api/v1/journal/${accountId}/${id}`, entryData),

  deleteEntry: (accountId, id) =>
    api.delete(`/api/v1/journal/${accountId}/${id}`),
};
