import { apiClient } from '../http.js';

export async function registerSale(sale, idempotencyKey) {
  const response = await apiClient.post('/sales', sale, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return response.data;
}
