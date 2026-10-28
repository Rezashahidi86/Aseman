import { apiClient } from '../http.js';

export async function getCustomers(params) {
  const response = await apiClient.get('/customers', { params });
  return response.data;
}

export async function createCustomer(payload) {
  const response = await apiClient.post('/customers', payload);
  return response.data;
}

export async function updateCustomer(id, payload, params = {}) {
  const response = await apiClient.patch(`/customers/${encodeURIComponent(id)}`, payload, { params });
  return response.data;
}

export async function deleteCustomer(id, params = {}) {
  const response = await apiClient.delete(`/customers/${encodeURIComponent(id)}`, { params });
  return response.data;
}
