import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const EMPTY_FORM = {
  name: '',
  barcode: '',
  purchasePrice: '',
  salePrice: '',
  quantity: '',
  minimumStock: '0',
};

const FIELDS = [
  { name: 'name', label: 'نام محصول', type: 'text', required: true, maxLength: 120 },
  { name: 'barcode', label: 'بارکد', type: 'text', required: true, maxLength: 100 },
  { name: 'purchasePrice', label: 'قیمت خرید (تومان)', type: 'number', required: true, min: 0 },
  { name: 'salePrice', label: 'قیمت فروش (تومان)', type: 'number', required: true, min: 0 },
  { name: 'quantity', label: 'موجودی', type: 'number', required: true, min: 0, step: 1 },
  { name: 'minimumStock', label: 'حداقل موجودی', type: 'number', required: true, min: 0, step: 1 },
];

function getInitialValues(product) {
  if (!product) return EMPTY_FORM;
  return Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, product[key] ?? '']));
}

function validateProduct(form) {
  const errors = {};
  const name = form.name.trim();
  const barcode = form.barcode.trim();

  if (!name) errors.name = 'نام محصول الزامی است.';
  else if (name.length > 120) errors.name = 'نام محصول حداکثر ۱۲۰ کاراکتر باشد.';

  if (!barcode) errors.barcode = 'بارکد الزامی است.';
  else if (barcode.length > 100) errors.barcode = 'بارکد حداکثر ۱۰۰ کاراکتر باشد.';

  for (const field of ['purchasePrice', 'salePrice', 'quantity', 'minimumStock']) {
    if (form[field] === '' || !Number.isFinite(Number(form[field]))) {
      errors[field] = 'این مقدار الزامی است.';
      continue;
    }

    if (Number(form[field]) < 0) errors[field] = 'مقدار نمی‌تواند منفی باشد.';
    if (['quantity', 'minimumStock'].includes(field) && !Number.isInteger(Number(form[field]))) {
      errors[field] = 'مقدار باید عدد صحیح باشد.';
    }
  }

  return errors;
}

export function ProductFormModal({ product, isSaving, onClose, onSubmit }) {
  const [form, setForm] = useState(() => getInitialValues(product));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(getInitialValues(product));
    setErrors({});
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateProduct(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    const payload = {
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      purchasePrice: Number(form.purchasePrice),
      salePrice: Number(form.salePrice),
      quantity: Number(form.quantity),
      minimumStock: Number(form.minimumStock),
    };

    await onSubmit(payload);
  };

  const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <section className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-800 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="product-form-title" dir="rtl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold" id="product-form-title">{product ? 'ویرایش محصول' : 'افزودن محصول'}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">اطلاعات محصول را وارد کنید. همه فیلدها الزامی هستند.</p>
          </div>
          <button className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800" type="button" onClick={onClose} disabled={isSaving} aria-label="بستن فرم"><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300" key={field.name}>
                {field.label}
                <input
                  className={inputClass}
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  required={field.required}
                  min={field.min}
                  maxLength={field.maxLength}
                  step={field.step || (field.type === 'number' ? 'any' : undefined)}
                  autoComplete="off"
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `product-${field.name}-error` : undefined}
                />
                {errors[field.name] && <span className="mt-1.5 block text-[11px] font-medium text-rose-600" id={`product-${field.name}-error`}>{errors[field.name]}</span>}
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
            <button className="min-h-11 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={onClose} disabled={isSaving}>انصراف</button>
            <button className="min-h-11 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSaving}>{isSaving ? 'در حال ذخیره...' : product ? 'ذخیره تغییرات' : 'ثبت محصول'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
