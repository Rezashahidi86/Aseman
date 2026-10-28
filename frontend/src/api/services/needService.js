import { apiClient } from '../http.js';

export async function getNeeds(params) {
  const response = await apiClient.get('/needs', { params });
  return response.data;
}

export async function createNeed(payload) {
  const response = await apiClient.post('/needs', payload);
  return response.data;
}

export async function deleteNeed(id, params = {}) {
  const response = await apiClient.delete(`/needs/${encodeURIComponent(id)}`, { params });
  return response.data;
}
