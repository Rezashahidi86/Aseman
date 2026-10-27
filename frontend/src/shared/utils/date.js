const DATE_LOCALE = 'fa-IR-u-ca-persian-nu-arabext';
const DATE_TIME_ZONE = 'Asia/Tehran';

const dateFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: DATE_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: DATE_TIME_ZONE,
});

const monthFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: 'numeric',
  month: 'long',
  timeZone: DATE_TIME_ZONE,
});

function toValidDate(value) {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPersianDate(value, fallback = '—') {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : fallback;
}

export function formatPersianDateTime(value, fallback = '—') {
  const date = toValidDate(value);
  return date ? dateTimeFormatter.format(date) : fallback;
}

export function formatPersianMonth(value, fallback = '—') {
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);

    if (month < 1 || month > 12) return fallback;

    const date = new Date(Date.UTC(year, month - 1, 15, 12));
    return monthFormatter.format(date);
  }

  const date = toValidDate(value);
  return date ? monthFormatter.format(date) : fallback;
}

export function formatPersianDateRange(startDate, endDate, fallback = '—') {
  const start = formatPersianDate(startDate, '');
  const end = formatPersianDate(endDate, '');

  if (!start && !end) return fallback;
  if (!start) return `تا ${end}`;
  if (!end) return `از ${start}`;
  return `${start} تا ${end}`;
}
