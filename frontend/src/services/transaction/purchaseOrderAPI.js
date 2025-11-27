import apiClient from '../apiService';

export const purchaseOrderAPI = {
  getAll: () => apiClient.get('/purchase-orders'),
  getById: (id) => apiClient.get(`/purchase-orders/${id}`),
  create: (data) => apiClient.post('/purchase-orders', data),
  update: (id, data) => apiClient.patch(`/purchase-orders/${id}`, data),
  delete: (id) => apiClient.delete(`/purchase-orders/${id}`),
};