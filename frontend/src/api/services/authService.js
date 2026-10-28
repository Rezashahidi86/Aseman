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
