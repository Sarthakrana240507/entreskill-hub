/**
 * Wraps an async Express route/middleware handler so any rejected promise
 * is forwarded to next(err) and caught by the central error handler,
 * instead of crashing the process or requiring try/catch in every controller.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
