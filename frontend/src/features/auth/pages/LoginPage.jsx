import { useState } from 'react';
import { FiArrowLeft, FiEye, FiEyeOff, FiShield, FiStar } from 'react-icons/fi';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { ThemeToggle } from '../../../shared/components/ThemeToggle.jsx';

function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'ایمیل را وارد کنید.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'فرمت ایمیل معتبر نیست.';
  }

  if (!values.password) errors.password = 'رمز عبور را وارد کنید.';

  return errors;
}

export function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setServerError('');

    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    try {
      await login({ email: values.email.trim().toLowerCase(), password: values.password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error.message || 'ورود انجام نشد. دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:grid-cols-[1.1fr_0.9fr]" dir="rtl">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-700 to-violet-500 p-10 text-white sm:p-14 lg:flex">
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full border border-white/15" />
        <div className="absolute -bottom-20 -right-8 h-80 w-80 rounded-full border border-white/15" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-2xl font-extrabold shadow-lg">آ</span>
          <span><strong className="block text-lg font-extrabold">آسمان</strong><small className="text-xs text-indigo-100">مدیریت هوشمند فروشگاه</small></span>
        </div>
        <div className="relative my-16 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs"><FiStar size={13} aria-hidden="true" /> فضای کاری یکپارچه</span>
          <h1 className="mt-7 text-4xl leading-[1.6] font-extrabold xl:text-5xl">همه چیز فروشگاهت،<br />یک‌جا زیر نظرته.</h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-indigo-100">فروش، موجودی و عملکرد شعبه را در یک فضای ساده و منظم مدیریت کن؛ تا با خیال راحت روی رشد کسب‌وکارت تمرکز کنی.</p>
        </div>
        <div className="relative flex flex-wrap gap-3 text-xs">
          {['مدیریت شعبه‌ها', 'گزارش‌های شفاف', 'دسترسی امن'].map((item) => <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" key={item}>{item}</span>)}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>خوش برگشتی! برای ادامه وارد شو.</span>
            <ThemeToggle />
          </div>
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">ورود به حساب</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">اطلاعات حساب کاربری خود را وارد کنید.</p>
          </header>

          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <label className="text-sm font-semibold" htmlFor="email">ایمیل</label>
              <input
                className={`min-h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900 ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                placeholder="name@example.com"
                value={values.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isSubmitting}
              />
              {errors.email && <span className="text-xs text-rose-600 dark:text-rose-400" id="email-error">{errors.email}</span>}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold" htmlFor="password">رمز عبور</label>
              <div className="relative">
                <input
                  className={`min-h-12 w-full rounded-xl border bg-white px-4 pl-20 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900 ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'}`}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={isSubmitting}
                />
                <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-300 dark:hover:bg-slate-800" type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'} disabled={isSubmitting}>
                  {showPassword ? <FiEyeOff size={17} aria-hidden="true" /> : <FiEye size={17} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-rose-600 dark:text-rose-400" id="password-error">{errors.password}</span>}
            </div>

            {serverError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{serverError}</div>}

            <button className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ورود...' : 'ورود به سامانه'}
              {!isSubmitting && <FiArrowLeft size={16} aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <FiShield className="mt-1 shrink-0 text-indigo-600 dark:text-indigo-300" size={18} aria-hidden="true" />
            <span><strong className="text-slate-800 dark:text-slate-200">ورود امن</strong><br />دسترسی شما بر اساس نقش کاربری و شعبه تعیین می‌شود.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
