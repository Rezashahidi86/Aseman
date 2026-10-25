const sortAllowlist = (sortValue, allowedFields) => {
  if (typeof sortValue !== 'string' || !sortValue.trim()) {
    return {};
  }

  const sort = {};

  for (const field of sortValue.split(',')) {
    const trimmedField = field.trim();
    const fieldName = trimmedField.startsWith('-')
      ? trimmedField.slice(1)
      : trimmedField;

    if (!allowedFields.includes(fieldName)) {
      continue;
    }

    sort[fieldName] = trimmedField.startsWith('-') ? -1 : 1;
  }

  return sort;
};

export default sortAllowlist;
