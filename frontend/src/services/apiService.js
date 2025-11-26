import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4011';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Loading state manager
export const useApiLoading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithLoading = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, executeWithLoading };
};

// Request interceptor for loading
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Ledgers
export const ledgerAPI = {
  getAll: () => apiClient.get('/ledger'),
  getById: (id) => apiClient.get(`/ledger/${id}`),
  create: (data) => apiClient.post('/ledger', data),
  update: (id, data) => apiClient.patch(`/ledger/${id}`, data),
  delete: (id) => apiClient.delete(`/ledger/${id}`),
};

// Opening Stock
export const openingStockAPI = {
  getAll: () => apiClient.get('/opening-stock'),
  getById: (id) => apiClient.get(`/opening-stock/${id}`),
  create: (data) => apiClient.post('/opening-stock', data),
  update: (id, data) => apiClient.patch(`/opening-stock/${id}`, data),
  delete: (id) => apiClient.delete(`/opening-stock/${id}`),
};

// Tax Rates
export const taxRateAPI = {
  getAll: () => apiClient.get('/tax-rate'),
  getDropdownList: () => apiClient.get('/tax-rate/dropdown/list'),
  getById: (id) => apiClient.get(`/tax-rate/${id}`),
  create: (data) => apiClient.post('/tax-rate', data),
  update: (id, data) => apiClient.patch(`/tax-rate/${id}`, data),
  delete: (id) => apiClient.delete(`/tax-rate/${id}`),
};

// Brands
export const brandAPI = {
  getAll: () => apiClient.get('/brand'),
  getDropdownList: () => apiClient.get('/brand/dropdown/list'),
  getById: (id) => apiClient.get(`/brand/${id}`),
  create: (data) => apiClient.post('/brand', data),
  update: (id, data) => apiClient.patch(`/brand/${id}`, data),
  delete: (id) => apiClient.delete(`/brand/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => apiClient.get('/category'),
  getDropdownList: () => apiClient.get('/category/dropdown/list'),
  getById: (id) => apiClient.get(`/category/${id}`),
  create: (data) => apiClient.post('/category', data),
  update: (id, data) => apiClient.patch(`/category/${id}`, data),
  delete: (id) => apiClient.delete(`/category/${id}`),
};

// Materials
export const materialAPI = {
  getAll: () => apiClient.get('/material'),
  getById: (id) => apiClient.get(`/material/${id}`),
  create: (data) => apiClient.post('/material', data),
  update: (id, data) => apiClient.patch(`/material/${id}`, data),
  delete: (id) => apiClient.delete(`/material/${id}`),
};

// Employees
export const employeeAPI = {
  getAll: () => apiClient.get('/employees'),
  getById: (id) => apiClient.get(`/employees/${id}`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.patch(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

// Customers
export const customerAPI = {
  getAll: () => apiClient.get('/customers'),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.patch(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

// Suppliers
export const supplierAPI = {
  getAll: () => apiClient.get('/suppliers'),
  getById: (id) => apiClient.get(`/suppliers/${id}`),
  create: (data) => apiClient.post('/suppliers', data),
  update: (id, data) => apiClient.patch(`/suppliers/${id}`, data),
  delete: (id) => apiClient.delete(`/suppliers/${id}`),
};

export default apiClient;
