import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi';
import { useActiveBranch } from '../../../branches/ActiveBranchContext.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import {
  createManualDocument,
  deleteManualDocument,
  getManualDocuments,
  getManualDocumentImage,
} from '../../../api/services/manualDocumentService.js';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader.jsx';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar.jsx';
import { showError, showSuccess, confirmWithToast } from '../../../shared/utils/notifications.js';
import { formatNumber } from '../../../shared/utils/format.js';
import { formatPersianDate } from '../../../shared/utils/date.js';

const getTitleKey = (value) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export function ManualDocumentsPage() {
  const { user } = useAuth();
  const { activeBranchId, isLoadingBranches } = useActiveBranch();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [details, setDetails] = useState('');
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loadedImageUrls, setLoadedImageUrls] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTitles, setExpandedTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const previews = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    let cancelled = false;
    const objectUrls = [];
    const urls = [...new Set(documents.flatMap((document) => document.imageUrls || []))];

    setLoadedImageUrls({});

    Promise.all(
      urls.map(async (url) => {
        try {
          const objectUrl = await getManualDocumentImage(url);
          if (cancelled) {
            URL.revokeObjectURL(objectUrl);
            return [url, null];
          }
          objectUrls.push(objectUrl);
          return [url, objectUrl];
        } catch {
          return [url, null];
        }
      }),
    ).then((entries) => {
      if (!cancelled) setLoadedImageUrls(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documents]);

  const groupedDocuments = useMemo(() => {
    const groups = new Map();

    documents.forEach((document) => {
      const key = getTitleKey(document.documentDetails || '');
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          title: (document.documentDetails || '').trim(),
          documents: [],
        });
      }
      groups.get(key).documents.push(document);
    });

    return Array.from(groups.values());
  }, [documents]);

  const load = useCallback(async () => {
    if (user?.role === 'ADMIN' && (isLoadingBranches || !activeBranchId)) {
      setDocuments([]);
      setError(isLoadingBranches ? '' : 'لطفاً ابتدا شعبه‌ای را از نوار بالای صفحه انتخاب کنید.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getManualDocuments({
        branchId: activeBranchId || undefined,
        limit: 100,
      });
      setDocuments(response?.data?.documents || []);
    } catch (loadError) {
      setError(loadError.message || 'دریافت فاکتور ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, isLoadingBranches, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setDetails('');
    setNote('');
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleSelectImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setImages((current) => {
      const combined = [...current, ...selectedFiles];
      if (combined.length > 10) {
        showError('حداکثر می‌توانید ۱۰ تصویر برای هر فاکتور انتخاب کنید.');
        return combined.slice(0, 10);
      }
      return combined;
    });

    event.target.value = '';
  };

  const removeSelectedImage = (index) => {
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!images.length) {
      showError('حداقل یک تصویر انتخاب کنید.');
      return;
    }

    setSaving(true);

    try {
      await createManualDocument({
        documentDetails: details.trim(),
        note: note.trim(),
        images,
        branchId: activeBranchId || undefined,
      });
      setIsModalOpen(false);
      resetForm();
      await load();
      showSuccess('فاکتور دستی ثبت شد.');
    } catch (submitError) {
      showError(submitError.message || 'ثبت فاکتور ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = (document) => confirmWithToast({
    message: 'این فاکتور دستی حذف شود؟',
    confirmLabel: 'حذف فاکتور',
    type: 'error',
    onConfirm: async () => {
      try {
        await deleteManualDocument(
          document._id,
          activeBranchId ? { branchId: activeBranchId } : {},
        );
        await load();
        showSuccess('فاکتور حذف شد.');
      } catch (deleteError) {
        showError(deleteError.message || 'حذف فاکتور ناموفق بود.');
      }
    },
  });

  const toggleGroup = (key) => {
    setExpandedTitles((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100" dir="rtl">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0">
          <DashboardHeader />
          <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 sm:py-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <FiFileText size={16} />
                  بایگانی فاکتور
                </div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">فاکتور دستی</h1>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  ثبت و نگهداری تصاویر فاکتور حسابداری؛ این فاکتور فروش محسوب نمی‌شوند.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  تازه‌سازی
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  <FiPlus size={16} />
                  افزودن فاکتور
                </button>
              </div>
            </header>

            {error && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                <span>{error}</span>
                <button type="button" onClick={load} className="font-bold underline">تلاش دوباره</button>
              </div>
            )}

            <section className="space-y-3">
              {groupedDocuments.map((group) => {
                const isExpanded = Boolean(expandedTitles[group.key]);
                return (
                  <article key={group.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => toggleGroup(group.key)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-right transition hover:bg-slate-50 sm:p-5 dark:hover:bg-slate-800/60"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                          <FiFileText size={19} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold">{group.title || 'بدون عنوان'}</span>
                          <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
                            {formatNumber(group.documents.length)} فاکتور · آخرین ثبت {formatPersianDate(group.documents[0].createdAt)}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                        <span className="hidden sm:inline">{isExpanded ? 'بستن فاکتور' : 'مشاهده فاکتور'}</span>
                        {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 border-t border-slate-100 p-3 sm:p-5 dark:border-slate-800">
                        {group.documents.map((document) => (
                          <section key={document._id} className="rounded-xl border border-slate-200 p-3 sm:p-4 dark:border-slate-700">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold">{formatPersianDate(document.createdAt)}</p>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  ثبت‌کننده: {document.createdBy?.name || 'کاربر'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(document)}
                                aria-label="حذف فاکتور"
                                className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                            {document.note && (
                              <p className="mb-3 whitespace-pre-wrap text-xs leading-6 text-slate-600 dark:text-slate-300">{document.note}</p>
                            )}
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                              {(document.imageUrls || []).map((url, index) => (
                                <a
                                  key={url}
                                  href={loadedImageUrls[url] || undefined}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => {
                                    if (!loadedImageUrls[url]) event.preventDefault();
                                  }}
                                  className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                                >
                                  {loadedImageUrls[url] ? (
                                    <img
                                      src={loadedImageUrls[url]}
                                      alt={`تصویر فاکتور ${index + 1}`}
                                      loading="lazy"
                                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                    />
                                  ) : (
                                    <FiImage size={24} className="text-slate-400" />
                                  )}
                                </a>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}

              {!groupedDocuments.length && !loading && (
                <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div>
                    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><FiFileText size={21} /></span>
                    <p className="mt-4 text-sm font-extrabold">هنوز فاکتوری ثبت نشده است</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">برای شروع، اولین فاکتور دستی را اضافه کنید.</p>
                    <button type="button" onClick={() => setIsModalOpen(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white"><FiPlus /> افزودن فاکتور</button>
                  </div>
                </div>
              )}
              {loading && <p className="py-4 text-center text-xs text-slate-500">در حال بارگذاری فاکتور...</p>}
            </section>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="manual-document-modal-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7 dark:border-slate-800 dark:bg-slate-900">
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><FiFileText size={19} /></span>
                <h2 id="manual-document-modal-title" className="text-lg font-extrabold">افزودن فاکتور دستی</h2>
                <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">عنوان یکسان باعث می‌شود فاکتور در یک گروه نمایش داده شوند.</p>
              </div>
              <button type="button" onClick={closeModal} disabled={saving} aria-label="بستن پنجره" className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"><FiX size={18} /></button>
            </header>

            <form onSubmit={submit} className="space-y-5">
              <label className="block text-xs font-bold">
                عنوان فاکتور
                <input
                  required
                  maxLength={500}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="مثلاً: فاکتور خرید مهر"
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <label className="block text-xs font-bold">
                یادداشت <span className="font-normal text-slate-400">(اختیاری)</span>
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="توضیحات تکمیلی فاکتور..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold">تصاویر فاکتور <span className="font-normal text-slate-400">(حداکثر ۱۰ تصویر)</span></span>
                  <span className="text-[11px] text-slate-500">{formatNumber(images.length)} از ۱۰</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleSelectImages}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 10}
                  className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/70 px-4 py-5 text-center transition hover:border-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"><FiUploadCloud size={20} /></span>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{images.length ? 'افزودن تصویر دیگر' : 'انتخاب تصاویر از دستگاه'}</span>
                  <span className="text-[10px] text-slate-500">فرمت‌های تصویری · انتخاب چند تصویر هم‌زمان</span>
                </button>

                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {images.map((file, index) => (
                      <div key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="group relative min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                        <img src={imagePreviews[index]} alt={`پیش‌نمایش ${file.name}`} className="aspect-[4/3] w-full object-cover" />
                        <div className="truncate px-1.5 py-1 text-[9px] text-slate-600 dark:text-slate-300" title={file.name}>{file.name}</div>
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          aria-label={`حذف تصویر ${file.name}`}
                          className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white shadow transition hover:bg-rose-700"
                        >
                          <FiX size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
                <button type="button" onClick={closeModal} disabled={saving} className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">انصراف</button>
                <button type="submit" disabled={saving || !details.trim() || images.length === 0} className="min-h-11 rounded-xl bg-indigo-600 px-6 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'در حال ثبت فاکتور...' : 'ثبت فاکتور'}</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
