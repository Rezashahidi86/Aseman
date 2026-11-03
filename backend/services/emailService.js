import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const getProviderErrorMessage = async (response) => {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data?.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }
    if (typeof data?.name === 'string' && data.name.trim()) {
      return data.name.trim();
    }
  } catch {
    return response.statusText || 'Unknown email provider error';
  }

  return response.statusText || 'Unknown email provider error';
};

export const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new AppError('Password recovery email is not configured', 503);
  }

  let response;

  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email],
        subject: 'بازیابی رمز عبور حساب آسمان',
        html: `<!doctype html><html lang="fa" dir="rtl"><body style="font-family:Arial,sans-serif;line-height:2;color:#0f172a"><h2>بازیابی رمز عبور</h2><p>برای تعیین رمز عبور جدید روی لینک زیر کلیک کنید. این لینک فقط ۱۵ دقیقه اعتبار دارد و یک‌بار قابل استفاده است.</p><p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">تعیین رمز عبور جدید</a></p><p>اگر این درخواست را شما ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.</p></body></html>`,
        text: `برای تعیین رمز عبور جدید وارد این لینک شوید: ${resetUrl}\nاین لینک تا ۱۵ دقیقه معتبر است.`,
      }),
    });
  } catch (error) {
    throw new AppError(
      `Email provider request failed: ${error.message || 'Network error'}`,
      502,
    );
  }

  if (!response.ok) {
    const providerMessage = await getProviderErrorMessage(response);
    throw new AppError(
      `Email provider rejected the request (${response.status}): ${providerMessage}`,
      502,
    );
  }
};
