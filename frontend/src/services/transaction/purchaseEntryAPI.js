import apiClient from '../apiService';

export const purchaseEntryAPI = {
  getAll: () => apiClient.get('/purchase-entries'),
  getById: (id) => apiClient.get(`/purchase-entries/${id}`),
  create: (data) => apiClient.post('/purchase-entries', data),
  update: (id, data) => apiClient.patch(`/purchase-entries/${id}`, data),
  delete: (id) => apiClient.delete(`/purchase-entries/${id}`),
};

// Alias for backward compatibility
export const purchaseOrderEntryAPI = purchaseEntryAPI;