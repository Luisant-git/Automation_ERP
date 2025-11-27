import apiClient from '../apiService';

export const ledgerAPI = {
  getAll: () => apiClient.get('/ledger'),
  getById: (id) => apiClient.get(`/ledger/${id}`),
  create: (data) => apiClient.post('/ledger', data),
  update: (id, data) => apiClient.patch(`/ledger/${id}`, data),
  delete: (id) => apiClient.delete(`/ledger/${id}`),
};