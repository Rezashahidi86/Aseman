import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiArrowRight, FiMail, FiShield } from 'react-icons/fi';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';
import { requestPasswordReset } from '../../../api/services/authService.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('یک ایمیل معتبر وارد کنید.');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setIsSent(true);
    } catch (requestError) {
      setError(requestError.message || 'ارسال لینک بازیابی انجام نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mb-8 flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><FiMail size={22} /></span>
          <ThemeToggle />
        </div>
        {isSent ? (
          <>
            <h1 className="text-2xl font-extrabold">درخواست ثبت شد</h1>
            <p className="mt-4 text-sm leading-8 text-slate-500 dark:text-slate-400">اگر حساب فعالی با این ایمیل وجود داشته باشد، لینک بازیابی برای آن ارسال شده است. پوشه هرزنامه را هم بررسی کنید.</p>
            <button className="mt-7 min-h-12 w-full rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700" type="button" onClick={() => navigate('/login', { replace: true })}>بازگشت به ورود</button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">بازیابی رمز عبور</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">ایمیل حساب کاربری خود را وارد کنید تا لینک تعیین رمز جدید برایتان ارسال شود.</p>
            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-semibold" htmlFor="recovery-email">آدرس ایمیل
                <input id="recovery-email" type="email" autoComplete="email" inputMode="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" disabled={isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
              </label>
              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{error}</p>}
              <button className="mt-2 min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}</button>
            </form>
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400"><FiShield className="mt-1 shrink-0" style={{ color: 'var(--color-primary)' }} size={17} /><span>برای حفظ امنیت، وجود یا عدم وجود حساب با این ایمیل نمایش داده نمی‌شود.</span></div>
          </>
        )}
        <Link className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300" to="/login"><FiArrowRight size={16} /> بازگشت به صفحه ورود</Link>
      </section>
    </main>
  );
}
