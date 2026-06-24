const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

/**
 * GET /api/v1/profile/me
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.skillProfile.findUnique({
    where: { userId: req.user.id },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { interest: true } },
    },
  });

  res.status(200).json({ success: true, data: { profile: profile || null } });
});

/**
 * PUT /api/v1/profile/me
 * Upserts the caller's skill profile, including the skills/interests join rows.
 */
const upsertMyProfile = asyncHandler(async (req, res) => {
  const { skills, interestIds, ...scalarFields } = req.body;

  const profile = await prisma.$transaction(async (tx) => {
    const upserted = await tx.skillProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, ...scalarFields },
      update: scalarFields,
    });

    if (Array.isArray(skills)) {
      await tx.userSkill.deleteMany({ where: { skillProfileId: upserted.id } });
      if (skills.length > 0) {
        await tx.userSkill.createMany({
          data: skills.map((s) => ({
            skillProfileId: upserted.id,
            skillId: s.skillId,
            proficiency: s.proficiency,
          })),
        });
      }
    }

    if (Array.isArray(interestIds)) {
      await tx.userInterest.deleteMany({ where: { skillProfileId: upserted.id } });
      if (interestIds.length > 0) {
        await tx.userInterest.createMany({
          data: interestIds.map((interestId) => ({ skillProfileId: upserted.id, interestId })),
        });
      }
    }

    return tx.skillProfile.findUnique({
      where: { id: upserted.id },
      include: { skills: { include: { skill: true } }, interests: { include: { interest: true } } },
    });
  });

  res.status(200).json({ success: true, data: { profile } });
});

/**
 * GET /api/v1/profile/skills — public catalogue used to build the profiling form
 */
const listSkills = asyncHandler(async (req, res) => {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  res.status(200).json({ success: true, data: { skills } });
});

/**
 * GET /api/v1/profile/interests — public catalogue
 */
const listInterests = asyncHandler(async (req, res) => {
  const interests = await prisma.interest.findMany({ orderBy: { name: 'asc' } });
  res.status(200).json({ success: true, data: { interests } });
});

module.exports = { getMyProfile, upsertMyProfile, listSkills, listInterests };
