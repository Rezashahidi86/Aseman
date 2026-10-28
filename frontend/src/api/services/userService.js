import { apiClient } from '../http.js';

export async function getUsers() {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function createSeller(payload) {
  const response = await apiClient.post('/users', payload);
  return response.data;
}

export async function deactivateUser(userId) {
  const response = await apiClient.patch(`/users/${encodeURIComponent(userId)}/deactivate`);
  return response.data;
}

export async function activateUser(userId) {
  const response = await apiClient.patch(`/users/${encodeURIComponent(userId)}`, {
    isActive: true,
  });
  return response.data;
}
