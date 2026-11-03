import env from '../config/env.js';
import AppError from '../utils/AppError.js';

export const sendPasswordResetEmail = async ({ email, resetUrl }) => {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new AppError('Password recovery email is not configured', 503);
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [email],
      subject: 'بازیابی رمز عبور حساب آسمان',
      html: `<!doctype html><html lang="fa" dir="rtl"><body style="font-family:Arial,sans-serif;line-height:2;color:#0f172a"><h2>بازیابی رمز عبور</h2><p>برای تعیین رمز عبور جدید روی لینک زیر کلیک کنید. این لینک فقط ۱۵ دقیقه اعتبار دارد و یک‌بار قابل استفاده است.</p><p><a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">تعیین رمز عبور جدید</a></p><p>اگر این درخواست را شما ارسال نکرده‌اید، این ایمیل را نادیده بگیرید.</p></body></html>`,
      text: `برای تعیین رمز عبور جدید وارد این لینک شوید: ${resetUrl}\nاین لینک تا ۱۵ دقیقه معتبر است.`,
    }),
  });

  if (!response.ok) throw new AppError('Unable to send password recovery email', 502);
};
