import { apiClient } from '../http.js';

export async function getNeeds(params) {
  const response = await apiClient.get('/needs', { params });
  return response.data;
}

export async function createNeed(payload) {
  const response = await apiClient.post('/needs', payload);
  return response.data;
}

export async function updateNeedStatus(id, status, params = {}) {
  const response = await apiClient.patch(`/needs/${encodeURIComponent(id)}/status`, { status }, { params });
  return response.data;
}
