import { apiClient } from '../http.js';

const endpoint = '/reference-Catalog';

export async function getReferenceCatalog(params) {
  const response = await apiClient.get(endpoint, { params });
  return response.data;
}

export async function createReferenceItem(payload) {
  const response = await apiClient.post(endpoint, payload);
  return response.data;
}

export async function updateReferenceItem(id, payload) {
  const response = await apiClient.patch(`${endpoint}/${encodeURIComponent(id)}`, payload);
  return response.data;
}

export async function deleteReferenceItem(id) {
  const response = await apiClient.delete(`${endpoint}/${encodeURIComponent(id)}`);
  return response.data;
}
