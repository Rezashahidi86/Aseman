import { apiClient } from '../http.js';

export async function getCurrentUser(token) {
  const response = await apiClient.get('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}

export async function loginRequest(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function logoutRequest(token) {
  const response = await apiClient.post('/auth/logout', null, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}
