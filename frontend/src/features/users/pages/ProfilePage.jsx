import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiArrowRight, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'sonner';
import { updateCredentials } from '../../../api/services/authService.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';

export function ProfilePage() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!currentPassword) return setError('برای تأیید هویت، رمز عبور فعلی را وارد کنید.');
    if (!name.trim()) return setError('نام کاربر نمی‌تواند خالی باشد.');
    if (name.trim() === user?.name && email.trim().toLowerCase() === user?.email && !newPassword) return setError('اطلاعات جدیدی برای ذخیره وارد نشده است.');
    if (newPassword && newPassword.length < 8) return setError('رمز جدید باید حداقل ۸ کاراکتر باشد.');
    if (newPassword && newPassword !== confirmPassword) return setError('تکرار رمز جدید با آن مطابقت ندارد.');

    setIsSubmitting(true);
    try {
      await updateCredentials({
        currentPassword,
        ...(name.trim() !== user?.name ? { name: name.trim() } : {}),
        ...(email.trim().toLowerCase() !== user?.email ? { email: email.trim().toLowerCase() } : {}),
        ...(newPassword ? { newPassword, confirmPassword } : {}),
      });
      clearSession();
      toast.success('اطلاعات حساب تغییر کرد. لطفاً دوباره وارد شوید.');
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'تغییر اطلاعات حساب انجام نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-9">
            <button className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400" type="button" onClick={() => navigate(-1)}><FiArrowRight size={16} /> بازگشت</button>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-gradient-to-l from-indigo-50 to-white px-6 py-6 dark:border-slate-800 dark:from-indigo-950/40 dark:to-slate-900 sm:px-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300"><FiUser size={22} /></span>
                <h1 className="mt-4 text-xl font-extrabold">اطلاعات حساب کاربری</h1>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">نام، ایمیل و رمز عبور خود را مدیریت کنید. برای هر تغییر، رمز فعلی لازم است.</p>
              </div>
              <form className="grid gap-5 p-6 sm:p-8" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm font-bold" htmlFor="profile-name"><FiUser size={16} /> نام کاربر</label>
                  <input id="profile-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div className="grid gap-2">
                  <label className="flex items-center gap-2 text-sm font-bold" htmlFor="profile-email"><FiMail size={16} /> ایمیل حساب</label>
                  <input id="profile-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div className="grid gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <label className="flex items-center gap-2 text-sm font-bold" htmlFor="profile-new-password"><FiLock size={16} /> رمز عبور جدید <span className="text-xs font-normal text-slate-400">(اختیاری)</span></label>
                  <input id="profile-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={isSubmitting} placeholder="حداقل ۸ کاراکتر" className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                {newPassword && <div className="grid gap-2">
                  <label className="text-sm font-bold" htmlFor="profile-confirm-password">تکرار رمز عبور جدید</label>
                  <input id="profile-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
                </div>}
                <div className="grid gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <label className="text-sm font-bold" htmlFor="profile-current-password">رمز عبور فعلی برای تأیید تغییرات</label>
                  <input id="profile-current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={isSubmitting} className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{error}</p>}
                <button className="mt-2 min-h-12 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
