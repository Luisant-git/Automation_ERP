import apiClient from '../apiService';

export const projectAssignmentAPI = {
  getAll: () => apiClient.get('/project-assignments'),
  getById: (id) => apiClient.get(`/project-assignments/${id}`),
  create: (data) => apiClient.post('/project-assignments', data),
  update: (id, data) => apiClient.put(`/project-assignments/${id}`, data),
  delete: (id) => apiClient.delete(`/project-assignments/${id}`)
};
