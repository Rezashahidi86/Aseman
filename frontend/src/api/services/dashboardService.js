import { apiClient } from '../http.js';

export async function getAllBranchesReport() {
  const response = await apiClient.get('/reports/all-branches');
  return response.data;
}

export async function getProducts(params) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function getBranch(branchId) {
  const response = await apiClient.get(`/branches/${encodeURIComponent(branchId)}`);
  return response.data;
}
