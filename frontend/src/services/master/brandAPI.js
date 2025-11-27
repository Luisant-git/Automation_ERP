import apiClient from '../apiService';

export const brandAPI = {
  getAll: () => apiClient.get('/brand'),
  getDropdownList: () => apiClient.get('/brand/dropdown/list'),
  getById: (id) => apiClient.get(`/brand/${id}`),
  create: (data) => apiClient.post('/brand', data),
  update: (id, data) => apiClient.patch(`/brand/${id}`, data),
  delete: (id) => apiClient.delete(`/brand/${id}`),
};