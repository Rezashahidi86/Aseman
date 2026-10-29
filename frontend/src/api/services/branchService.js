import { apiClient } from '../http.js';

export async function getBranches() {
  const response = await apiClient.get('/branches');
  return response.data;
}

export async function createBranch(payload) {
  const response = await apiClient.post('/branches', payload);
  return response.data;
}

export async function updateBranchStatus(branchId, isActive) {
  const response = await apiClient.patch(`/branches/${encodeURIComponent(branchId)}/status`, { isActive });
  return response.data;
}

export async function selectBranch(branchId) {
  const response = await apiClient.post('/branches/select', { branchId });
  return response.data;
}
