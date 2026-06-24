const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/v1/feedback
 */
const submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await prisma.feedback.create({ data: { userId: req.user.id, ...req.body } });
  res.status(201).json({ success: true, data: { feedback } });
});

/**
 * POST /api/v1/reports
 */
const submitReport = asyncHandler(async (req, res) => {
  const report = await prisma.report.create({ data: { filedById: req.user.id, ...req.body } });
  res.status(201).json({ success: true, data: { report } });
});

/**
 * GET /api/v1/notifications/mine
 */
const listMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.status(200).json({ success: true, data: { notifications } });
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.status(200).json({ success: true, data: { notification } });
});

module.exports = { submitFeedback, submitReport, listMyNotifications, markNotificationRead };
