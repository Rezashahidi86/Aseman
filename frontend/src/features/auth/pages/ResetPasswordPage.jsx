import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { FiArrowRight, FiLock } from 'react-icons/fi';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';
import { resetPassword } from '../../../api/services/authService.js';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 72) {
      setError('رمز عبور باید حداقل ۸ و حداکثر ۷۲ کاراکتر باشد.');
      return;
    }
    if (password !== confirmPassword) {
      setError('تکرار رمز عبور با رمز جدید یکسان نیست.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setIsComplete(true);
    } catch (requestError) {
      setError(requestError.message || 'لینک بازیابی معتبر نیست یا منقضی شده است.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mb-8 flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><FiLock size={22} /></span>
          <ThemeToggle />
        </div>
        {isComplete ? (
          <>
            <h1 className="text-2xl font-extrabold">رمز عبور تغییر کرد</h1>
            <p className="mt-4 text-sm leading-8 text-slate-500 dark:text-slate-400">رمز عبور جدید ذخیره شد و تمام نشست‌های قبلی باطل شدند. اکنون با رمز جدید وارد شوید.</p>
            <button className="mt-7 min-h-12 w-full rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700" type="button" onClick={() => navigate('/login', { replace: true })}>ورود به حساب</button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">تعیین رمز عبور جدید</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">رمز جدید خود را وارد و آن را تأیید کنید.</p>
            {!token && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">لینک بازیابی ناقص است. از صفحه ورود دوباره درخواست لینک کنید.</p>}
            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-semibold" htmlFor="new-password">رمز عبور جدید
                <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={!token || isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
              </label>
              <label className="grid gap-2 text-sm font-semibold" htmlFor="confirm-password">تکرار رمز عبور جدید
                <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={!token || isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
              </label>
              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{error}</p>}
              <button className="mt-2 min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit" disabled={!token || isSubmitting}>{isSubmitting ? 'در حال ذخیره...' : 'ثبت رمز جدید'}</button>
            </form>
          </>
        )}
        <Link className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300" to="/login"><FiArrowRight size={16} /> بازگشت به صفحه ورود</Link>
      </section>
    </main>
  );
}
