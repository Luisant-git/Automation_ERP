import apiClient from '../apiService';

export const openingStockAPI = {
  getAll: () => apiClient.get('/opening-stock'),
  getById: (id) => apiClient.get(`/opening-stock/${id}`),
  create: (data) => apiClient.post('/opening-stock', data),
  update: (id, data) => apiClient.patch(`/opening-stock/${id}`, data),
  delete: (id) => apiClient.delete(`/opening-stock/${id}`),
};