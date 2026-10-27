import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'aseman_access_token';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const payload = error.response.data;
      const message = payload?.message || payload?.error || 'درخواست با خطا مواجه شد.';

      return Promise.reject(Object.assign(new Error(message), {
        status: error.response.status,
        details: payload,
        code: error.code,
      }));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('زمان انتظار برای پاسخ سرور تمام شد.'));
    }

    if (error.request) {
      return Promise.reject(new Error('ارتباط با سرور برقرار نشد. اتصال و آدرس API را بررسی کنید.'));
    }

    return Promise.reject(error);
  },
);

export function getApiBaseUrl() {
  return baseURL;
}
