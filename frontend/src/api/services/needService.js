import { apiClient } from '../http.js';

export async function getNeeds(params) {
  const response = await apiClient.get('/needs', { params });
  return response.data;
}

export async function createNeed(payload) {
  const response = await apiClient.post('/needs', payload);
  return response.data;
}

export async function confirmNeed(id, params = {}) {
  const response = await apiClient.post(`/needs/${encodeURIComponent(id)}/confirm`, {}, { params });
  return response.data;
}
