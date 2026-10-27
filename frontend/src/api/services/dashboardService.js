import { apiClient } from '../http.js';

export async function getAllBranchesReport(token) {
  const response = await apiClient.get('/reports/all-branches', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}

export async function getProducts(params, token) {
  const response = await apiClient.get('/products', {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}

export async function getBranch(branchId, token) {
  const response = await apiClient.get(`/branches/${encodeURIComponent(branchId)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response.data;
}
