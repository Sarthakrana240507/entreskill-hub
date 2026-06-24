const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');
const { getRecommendationsForUser } = require('../utils/recommendationEngine');

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * GET /api/v1/ideas
 * Public listing with filters. If `recommended=true` and the caller is
 * authenticated, results are personalized and ranked by match score.
 */
const listIdeas = asyncHandler(async (req, res) => {
  const { page, limit, category, difficulty, search, recommended } = req.query;

  if (recommended && req.user) {
    const ideas = await getRecommendationsForUser(req.user.id, { limit });
    return res.status(200).json({
      success: true,
      data: { ideas, pagination: { page: 1, limit, total: ideas.length, personalized: true } },
    });
  }

  const where = {
    isPublished: true,
    ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [ideas, total] = await Promise.all([
    prisma.businessIdea.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { ideaSkills: { include: { skill: true } } },
    }),
    prisma.businessIdea.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: { ideas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
});

/**
 * GET /api/v1/ideas/:id
 */
const getIdea = asyncHandler(async (req, res) => {
  const idea = await prisma.businessIdea.findUnique({
    where: { id: req.params.id },
    include: {
      ideaSkills: { include: { skill: true } },
      ideaInterests: { include: { interest: true } },
      roadmap: { include: { steps: { orderBy: { order: 'asc' } } } },
      resources: { where: { status: 'APPROVED' } },
    },
  });

  if (!idea) throw new NotFoundError('Business idea not found');

  let isBookmarked = false;
  if (req.user) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_businessIdeaId: { userId: req.user.id, businessIdeaId: idea.id } },
    });
    isBookmarked = Boolean(bookmark);
  }

  res.status(200).json({ success: true, data: { idea: { ...idea, isBookmarked } } });
});

/**
 * POST /api/v1/ideas — Admin only
 */
const createIdea = asyncHandler(async (req, res) => {
  const { skillIds, interestIds, ...fields } = req.body;
  let slug = slugify(fields.title);

  const existingSlug = await prisma.businessIdea.findUnique({ where: { slug } });
  if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

  const idea = await prisma.businessIdea.create({
    data: {
      ...fields,
      slug,
      createdById: req.user.id,
      ideaSkills: { create: skillIds.map((s) => ({ skillId: s.skillId, weight: s.weight })) },
      ideaInterests: { create: interestIds.map((interestId) => ({ interestId })) },
    },
    include: { ideaSkills: true, ideaInterests: true },
  });

  res.status(201).json({ success: true, data: { idea } });
});

/**
 * PATCH /api/v1/ideas/:id — Admin only
 */
const updateIdea = asyncHandler(async (req, res) => {
  const { skillIds, interestIds, ...fields } = req.body;

  const idea = await prisma.$transaction(async (tx) => {
    const updated = await tx.businessIdea.update({ where: { id: req.params.id }, data: fields });

    if (Array.isArray(skillIds)) {
      await tx.ideaSkill.deleteMany({ where: { businessIdeaId: updated.id } });
      if (skillIds.length) {
        await tx.ideaSkill.createMany({
          data: skillIds.map((s) => ({ businessIdeaId: updated.id, skillId: s.skillId, weight: s.weight })),
        });
      }
    }

    if (Array.isArray(interestIds)) {
      await tx.ideaInterest.deleteMany({ where: { businessIdeaId: updated.id } });
      if (interestIds.length) {
        await tx.ideaInterest.createMany({
          data: interestIds.map((interestId) => ({ businessIdeaId: updated.id, interestId })),
        });
      }
    }

    return tx.businessIdea.findUnique({ where: { id: updated.id }, include: { ideaSkills: true, ideaInterests: true } });
  });

  res.status(200).json({ success: true, data: { idea } });
});

/**
 * DELETE /api/v1/ideas/:id — Admin only
 */
const deleteIdea = asyncHandler(async (req, res) => {
  await prisma.businessIdea.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, data: { message: 'Business idea deleted' } });
});

/**
 * POST /api/v1/ideas/:id/bookmark — toggles bookmark for the caller
 */
const toggleBookmark = asyncHandler(async (req, res) => {
  const ideaId = req.params.id;

  const idea = await prisma.businessIdea.findUnique({ where: { id: ideaId } });
  if (!idea) throw new NotFoundError('Business idea not found');

  const existing = await prisma.bookmark.findUnique({
    where: { userId_businessIdeaId: { userId: req.user.id, businessIdeaId: ideaId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return res.status(200).json({ success: true, data: { bookmarked: false } });
  }

  await prisma.bookmark.create({ data: { userId: req.user.id, businessIdeaId: ideaId } });
  res.status(201).json({ success: true, data: { bookmarked: true } });
});

/**
 * GET /api/v1/ideas/bookmarks/mine
 */
const listMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user.id },
    include: { businessIdea: true },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { bookmarks } });
});

module.exports = {
  listIdeas,
  getIdea,
  createIdea,
  updateIdea,
  deleteIdea,
  toggleBookmark,
  listMyBookmarks,
};
