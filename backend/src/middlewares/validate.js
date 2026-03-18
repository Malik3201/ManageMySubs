const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
      .join('; ');
    return next(ApiError.badRequest(messages, 'VALIDATION_ERROR'));
  }
  req.validatedBody = result.data;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
      .join('; ');
    return next(ApiError.badRequest(messages, 'VALIDATION_ERROR'));
  }
  req.validatedQuery = result.data;
  next();
};

module.exports = { validate, validateQuery };
