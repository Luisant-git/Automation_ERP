import apiClient from '../apiService';

export const materialAPI = {
  getAll: () => apiClient.get('/material'),
  getById: (id) => apiClient.get(`/material/${id}`),
  create: (data) => apiClient.post('/material', data),
  update: (id, data) => apiClient.patch(`/material/${id}`, data),
  delete: (id) => apiClient.delete(`/material/${id}`),
  search: (query) => apiClient.get(`/material/search?q=${encodeURIComponent(query)}`),
};