import apiClient from '../apiService';

export const taxRateAPI = {
  getAll: () => apiClient.get('/tax-rate'),
  getDropdownList: () => apiClient.get('/tax-rate/dropdown/list'),
  getById: (id) => apiClient.get(`/tax-rate/${id}`),
  create: (data) => apiClient.post('/tax-rate', data),
  update: (id, data) => apiClient.patch(`/tax-rate/${id}`, data),
  delete: (id) => apiClient.delete(`/tax-rate/${id}`),
};