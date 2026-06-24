const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * POST /api/v1/ideas/:ideaId/roadmap — Admin only. Creates the roadmap template for an idea.
 */
const createRoadmap = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
  const { title, steps } = req.body;

  const idea = await prisma.businessIdea.findUnique({ where: { id: ideaId } });
  if (!idea) throw new NotFoundError('Business idea not found');

  const existing = await prisma.roadmap.findUnique({ where: { businessIdeaId: ideaId } });
  if (existing) throw new ConflictError('This business idea already has a roadmap. Use PATCH to update it.');

  const roadmap = await prisma.roadmap.create({
    data: {
      businessIdeaId: ideaId,
      title,
      steps: { create: steps },
    },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  res.status(201).json({ success: true, data: { roadmap } });
});

/**
 * PATCH /api/v1/roadmaps/:roadmapId — Admin only. Replaces title + step list.
 */
const updateRoadmap = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;
  const { title, steps } = req.body;

  const roadmap = await prisma.$transaction(async (tx) => {
    const updated = await tx.roadmap.update({ where: { id: roadmapId }, data: { title } });

    if (Array.isArray(steps)) {
      await tx.roadmapStep.deleteMany({ where: { roadmapId } });
      await tx.roadmapStep.createMany({ data: steps.map((s) => ({ ...s, roadmapId })) });
    }

    return tx.roadmap.findUnique({ where: { id: roadmapId }, include: { steps: { orderBy: { order: 'asc' } } } });
  });

  res.status(200).json({ success: true, data: { roadmap } });
});

/**
 * GET /api/v1/roadmaps/:roadmapId
 */
const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: req.params.roadmapId },
    include: { steps: { orderBy: { order: 'asc' } }, businessIdea: true },
  });
  if (!roadmap) throw new NotFoundError('Roadmap not found');
  res.status(200).json({ success: true, data: { roadmap } });
});

/**
 * POST /api/v1/roadmaps/:roadmapId/start — user begins following a roadmap
 */
const startRoadmap = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;

  const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId }, include: { steps: true } });
  if (!roadmap) throw new NotFoundError('Roadmap not found');

  const userRoadmap = await prisma.userRoadmap.upsert({
    where: { userId_roadmapId: { userId: req.user.id, roadmapId } },
    create: {
      userId: req.user.id,
      roadmapId,
      status: 'IN_PROGRESS',
      stepProgress: { create: roadmap.steps.map((s) => ({ roadmapStepId: s.id })) },
    },
    update: {},
    include: { stepProgress: true },
  });

  res.status(200).json({ success: true, data: { userRoadmap } });
});

/**
 * PATCH /api/v1/roadmaps/progress/:userRoadmapId/steps/:stepId
 * Marks a single step complete/incomplete and recalculates overall progress %.
 */
const updateStepProgress = asyncHandler(async (req, res) => {
  const { userRoadmapId, stepId } = req.params;
  const { isComplete } = req.body;

  const userRoadmap = await prisma.userRoadmap.findUnique({
    where: { id: userRoadmapId },
    include: { stepProgress: true },
  });
  if (!userRoadmap || userRoadmap.userId !== req.user.id) {
    throw new NotFoundError('Roadmap progress record not found');
  }

  await prisma.userStepProgress.update({
    where: { userRoadmapId_roadmapStepId: { userRoadmapId, roadmapStepId: stepId } },
    data: { isComplete, completedAt: isComplete ? new Date() : null },
  });

  const allSteps = await prisma.userStepProgress.findMany({ where: { userRoadmapId } });
  const completedCount = allSteps.filter((s) => s.isComplete).length;
  const progressPct = Math.round((completedCount / allSteps.length) * 100);
  const status = progressPct === 100 ? 'COMPLETED' : progressPct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

  const updated = await prisma.userRoadmap.update({
    where: { id: userRoadmapId },
    data: { progressPct, status, completedAt: progressPct === 100 ? new Date() : null },
    include: { stepProgress: { include: { roadmapStep: true } }, roadmap: { include: { businessIdea: true } } },
  });

  res.status(200).json({ success: true, data: { userRoadmap: updated } });
});

/**
 * GET /api/v1/roadmaps/progress/mine — the Progress Tracking Dashboard data source
 */
const listMyProgress = asyncHandler(async (req, res) => {
  const userRoadmaps = await prisma.userRoadmap.findMany({
    where: { userId: req.user.id },
    include: {
      roadmap: { include: { businessIdea: true } },
      stepProgress: { include: { roadmapStep: true }, orderBy: { roadmapStep: { order: 'asc' } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { userRoadmaps } });
});

module.exports = {
  createRoadmap,
  updateRoadmap,
  getRoadmap,
  startRoadmap,
  updateStepProgress,
  listMyProgress,
};
