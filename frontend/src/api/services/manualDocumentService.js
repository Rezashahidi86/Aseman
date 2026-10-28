import { apiClient } from '../http.js';

export async function getManualDocuments(params = {}) {
  const { branchId, ...query } = params;
  const response = await apiClient.get('/manual-documents', {
    params: query,
    headers: branchId ? { 'X-Branch-Id': branchId } : {},
  });
  return response.data;
}

export async function createManualDocument({ documentDetails, note, images, branchId }) {
  const formData = new FormData();
  formData.append('documentDetails', documentDetails);
  formData.append('note', note || '');
  if (branchId) formData.append('branchId', branchId);
  for (const image of images) formData.append('images', image);
  const response = await apiClient.post('/manual-documents', formData, {
    headers: branchId ? { 'X-Branch-Id': branchId } : {},
  });
  return response.data;
}

export async function deleteManualDocument(id, params = {}) {
  const { branchId, ...query } = params;
  const response = await apiClient.delete(`/manual-documents/${encodeURIComponent(id)}`, {
    params: query,
    headers: branchId ? { 'X-Branch-Id': branchId } : {},
  });
  return response.data;
}

export function getManualDocumentImageUrl(url) {
  const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
  return `${baseURL.replace(/\/api\/v1$/, '')}${url}`;
}
