import { apiClient } from '../http.js';

export async function getCustomers(params) {
  const response = await apiClient.get('/customers', { params });
  return response.data;
}

export async function createCustomer(payload) {
  const response = await apiClient.post('/customers', payload);
  return response.data;
}

export async function updateCustomer(id, payload) {
  const response = await apiClient.patch(`/customers/${encodeURIComponent(id)}`, payload);
  return response.data;
}

export async function deleteCustomer(id) {
  const response = await apiClient.delete(`/customers/${encodeURIComponent(id)}`);
  return response.data;
}
