import { apiClient } from '../http.js';

export async function getFilteredReport(params) {
  const response = await apiClient.get('/reports/filtered', { params });
  return response.data;
}
