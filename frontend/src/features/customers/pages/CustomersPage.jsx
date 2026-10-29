import { useCallback, useEffect, useState } from 'react';
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiRefreshCw,
  FiMessageSquare,
  FiSave,
  FiX,
  FiSend,
} from 'react-icons/fi';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSmsSettings,
  updateCustomerSmsSettings,
  sendCustomerSms,
} from '../../../api/services/customerService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import {
  showError,
  showSuccess,
  showInfo,
  confirmWithToast,
} from '../../../shared/utils/notifications.js';

const emptyForm = { name: '', phone: '' };

const inputClassName = 'mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700';
const buttonClassName = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800';

export function CustomersPage() {
  const { activeBranchId } = useActiveBranch();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const pageSize = 10;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [smsCustomer, setSmsCustomer] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  const branchParams = activeBranchId ? { branchId: activeBranchId } : {};

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getCustomers({
        search: search.trim() || undefined,
        branchId: activeBranchId || undefined,
        page,
        limit: pageSize,
      });
      const nextCustomers = response?.data?.customers || [];
      const nextPagination = response?.pagination || {
        page,
        limit: pageSize,
        total: nextCustomers.length,
        totalPages: nextCustomers.length ? 1 : 0,
      };

      if (page > nextPagination.totalPages && nextPagination.totalPages > 0) {
        setPage(nextPagination.totalPages);
        return;
      }

      setCustomers(nextCustomers);
      setPagination(nextPagination);
    } catch (err) {
      setError(err.message || 'دریافت مشتریان ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, page, search]);

  const loadSmsSettings = useCallback(async () => {
    if (!activeBranchId) {
      setWelcomeMessage('');
      return;
    }

    setLoadingSettings(true);

    try {
      const response = await getCustomerSmsSettings({ branchId: activeBranchId });
      setWelcomeMessage(response?.data?.welcomeMessage || '');
    } catch (err) {
      showError(err.message || 'دریافت تنظیمات پیامک ناموفق بود.');
    } finally {
      setLoadingSettings(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSmsSettings();
  }, [loadSmsSettings]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const wasEditing = Boolean(editingId);
      const response = wasEditing
        ? await updateCustomer(editingId, form, branchParams)
        : await createCustomer({ ...form, message: welcomeMessage }, branchParams);

      setForm(emptyForm);
      setEditingId('');
      await load();
      const smsStatus = response?.data?.sms?.status;

      if (!wasEditing && smsStatus === 'failed') {
        showError('مشتری ثبت شد، اما ارسال پیامک خوش‌آمدگویی ناموفق بود.');
      } else if (!wasEditing && smsStatus === 'not_configured') {
        showInfo('مشتری ثبت شد؛ تنظیمات سرویس پیامک هنوز کامل نیست.');
      } else {
        showSuccess(wasEditing ? 'اطلاعات مشتری ویرایش شد.' : 'مشتری ثبت شد.');
      }
    } catch (err) {
      showError(err.message || 'ذخیره مشتری ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const saveSmsSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);

    try {
      await updateCustomerSmsSettings({ welcomeMessage }, branchParams);
      showSuccess('متن پیامک خوش‌آمدگویی ذخیره شد.');
    } catch (err) {
      showError(err.message || 'ذخیره تنظیمات پیامک ناموفق بود.');
    } finally {
      setSavingSettings(false);
    }
  };

  const openSmsModal = (customer) => {
    setSmsCustomer(customer);
    setSmsMessage('');
  };

  const submitSms = async (event) => {
    event.preventDefault();

    if (!smsCustomer) return;

    setSendingSms(true);

    try {
      await sendCustomerSms(smsCustomer._id, { message: smsMessage }, branchParams);
      showSuccess(`پیامک برای ${smsCustomer.name} ارسال شد.`);
      setSmsCustomer(null);
      setSmsMessage('');
    } catch (err) {
      showError(err.message || 'ارسال پیامک ناموفق بود.');
    } finally {
      setSendingSms(false);
    }
  };

  const remove = (customer) => confirmWithToast({
    message: `مشتری «${customer.name}» حذف شود؟`,
    confirmLabel: 'حذف مشتری',
    type: 'error',
    onConfirm: async () => {
      try {
        await deleteCustomer(customer._id, branchParams);
        await load();
        showSuccess('مشتری حذف شد.');
      } catch (err) {
        showError(err.message);
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold">مشتریان</h1>
                <p className="mt-2 text-xs text-slate-500">مدیریت مشتریان شعبه برای ارتباط و اطلاع‌رسانی</p>
              </div>
              <button type="button" onClick={() => { load(); loadSmsSettings(); }} className={buttonClassName}>
                <FiRefreshCw /> تازه‌سازی
              </button>
            </header>

            <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2">
                <FiMessageSquare className="text-indigo-600" />
                <h2 className="text-sm font-extrabold">پیامک خوش‌آمدگویی مشتری جدید</h2>
              </div>
              <p className="mb-3 text-xs leading-6 text-slate-500">
                متن این ورودی همراه با درخواست ثبت مشتری در body ارسال می‌شود و پس از ثبت، به شماره او پیامک می‌شود. برای درج نام مشتری از <span dir="ltr">{'{name}'}</span> استفاده کن.
              </p>
              <form onSubmit={saveSmsSettings}>
                <textarea
                  value={welcomeMessage}
                  onChange={(event) => setWelcomeMessage(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="مثلاً {name} عزیز، به جمع مشتریان ما خوش آمدید."
                  disabled={loadingSettings || savingSettings}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-transparent p-3 text-sm leading-7 outline-none focus:border-indigo-500 dark:border-slate-700"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{welcomeMessage.length}/1000 کاراکتر · خالی گذاشتن متن، ارسال خودکار را غیرفعال می‌کند.</span>
                  <button disabled={loadingSettings || savingSettings} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:opacity-50">
                    <FiSave /> {savingSettings ? 'در حال ذخیره...' : 'ذخیره متن پیامک'}
                  </button>
                </div>
              </form>
            </section>

            <form onSubmit={submit} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
              <label className="text-xs font-bold">
                نام مشتری
                <input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClassName} />
              </label>
              <label className="text-xs font-bold">
                شماره تماس
                <input required inputMode="numeric" pattern="09[0-9]{9}" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClassName} />
              </label>
              <div className="flex items-end gap-2">
                <button disabled={saving} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:opacity-50">
                  <FiPlus /> {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره ویرایش' : 'ثبت مشتری'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(''); setForm(emptyForm); }} className="min-h-11 rounded-xl border px-3 text-xs">
                    لغو
                  </button>
                )}
              </div>
            </form>

            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute right-3 top-3.5 text-slate-400" />
                <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="جست‌وجو بر اساس نام یا شماره تماس" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
              </div>
            </div>

            {error && (
              <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                {error} <button type="button" onClick={load} className="mr-2 underline">تلاش دوباره</button>
              </p>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full min-w-[680px] text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="p-4">نام</th>
                    <th className="p-4">شماره تماس</th>
                    <th className="p-4">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-4 font-bold">{customer.name}</td>
                      <td className="p-4" dir="ltr">{customer.phone}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button type="button" aria-label="ویرایش مشتری" title="ویرایش مشتری" onClick={() => { setEditingId(customer._id); setForm({ name: customer.name, phone: customer.phone }); }} className="rounded-lg border p-2">
                            <FiEdit2 />
                          </button>
                          <button type="button" aria-label="حذف مشتری" title="حذف مشتری" onClick={() => remove(customer)} className="rounded-lg border border-rose-200 p-2 text-rose-600">
                            <FiTrash2 />
                          </button>
                          <button type="button" aria-label="ارسال پیامک" title="ارسال پیامک" onClick={() => openSmsModal(customer)} className={buttonClassName}>
                            <FiMessageSquare /> <span>ارسال پیام</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!customers.length && !loading && (
                    <tr><td colSpan="3" className="p-8 text-center text-slate-500">مشتری‌ای پیدا نشد.</td></tr>
                  )}
                </tbody>
              </table>
              {loading && <p className="p-4 text-xs text-slate-500">در حال دریافت مشتریان...</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500">
                {pagination.total === 0
                  ? 'مشتری‌ای برای نمایش وجود ندارد.'
                  : `نمایش ${(page - 1) * pageSize + 1} تا ${Math.min(page * pageSize, pagination.total)} از ${pagination.total} مشتری`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className={buttonClassName}
                >
                  قبلی
                </button>
                <span className="min-w-20 text-center text-xs font-bold">
                  صفحه {pagination.totalPages ? page : 0} از {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={loading || page >= pagination.totalPages}
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  className={buttonClassName}
                >
                  بعدی
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {smsCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !sendingSms) setSmsCustomer(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="send-sms-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="send-sms-title" className="text-lg font-extrabold">ارسال پیامک</h2>
                <p className="mt-1 text-xs text-slate-500">{smsCustomer.name} · <span dir="ltr">{smsCustomer.phone}</span></p>
              </div>
              <button type="button" aria-label="بستن" disabled={sendingSms} onClick={() => setSmsCustomer(null)} className="rounded-lg border p-2">
                <FiX />
              </button>
            </div>
            <form onSubmit={submitSms}>
              <label className="text-xs font-bold">
                متن پیام
                <textarea required minLength={1} maxLength={1000} rows={5} value={smsMessage} onChange={(event) => setSmsMessage(event.target.value)} placeholder="متن پیامک را وارد کن. برای درج نام مشتری از {name} استفاده کن." className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-transparent p-3 text-sm leading-7 outline-none focus:border-indigo-500 dark:border-slate-700" />
              </label>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{smsMessage.length}/1000</span>
                <div className="flex gap-2">
                  <button type="button" disabled={sendingSms} onClick={() => setSmsCustomer(null)} className={buttonClassName}>انصراف</button>
                  <button disabled={sendingSms || !smsMessage.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white disabled:opacity-50">
                    <FiSend /> {sendingSms ? 'در حال ارسال...' : 'ارسال پیامک'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
