import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { getDateKeyInTimeZone } from '../../../shared/utils/date.js';
import { formatJalaliDate, parseJalaliDate } from '../utils/jalaliDate.js';

const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const weekdays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const toPersianDigits = (value) => String(value).replace(/\\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
const persianNumber = new Intl.NumberFormat('fa-IR');

function getMonthParts(value) {
  const match = value?.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

function monthKey(year, month) {
  const date = new Date(Date.UTC(year, month - 1, 15, 12));
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { year: Number(values.year), month: Number(values.month) };
}

function shiftMonth(year, month, offset) {
  return monthKey(year, month + offset);
}

function getCalendarDays(year, month) {
  const firstDay = parseJalaliDate(`${year}/${String(month).padStart(2, '0')}/01`);
  if (!firstDay) return [];
  const firstDate = new Date(`${firstDay}T12:00:00Z`);
  const offset = (firstDate.getUTCDay() + 1) % 7;
  const start = new Date(firstDate.getTime() - offset * 86400000);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getTime() + index * 86400000);
    const iso = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    const jalali = formatJalaliDate(iso);
    const parts = getMonthParts(jalali);
    return { iso, jalali, day: Number(jalali.slice(-2)), inMonth: parts?.year === year && parts?.month === month };
  });
}

export function JalaliDatePicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState(() => getMonthParts(value) || getMonthParts(formatJalaliDate(getDateKeyInTimeZone(new Date()))));
  const [position, setPosition] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const selectedDate = useMemo(() => parseJalaliDate(value), [value]);
  const today = formatJalaliDate(getDateKeyInTimeZone(new Date()));
  const todayParts = getMonthParts(today);
  const days = useMemo(() => getCalendarDays(view.year, view.month), [view]);
  const selectedParts = getMonthParts(value);

  useEffect(() => {
    const parts = getMonthParts(value);
    if (parts) setView(parts);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !popoverRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === 'Escape') setIsOpen(false); };
    const onViewportChange = () => setIsOpen(false);
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [isOpen]);

  const openCalendar = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(340, window.innerWidth - 24);
    const estimatedHeight = 390;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight;
    setPosition({
      top: openAbove ? Math.max(12, rect.top - estimatedHeight - 8) : Math.min(rect.bottom + 8, window.innerHeight - estimatedHeight - 12),
      right: Math.max(12, window.innerWidth - rect.right),
      width,
      maxHeight: Math.max(300, window.innerHeight - 24),
    });
    setIsOpen(true);
  };

  const chooseDate = (date) => {
    onChange(date.jalali);
    setView(getMonthParts(date.jalali));
    setIsOpen(false);
  };

  const goToToday = () => {
    setView(todayParts);
  };

  return (
    <div ref={rootRef} className="relative mt-2 min-w-0">
      <button ref={triggerRef} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={isOpen} onClick={openCalendar}
        className="group flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-right transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none"
        style={{ background: 'var(--color-surface)', borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-text)', boxShadow: isOpen ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 13%, transparent)' : '0 2px 8px rgb(15 23 42 / 4%)' }}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}><FiCalendar size={19} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold" style={{ color: 'var(--color-muted)' }}>{label}</span>
          <span className="mt-1 block text-sm font-extrabold tabular-nums" dir="ltr" style={{ textAlign: 'right' }}>{value ? toPersianDigits(value) : 'انتخاب تاریخ'}</span>
        </span>
        <FiChevronLeft className={`shrink-0 transition-transform ${isOpen ? '-rotate-90' : ''}`} style={{ color: 'var(--color-muted)' }} size={17} />
      </button>

      {isOpen && position && createPortal(
        <div ref={popoverRef} role="dialog" aria-label={`تقویم ${label}`} className="overflow-y-auto rounded-2xl border p-3.5"
          style={{ position: 'fixed', top: position.top, right: position.right, width: position.width, maxHeight: position.maxHeight, zIndex: 2147483000, background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)', boxShadow: '0 20px 55px rgb(15 23 42 / 24%)' }}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <button type="button" aria-label="ماه قبل" onClick={() => setView((current) => shiftMonth(current.year, current.month, -1))}
              className="grid h-9 w-9 place-items-center rounded-xl border transition hover:bg-slate-100 dark:hover:bg-slate-800" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}><FiChevronRight size={17} /></button>
            <div className="min-w-0 text-center">
              <p className="text-sm font-extrabold">{monthNames[view.month - 1]} {persianNumber.format(view.year)}</p>
              <p className="mt-0.5 text-[10px]" style={{ color: 'var(--color-muted)' }}>تقویم هجری شمسی</p>
            </div>
            <button type="button" aria-label="ماه بعد" onClick={() => setView((current) => shiftMonth(current.year, current.month, 1))}
              className="grid h-9 w-9 place-items-center rounded-xl border transition hover:bg-slate-100 dark:hover:bg-slate-800" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}><FiChevronLeft size={17} /></button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {weekdays.map((day) => <span key={day} className="py-2 text-center text-[10px] font-bold" style={{ color: 'var(--color-muted)' }}>{day.slice(0, 1)}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = day.iso === selectedDate;
              const isToday = day.jalali === today;
              return <button key={day.iso} type="button" disabled={!day.inMonth} onClick={() => chooseDate(day)}
                aria-label={day.jalali} aria-pressed={isSelected}
                className="relative grid aspect-square min-w-0 place-items-center rounded-xl text-xs font-semibold transition disabled:cursor-default"
                style={{ background: isSelected ? 'var(--color-primary)' : 'transparent', color: isSelected ? '#fff' : day.inMonth ? 'var(--color-text)' : 'var(--color-muted)', opacity: day.inMonth ? 1 : 0.22, outline: isToday && !isSelected ? '1px solid var(--color-primary)' : 'none', outlineOffset: '-2px' }}>
                {persianNumber.format(day.day)}
                {isToday && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: 'var(--color-primary)' }} />}
              </button>;
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <button type="button" onClick={goToToday} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800" style={{ color: 'var(--color-primary)' }}><FiClock size={13} /> امروز</button>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{selectedParts ? `انتخاب‌شده: ${toPersianDigits(value)}` : 'یک روز را انتخاب کنید'}</span>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-2 py-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-muted)' }}>بستن</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
