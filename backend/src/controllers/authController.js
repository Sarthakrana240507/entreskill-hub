const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');
const config = require('../config/env');

const SALT_ROUNDS = 12;

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // matches default 7d refresh expiry

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken };
}

/**
 * POST /api/v1/auth/register
 * Creates a USER or MENTOR account. MENTOR accounts still require a
 * separate mentor profile + admin approval before they can act as mentors.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  const tokens = await issueTokenPair(user);

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), ...tokens },
  });
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('This account has been deactivated. Contact support.');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await issueTokenPair(user);

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user), ...tokens },
  });
});

/**
 * POST /api/v1/auth/refresh
 * Rotates refresh tokens: the presented token is revoked and a new pair issued.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is no longer valid. Please log in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Account no longer available');
  }

  // Rotate: revoke old, issue new pair
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokenPair(user);

  res.status(200).json({ success: true, data: tokens });
});

/**
 * POST /api/v1/auth/logout
 * Revokes the presented refresh token so it can no longer be used to mint new access tokens.
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }
  res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
});

/**
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { mentorProfile: true, skillProfile: true },
  });
  if (!user) throw new NotFoundError('User not found');
  res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
});

/**
 * PATCH /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new NotFoundError('User not found');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new BadRequestError('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Revoke all existing refresh tokens to force re-login on other devices
  await prisma.refreshToken.updateMany({ where: { userId: user.id, revoked: false }, data: { revoked: true } });

  res.status(200).json({ success: true, data: { message: 'Password updated successfully. Please log in again.' } });
});

module.exports = { register, login, refresh, logout, getMe, changePassword };
