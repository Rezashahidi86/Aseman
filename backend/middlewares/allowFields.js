const allowFields = (allowedFields) => (req, res, next) => {
  const filteredBody = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      filteredBody[field] = req.body[field];
    }
  }

  req.body = filteredBody;
  next();
};

export default allowFields;
