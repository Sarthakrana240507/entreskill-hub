const { verifyAccessToken } = require('../utils/token');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Verifies the Bearer access token on the Authorization header and attaches
 * the decoded payload ({ userId, role }) to req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token expired'));
    }
    return next(new UnauthorizedError('Invalid access token'));
  }
}

/**
 * Optional auth: attaches req.user if a valid token is present, but does not
 * reject the request if it's missing. Useful for endpoints with public +
 * personalized views (e.g. business idea listing with bookmark flags).
 */
function attachUserIfPresent(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
  } catch (err) {
    // Ignore invalid/expired tokens for optional auth — treat as anonymous.
  }
  return next();
}

module.exports = { authenticate, attachUserIfPresent };
