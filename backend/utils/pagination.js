const pagination = (pageValue, limitValue) => {
  const parsePositiveInt = (value, fallback) => {
    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      return fallback;
    }

    return parsed;
  };

  const page = parsePositiveInt(pageValue, 1);
  const limit = Math.min(parsePositiveInt(limitValue, 10), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export default pagination;
