const persianCalendar = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric' });

const partsFor = (date) => Object.fromEntries(persianCalendar.formatToParts(date).map(({ type, value }) => [type, value]));
const pad = (value) => String(value).padStart(2, '0');
const normalizeDigits = (value) => value.replace(/[۰-۹٠-٩]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit) >= 0 ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit) : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

export function formatJalaliDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return '';
  const parts = partsFor(new Date(Date.UTC(year, month - 1, day)));
  return `${parts.year}/${pad(parts.month)}/${pad(parts.day)}`;
}

export function parseJalaliDate(value) {
  const normalized = normalizeDigits(value.trim()).replace(/[.-]/g, '/');
  const match = normalized.match(/^(\\d{4})\\/(\\d{1,2})\\/(\\d{1,2})$/);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let newYear = null;
  for (let candidate = 18; candidate <= 23; candidate += 1) {
    const date = new Date(Date.UTC(year + 621, 2, candidate));
    const parts = partsFor(date);
    if (Number(parts.year) === year && Number(parts.month) === 1 && Number(parts.day) === 1) {
      newYear = date;
      break;
    }
  }
  if (!newYear) return null;

  const monthOffset = month <= 6 ? (month - 1) * 31 : 186 + (month - 7) * 30;
  const result = new Date(newYear.getTime() + (monthOffset + day - 1) * 86400000);
  const parts = partsFor(result);
  if (Number(parts.year) !== year || Number(parts.month) !== month || Number(parts.day) !== day) return null;
  return `${result.getUTCFullYear()}-${pad(result.getUTCMonth() + 1)}-${pad(result.getUTCDate())}`;
}
