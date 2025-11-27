import apiClient from '../apiService';

export const purchaseReturnAPI = {
  getAll: () => apiClient.get('/purchase-returns'),
  getById: (id) => apiClient.get(`/purchase-returns/${id}`),
  create: (data) => apiClient.post('/purchase-returns', data),
  update: (id, data) => apiClient.patch(`/purchase-returns/${id}`, data),
  delete: (id) => apiClient.delete(`/purchase-returns/${id}`),
};