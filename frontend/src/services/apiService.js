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

// Master APIs
export {
  ledgerAPI,
  openingStockAPI,
  taxRateAPI,
  brandAPI,
  categoryAPI,
  materialAPI,
  employeeAPI,
  customerAPI,
  supplierAPI
} from './master';

// Transaction APIs
export {
  quotationAPI,
  purchaseOrderAPI,
  purchaseEntryAPI,
  purchaseOrderEntryAPI,
  purchaseReturnAPI
} from './transaction';





export default apiClient;
