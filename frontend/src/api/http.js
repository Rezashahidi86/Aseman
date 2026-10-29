import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

const localizedMessages = [
  [/only jpeg,\s*png and webp images are allowed/i, 'فرمت تصویر انتخاب‌شده پشتیبانی نمی‌شود. فقط تصاویر با فرمت JPG، JPEG، PNG یا WebP مجاز هستند.'],
  [/invalid credentials|Invalid email or password|wrong password/i, 'ایمیل یا رمز عبور نادرست است.'],
  [/user not found|no user found/i, 'کاربری با این مشخصات پیدا نشد.'],
  [/email already exists|duplicate key.*email|email.*already/i, 'این ایمیل قبلاً ثبت شده است.'],
  [/invalid token|jwt malformed|jwt expired|token expired/i, 'اعتبار نشست شما به پایان رسیده است؛ دوباره وارد شوید.'],
  [/not authorized|unauthorized|authentication required/i, 'برای انجام این عملیات باید وارد حساب کاربری شوید.'],
  [/forbidden|permission denied|not allowed/i, 'شما اجازه انجام این عملیات را ندارید.'],
  [/not found/i, 'اطلاعات درخواستی پیدا نشد.'],
  [/validation failed|validation error|invalid input/i, 'اطلاعات واردشده معتبر نیست؛ فیلدها را بررسی کنید.'],
  [/duplicate key|already exists/i, 'این اطلاعات قبلاً ثبت شده است.'],
  [/cast to objectid failed|invalid objectid/i, 'شناسه ارسالی معتبر نیست.'],
  [/network error|failed to fetch/i, 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.'],
  [/insufficient stock|not enough stock|stock.*insufficient|quantity.*available/i, 'موجودی کالا برای تعداد درخواستی کافی نیست. موجودی سبد را به‌روزرسانی کنید.'],
];

function getLocalizedApiMessage(message, status, payload) {
  const rawMessage = Array.isArray(message) ? message.join('، ') : String(message || '');
  const matched = localizedMessages.find(([pattern]) => pattern.test(rawMessage));

  if (matched) return matched[1];
  if (rawMessage && !/[A-Za-z]{3}/.test(rawMessage)) return rawMessage;

  const validationMessages = payload?.errors?.map?.((item) => item?.message).filter(Boolean) || [];
  if (validationMessages.length && validationMessages.every((item) => !/[A-Za-z]{3}/.test(item))) {
    return validationMessages.join('، ');
  }

  const statusMessages = {
    400: 'درخواست یا اطلاعات ارسالی معتبر نیست.',
    401: 'برای ادامه باید دوباره وارد حساب کاربری شوید.',
    403: 'شما اجازه انجام این عملیات را ندارید.',
    404: 'اطلاعات یا مسیر درخواستی پیدا نشد.',
    409: 'این عملیات با اطلاعات فعلی تداخل دارد؛ اطلاعات را بررسی کنید.',
    413: 'حجم اطلاعات ارسالی بیش از حد مجاز است.',
    422: 'اطلاعات واردشده قابل پردازش نیست.',
    429: 'تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید.',
    500: 'خطای داخلی سرور رخ داد. لطفاً بعداً دوباره تلاش کنید.',
    502: 'پاسخی معتبر از سرور دریافت نشد.',
    503: 'سرویس فعلاً در دسترس نیست. کمی بعد دوباره تلاش کنید.',
  };

  return statusMessages[status] || 'انجام درخواست ناموفق بود. لطفاً دوباره تلاش کنید.';
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('aseman:request-start'));
    config._asemanLoading = true;
  }
  if (config.data && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.config?._asemanLoading && typeof window !== 'undefined') window.dispatchEvent(new Event('aseman:request-finish'));
    return response;
  },
  (error) => {
    if (error.config?._asemanLoading && typeof window !== 'undefined') window.dispatchEvent(new Event('aseman:request-finish'));
    if (error.response) {
      const payload = error.response.data;
      const message = getLocalizedApiMessage(
        payload?.message || payload?.error,
        error.response.status,
        payload,
      );

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
