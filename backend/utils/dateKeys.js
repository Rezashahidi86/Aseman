const TEHRAN_TIME_ZONE = 'Asia/Tehran';

const jalaliMonthFormatter = new Intl.DateTimeFormat(
  'en-US-u-ca-persian-nu-latn',
  {
    timeZone: TEHRAN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
);

const getJalaliParts = (date) =>
  Object.fromEntries(
    jalaliMonthFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

const getTehranJalaliMonthKey = (date = new Date()) => {
  const parts = getJalaliParts(date);
  return `${parts.year}-${parts.month.padStart(2, '0')}`;
};

const findJalaliMonthStart = (year, month) => {
  const start = Date.UTC(year + 621, 0, 1, 12);
  const end = Date.UTC(year + 623, 0, 1, 12);

  for (let timestamp = start; timestamp < end; timestamp += 86400000) {
    const parts = getJalaliParts(new Date(timestamp));

    if (
      Number(parts.year) === year &&
      Number(parts.month) === month &&
      Number(parts.day) === 1
    ) {
      return new Date(timestamp);
    }
  }

  throw new Error('Invalid Jalali month');
};

const getJalaliMonthDateRange = (monthKey) => {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthKey);

  if (!match) {
    throw new Error('Month must use YYYY-MM format');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const start = findJalaliMonthStart(year, month);
  const nextMonth = month === 12
    ? findJalaliMonthStart(year + 1, 1)
    : findJalaliMonthStart(year, month + 1);
  const end = new Date(nextMonth.getTime() - 86400000);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

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
  getTehranJalaliMonthKey,
  getJalaliMonthDateRange,
  shiftDateKey,
  getTehranDateRange,
};
