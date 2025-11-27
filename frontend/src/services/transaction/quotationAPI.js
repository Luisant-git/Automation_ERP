import apiClient from '../apiService';

export const quotationAPI = {
  getAll: () => apiClient.get('/quotations'),
  getById: (id) => apiClient.get(`/quotations/${id}`),
  create: (data) => apiClient.post('/quotations', data),
  update: (id, data) => apiClient.patch(`/quotations/${id}`, data),
  delete: (id) => apiClient.delete(`/quotations/${id}`),
};