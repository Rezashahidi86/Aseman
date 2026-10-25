const validateMiddleware = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    req[property] = result.data;

    next();
  };
};

export default validateMiddleware;

// طریقه استفاده
// validateMiddleware(createUserSchema, "body");
// validateMiddleware(userParamsSchema, "params");
// validateMiddleware(userQuerySchema, "query");
