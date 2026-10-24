const fieldSelection = (fieldsValue, allowedFields) => {
  if (typeof fieldsValue !== "string" || !fieldsValue.trim()) {
    return "";
  }

  const selectedFields = fieldsValue
    .split(",")
    .map((field) => field.trim())
    .filter((field) => allowedFields.includes(field));

  return [...new Set(selectedFields)].join(" ");
};

export default fieldSelection;