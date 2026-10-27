const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const { token, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers || {});

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError('ارتباط با سرور برقرار نشد. اتصال و آدرس API را بررسی کنید.');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'درخواست با خطا مواجه شد.';
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
