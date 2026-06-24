const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

/**
 * Restricts a route to one or more roles. Must run after `authenticate`.
 * Usage: router.get('/admin/users', authenticate, requireRole('ADMIN'), handler)
 */
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`This action requires one of the following roles: ${allowedRoles.join(', ')}`));
    }
    return next();
  };
}

module.exports = { requireRole };
