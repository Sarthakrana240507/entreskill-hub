const { AppError } = require('../utils/errors');
const logger = require('../config/logger');
const config = require('../config/env');

/**
 * Translates known Prisma errors into clean API responses.
 */
function mapPrismaError(err) {
  if (err.code === 'P2002') {
    return { statusCode: 409, code: 'CONFLICT', message: `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists.` };
  }
  if (err.code === 'P2025') {
    return { statusCode: 404, code: 'NOT_FOUND', message: 'The requested record was not found.' };
  }
  if (err.code === 'P2003') {
    return { statusCode: 400, code: 'BAD_REQUEST', message: 'This operation references a record that does not exist.' };
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  if (err.name && err.name.startsWith('Prisma')) {
    const mapped = mapPrismaError(err);
    if (mapped) {
      statusCode = mapped.statusCode;
      code = mapped.code;
      message = mapped.message;
    }
  }

  const isOperational = err instanceof AppError || statusCode < 500;

  if (!isOperational || statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`);
  }

  const body = {
    success: false,
    error: {
      code,
      message: statusCode >= 500 && config.isProduction ? 'Internal server error. Please try again later.' : message,
      ...(details ? { details } : {}),
    },
  };

  if (!config.isProduction && statusCode >= 500) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} does not exist.` },
  });
}

module.exports = { errorHandler, notFoundHandler };
