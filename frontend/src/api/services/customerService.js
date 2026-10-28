import { apiClient } from '../http.js';

export async function getCustomers(params) {
  const response = await apiClient.get('/customers', { params });
  return response.data;
}

export async function getCustomerSmsSettings(params = {}) {
  const response = await apiClient.get('/customers/sms-settings', { params });
  return response.data;
}

export async function updateCustomerSmsSettings(payload, params = {}) {
  const response = await apiClient.put('/customers/sms-settings', payload, { params });
  return response.data;
}

export async function sendCustomerSms(id, payload, params = {}) {
  const response = await apiClient.post(`/customers/${encodeURIComponent(id)}/sms`, payload, { params });
  return response.data;
}

export async function createCustomer(payload, params = {}) {
  const response = await apiClient.post('/customers', payload, { params });
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
