import { apiClient } from '../http.js';

export async function getManualDocuments(params = {}) {
  const response = await apiClient.post('/manual-documents/list', params);
  return response.data;
}

export async function createManualDocument({ documentDetails, note, images, branchId }) {
  const formData = new FormData();
  formData.append('documentDetails', documentDetails);
  formData.append('note', note || '');
  if (!branchId || !/^[a-f\d]{24}$/i.test(branchId)) {
    throw new Error('لطفاً ابتدا یک شعبه معتبر از بالای صفحه انتخاب کنید.');
  }
  for (const image of images) formData.append('images', image);
  const response = await apiClient.post('/manual-documents', formData, {
    params: { branchId: String(branchId).trim() },
  });
  return response.data;
}

export async function deleteManualDocument(id, params = {}) {
  const { branchId, ...query } = params;
  const response = await apiClient.delete(`/manual-documents/${encodeURIComponent(id)}`, {
    params: { ...query, ...(branchId ? { branchId } : {}) },
  });
  return response.data;
}

export function getManualDocumentImageUrl(url) {
  const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
  return `${baseURL.replace(/\/api\/v1$/, '')}${url}`;
}

export async function getManualDocumentImage(url) {
  const apiPath = url.replace(/^\/api\/v1/, '');
  const response = await apiClient.get(apiPath, { responseType: 'blob' });
  return URL.createObjectURL(response.data);
}
