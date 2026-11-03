import { apiClient } from '../http.js';

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function loginRequest(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function logoutRequest() {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

export async function requestPasswordReset(email) {
  const response = await apiClient.post('/auth/password/forgot', { email });
  return response.data;
}

export async function resetPassword(payload) {
  const response = await apiClient.post('/auth/password/reset', payload);
  return response.data;
}

export async function updateCredentials(payload) {
  const response = await apiClient.patch('/auth/credentials', payload);
  return response.data;
}
