const prisma = require('../config/prisma');

/**
 * Recommendation Engine
 * ----------------------
 * A transparent, explainable scoring model (not a black-box ML model — this
 * is intentional for an MVP enablement platform aimed at non-technical users,
 * where trust and explainability matter more than marginal accuracy gains).
 *
 * Score components per BusinessIdea (0-100 scale):
 *  - Skill match (60%): sum of (weight) for each idea-required skill the user
 *    has, scaled by the user's proficiency in that skill, normalized against
 *    the idea's total possible weight.
 *  - Interest overlap (25%): fraction of the idea's tagged interests that
 *    intersect with the user's selected interests.
 *  - Feasibility fit (15%): rewards ideas whose difficulty matches the user's
 *    experience level and whose cost band fits the user's stated budget.
 */

const BUDGET_RANGES = {
  UNDER_5000: { min: 0, max: 5000 },
  '5000_25000': { min: 5000, max: 25000 },
  '25000_100000': { min: 25000, max: 100000 },
  ABOVE_100000: { min: 100000, max: Infinity },
};

const DIFFICULTY_RANK = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 };

function scoreSkillMatch(idea, userSkillMap) {
  if (idea.ideaSkills.length === 0) return 0;

  let earned = 0;
  let possible = 0;

  for (const ideaSkill of idea.ideaSkills) {
    possible += ideaSkill.weight * 5; // max proficiency is 5
    const userProficiency = userSkillMap.get(ideaSkill.skillId) || 0;
    earned += ideaSkill.weight * userProficiency;
  }

  return possible === 0 ? 0 : earned / possible; // 0..1
}

function scoreInterestOverlap(idea, userInterestSet) {
  if (idea.ideaInterests.length === 0) return 0.5; // neutral if idea has no interest tags
  const matched = idea.ideaInterests.filter((ii) => userInterestSet.has(ii.interestId)).length;
  return matched / idea.ideaInterests.length; // 0..1
}

function scoreFeasibility(idea, profile) {
  let score = 0;

  // Difficulty fit: closer experience level to idea difficulty = better fit
  const experienceRank = DIFFICULTY_RANK[profile.experienceLevel] || 1;
  const ideaRank = DIFFICULTY_RANK[idea.difficulty] || 1;
  const rankDistance = Math.abs(experienceRank - ideaRank);
  score += rankDistance === 0 ? 0.6 : rankDistance === 1 ? 0.3 : 0; // out of 0.6

  // Budget fit: does the idea's cost band fall inside the user's stated range?
  const userBudget = BUDGET_RANGES[profile.budgetRange] || BUDGET_RANGES.UNDER_5000;
  const overlaps = idea.estimatedCostMin <= userBudget.max && idea.estimatedCostMax >= userBudget.min;
  score += overlaps ? 0.4 : 0; // out of 0.4

  return score; // 0..1
}

/**
 * Computes ranked recommendations for a given user.
 * Returns ideas annotated with `matchScore` (0-100) and `matchBreakdown`.
 *
 * Accepts the same filters as the public idea listing (category, difficulty,
 * search) so that "Show Matches For Me" composes correctly with the filter
 * dropdowns instead of silently ignoring them.
 */
async function getRecommendationsForUser(userId, { limit = 20, category, difficulty, search } = {}) {
  const profile = await prisma.skillProfile.findUnique({
    where: { userId },
    include: { skills: true, interests: true },
  });

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

  const ideas = await prisma.businessIdea.findMany({
    where,
    include: { ideaSkills: true, ideaInterests: true },
  });

  // No profile yet -> return ideas unscored (e.g. newest first) so the
  // recommendations page is never empty for a brand-new user.
  if (!profile) {
    return ideas
      .slice(0, limit)
      .map((idea) => ({ ...stripJoinTables(idea), matchScore: null, matchBreakdown: null }));
  }

  const userSkillMap = new Map(profile.skills.map((s) => [s.skillId, s.proficiency]));
  const userInterestSet = new Set(profile.interests.map((i) => i.interestId));

  const scored = ideas.map((idea) => {
    const skillMatch = scoreSkillMatch(idea, userSkillMap);
    const interestMatch = scoreInterestOverlap(idea, userInterestSet);
    const feasibility = scoreFeasibility(idea, profile);

    const matchScore = Math.round((skillMatch * 0.6 + interestMatch * 0.25 + feasibility * 0.15) * 100);

    return {
      ...stripJoinTables(idea),
      matchScore,
      matchBreakdown: {
        skillMatchPct: Math.round(skillMatch * 100),
        interestMatchPct: Math.round(interestMatch * 100),
        feasibilityPct: Math.round(feasibility * 100),
      },
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

function stripJoinTables({ ideaSkills, ideaInterests, ...idea }) {
  return idea;
}

module.exports = { getRecommendationsForUser, BUDGET_RANGES, DIFFICULTY_RANK };