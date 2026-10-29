const TEHRAN_TIME_ZONE = 'Asia/Tehran';

const getTehranDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TEHRAN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getTehranMonthKey = (date = new Date()) =>
  getTehranDateKey(date).slice(0, 7);

const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
};

const getTehranDateRange = (startDate, endDate) => ({
  start: new Date(`${startDate}T00:00:00.000+03:30`),
  end: new Date(`${endDate}T23:59:59.999+03:30`),
});

export {
  getTehranDateKey,
  getTehranMonthKey,
  shiftDateKey,
  getTehranDateRange,
};
