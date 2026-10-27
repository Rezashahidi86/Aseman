import { useState } from 'react';
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

  if (!values.password) {
    errors.password = 'رمز عبور را وارد کنید.';
  } else if (values.password.length < 1) {
    errors.password = 'رمز عبور معتبر نیست.';
  }

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

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

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
    <main className="login-layout" dir="rtl">
      <section className="login-showcase">
        <div className="login-brand">
          <span className="login-brand__mark">آ</span>
          <span>
            <strong>آسمان</strong>
            <small>مدیریت هوشمند فروشگاه</small>
          </span>
        </div>

        <div className="login-showcase__copy">
          <span className="login-showcase__eyebrow"><span aria-hidden="true">✦</span> فضای کاری یکپارچه</span>
          <h1>همه چیز فروشگاهت،<br />یک‌جا زیر نظرته.</h1>
          <p>
            فروش، موجودی و عملکرد شعبه را در یک فضای ساده و منظم مدیریت کن؛
            تا با خیال راحت روی رشد کسب‌وکارت تمرکز کنی.
          </p>
        </div>

        <div className="login-showcase__features">
          <span className="login-feature">مدیریت شعبه‌ها</span>
          <span className="login-feature">گزارش‌های شفاف</span>
          <span className="login-feature">دسترسی امن</span>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-wrap">
          <div className="login-form-toolbar">
            <span>خوش برگشتی! برای ادامه وارد شو.</span>
            <ThemeToggle className="theme-toggle--login" />
          </div>

          <div className="login-heading">
            <h2>ورود به حساب</h2>
            <p>اطلاعات حساب کاربری خود را وارد کنید.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="email">ایمیل</label>
              <div className="input-wrap">
                <span className="input-wrap__icon" aria-hidden="true">✉</span>
                <input
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
              </div>
              {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">رمز عبور</label>
              <div className="input-wrap">
                <span className="input-wrap__icon" aria-hidden="true">⌑</span>
                <input
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
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                  disabled={isSubmitting}
                >
                  {showPassword ? 'پنهان' : 'نمایش'}
                </button>
              </div>
              {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
            </div>

            {serverError && <div className="form-error" role="alert">{serverError}</div>}

            <button className="button button--primary login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ورود...' : 'ورود به سامانه'}
              {!isSubmitting && <span className="login-submit__arrow" aria-hidden="true">←</span>}
            </button>
          </form>

          <div className="login-security-note">
            <span aria-hidden="true">◈</span>
            <span><strong>ورود امن</strong><br />دسترسی شما بر اساس نقش کاربری و شعبه تعیین می‌شود.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
