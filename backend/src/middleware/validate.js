const { ZodError } = require('zod');
const { ValidationError } = require('../utils/errors');

/**
 * Validates req.body / req.query / req.params against the given Zod schemas
 * and replaces them with the parsed (and coerced/defaulted) values.
 *
 * Usage: validate({ body: createIdeaSchema })
 */
function validate(schemas) {
  return function validationMiddleware(req, res, next) {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return next(new ValidationError('One or more fields failed validation', details));
      }
      return next(err);
    }
  };
}

module.exports = validate;
