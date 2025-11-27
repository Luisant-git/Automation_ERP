import apiClient from '../apiService';

export const employeeAPI = {
  getAll: () => apiClient.get('/employees'),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.patch(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};