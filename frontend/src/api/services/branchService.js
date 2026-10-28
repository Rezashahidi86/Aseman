import { apiClient } from '../http.js';

export async function getBranches() {
  const response = await apiClient.get('/branches');
  return response.data;
}

export async function selectBranch(branchId) {
  const response = await apiClient.post('/branches/select', { branchId });
  return response.data;
}
