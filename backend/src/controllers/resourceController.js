const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * GET /api/v1/resources
 * Public users only ever see APPROVED resources; mentors/admins can filter by status.
 */
const listResources = asyncHandler(async (req, res) => {
  const { page, limit, type, businessIdeaId, status } = req.query;

  const isPrivileged = req.user && ['MENTOR', 'ADMIN'].includes(req.user.role);
  const where = {
    ...(type ? { type } : {}),
    ...(businessIdeaId ? { businessIdeaId } : {}),
    status: isPrivileged && status ? status : 'APPROVED',
  };

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.resource.count({ where }),
  ]);

  res.status(200).json({ success: true, data: { resources, pagination: { page, limit, total } } });
});

/**
 * POST /api/v1/resources — Mentor or Admin uploads training content.
 * Mentor-submitted content starts as PENDING and requires admin approval.
 * Admin-submitted content is auto-approved.
 */
const createResource = asyncHandler(async (req, res) => {
  const status = req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

  const resource = await prisma.resource.create({
    data: { ...req.body, uploadedById: req.user.id, status },
  });

  res.status(201).json({ success: true, data: { resource } });
});

/**
 * PATCH /api/v1/resources/:id/review — Admin only. Approves or rejects pending content.
 */
const reviewResource = asyncHandler(async (req, res) => {
  const { status } = req.body; // APPROVED | REJECTED

  const resource = await prisma.resource.update({
    where: { id: req.params.id },
    data: { status },
  });

  await prisma.auditLog.create({
    data: { actorId: req.user.id, action: `RESOURCE_${status}`, targetType: 'RESOURCE', targetId: resource.id },
  });

  res.status(200).json({ success: true, data: { resource } });
});

/**
 * DELETE /api/v1/resources/:id — Admin, or the mentor who owns it.
 */
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
  if (!resource) throw new NotFoundError('Resource not found');

  if (req.user.role !== 'ADMIN' && resource.uploadedById !== req.user.id) {
    throw new ForbiddenError('You can only delete resources you uploaded');
  }

  await prisma.resource.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: { message: 'Resource deleted' } });
});

/**
 * POST /api/v1/resources/:id/complete — marks a resource as completed for the learner's dashboard
 */
const markResourceComplete = asyncHandler(async (req, res) => {
  const resourceId = req.params.id;

  const progress = await prisma.resourceProgress.upsert({
    where: { userId_resourceId: { userId: req.user.id, resourceId } },
    create: { userId: req.user.id, resourceId, isComplete: true, completedAt: new Date() },
    update: { isComplete: true, completedAt: new Date() },
  });

  res.status(200).json({ success: true, data: { progress } });
});

/**
 * GET /api/v1/resources/mine/uploaded — Mentor view of their own submissions + status
 */
const listMyUploads = asyncHandler(async (req, res) => {
  const resources = await prisma.resource.findMany({
    where: { uploadedById: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { resources } });
});

module.exports = {
  listResources,
  createResource,
  reviewResource,
  deleteResource,
  markResourceComplete,
  listMyUploads,
};
