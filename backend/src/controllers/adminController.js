const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * GET /api/v1/admin/dashboard — top-level KPIs for the admin landing page
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalMentors,
    pendingMentors,
    totalIdeas,
    pendingResources,
    openReports,
    totalRoadmapsStarted,
    totalRoadmapsCompleted,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.mentorProfile.count({ where: { status: 'APPROVED' } }),
    prisma.mentorProfile.count({ where: { status: 'PENDING' } }),
    prisma.businessIdea.count(),
    prisma.resource.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.userRoadmap.count(),
    prisma.userRoadmap.count({ where: { status: 'COMPLETED' } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalMentors,
      pendingMentors,
      totalIdeas,
      pendingResources,
      openReports,
      totalRoadmapsStarted,
      totalRoadmapsCompleted,
      roadmapCompletionRate: totalRoadmapsStarted ? Math.round((totalRoadmapsCompleted / totalRoadmapsStarted) * 100) : 0,
    },
  });
});

/**
 * GET /api/v1/admin/users — paginated, filterable user management list
 */
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({ success: true, data: { users, pagination: { page: Number(page), limit: Number(limit), total } } });
});

/**
 * PATCH /api/v1/admin/users/:id/status — activate/deactivate a user account
 */
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') throw new BadRequestError('isActive must be a boolean');

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  await prisma.auditLog.create({
    data: { actorId: req.user.id, action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', targetType: 'USER', targetId: user.id },
  });

  res.status(200).json({ success: true, data: { user } });
});

/**
 * GET /api/v1/admin/resources/pending — content approval queue
 */
const listPendingResources = asyncHandler(async (req, res) => {
  const resources = await prisma.resource.findMany({
    where: { status: 'PENDING' },
    include: { businessIdea: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.status(200).json({ success: true, data: { resources } });
});

/**
 * GET /api/v1/admin/reports — moderation queue
 */
const listReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const reports = await prisma.report.findMany({
    where: status ? { status } : {},
    include: { filedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { reports } });
});

/**
 * PATCH /api/v1/admin/reports/:id — resolve/dismiss a report
 */
const reviewReport = asyncHandler(async (req, res) => {
  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: { ...req.body, resolvedAt: ['RESOLVED', 'DISMISSED'].includes(req.body.status) ? new Date() : null },
  });
  res.status(200).json({ success: true, data: { report } });
});

/**
 * GET /api/v1/admin/audit-logs — recent administrative actions
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { actor: { select: { name: true, email: true } } },
  });
  res.status(200).json({ success: true, data: { logs } });
});

/**
 * GET /api/v1/admin/feedback — all user feedback submissions
 */
const listFeedback = asyncHandler(async (req, res) => {
  const feedback = await prisma.feedback.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { feedback } });
});

module.exports = {
  getDashboardSummary,
  listUsers,
  setUserActiveStatus,
  listPendingResources,
  listReports,
  reviewReport,
  listAuditLogs,
  listFeedback,
};
