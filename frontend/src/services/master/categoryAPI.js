import apiClient from '../apiService';

export const categoryAPI = {
  getAll: () => apiClient.get('/category'),
  getDropdownList: () => apiClient.get('/category/dropdown/list'),
  getById: (id) => apiClient.get(`/category/${id}`),
  create: (data) => apiClient.post('/category', data),
  update: (id, data) => apiClient.patch(`/category/${id}`, data),
  delete: (id) => apiClient.delete(`/category/${id}`),
};