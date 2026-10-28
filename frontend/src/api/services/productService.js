import { apiClient } from '../http.js';

export async function getProducts(params) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function createProduct(product) {
  const response = await apiClient.post('/products', product);
  return response.data;
}

export async function updateProduct(productId, product, branchId) {
  const response = await apiClient.patch(`/products/${encodeURIComponent(productId)}`, product, {
    params: branchId ? { branchId } : undefined,
  });
  return response.data;
}

export async function deleteProduct(productId, branchId) {
  const response = await apiClient.delete(`/products/${encodeURIComponent(productId)}`, {
    params: branchId ? { branchId } : undefined,
  });
  return response.data;
}
