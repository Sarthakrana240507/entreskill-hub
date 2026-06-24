// Unit tests for the recommendation engine. We test the engine module in
// isolation by mocking the Prisma client, since this is pure scoring logic
// and should not require a live database to verify correctness.

jest.mock('../config/prisma', () => ({
  skillProfile: { findUnique: jest.fn() },
  businessIdea: { findMany: jest.fn() },
}));

const prisma = require('../config/prisma');
const { getRecommendationsForUser } = require('../utils/recommendationEngine');

describe('Recommendation Engine', () => {
  afterEach(() => jest.clearAllMocks());

  const baseIdea = {
    id: 'idea-1',
    title: 'Home Tailoring',
    difficulty: 'BEGINNER',
    estimatedCostMin: 1000,
    estimatedCostMax: 10000,
    createdAt: new Date(),
  };

  test('returns unscored ideas when the user has no profile yet', async () => {
    prisma.skillProfile.findUnique.mockResolvedValue(null);
    prisma.businessIdea.findMany.mockResolvedValue([
      { ...baseIdea, ideaSkills: [], ideaInterests: [] },
    ]);

    const results = await getRecommendationsForUser('user-1');

    expect(results).toHaveLength(1);
    expect(results[0].matchScore).toBeNull();
  });

  test('gives a perfect skill match idea a higher score than a zero-skill-match idea', async () => {
    prisma.skillProfile.findUnique.mockResolvedValue({
      experienceLevel: 'BEGINNER',
      budgetRange: 'UNDER_5000',
      skills: [{ skillId: 'skill-tailoring', proficiency: 5 }],
      interests: [{ interestId: 'interest-home' }],
    });

    prisma.businessIdea.findMany.mockResolvedValue([
      {
        ...baseIdea,
        id: 'idea-match',
        ideaSkills: [{ skillId: 'skill-tailoring', weight: 5 }],
        ideaInterests: [{ interestId: 'interest-home' }],
      },
      {
        ...baseIdea,
        id: 'idea-nomatch',
        ideaSkills: [{ skillId: 'skill-baking', weight: 5 }],
        ideaInterests: [{ interestId: 'interest-other' }],
      },
    ]);

    const results = await getRecommendationsForUser('user-1');
    const matchIdea = results.find((r) => r.id === 'idea-match');
    const noMatchIdea = results.find((r) => r.id === 'idea-nomatch');

    expect(matchIdea.matchScore).toBeGreaterThan(noMatchIdea.matchScore);
    expect(matchIdea.matchScore).toBeGreaterThanOrEqual(80);
  });

  test('rewards ideas whose difficulty matches the user experience level', async () => {
    prisma.skillProfile.findUnique.mockResolvedValue({
      experienceLevel: 'ADVANCED',
      budgetRange: 'ABOVE_100000',
      skills: [],
      interests: [],
    });

    prisma.businessIdea.findMany.mockResolvedValue([
      { ...baseIdea, id: 'idea-advanced', difficulty: 'ADVANCED', ideaSkills: [], ideaInterests: [] },
      { ...baseIdea, id: 'idea-beginner', difficulty: 'BEGINNER', ideaSkills: [], ideaInterests: [] },
    ]);

    const results = await getRecommendationsForUser('user-1');
    const advanced = results.find((r) => r.id === 'idea-advanced');
    const beginner = results.find((r) => r.id === 'idea-beginner');

    expect(advanced.matchScore).toBeGreaterThan(beginner.matchScore);
  });

  test('results are sorted descending by matchScore', async () => {
    prisma.skillProfile.findUnique.mockResolvedValue({
      experienceLevel: 'BEGINNER',
      budgetRange: 'UNDER_5000',
      skills: [{ skillId: 'skill-a', proficiency: 3 }],
      interests: [],
    });

    prisma.businessIdea.findMany.mockResolvedValue([
      { ...baseIdea, id: 'idea-low', ideaSkills: [], ideaInterests: [] },
      { ...baseIdea, id: 'idea-high', ideaSkills: [{ skillId: 'skill-a', weight: 5 }], ideaInterests: [] },
    ]);

    const results = await getRecommendationsForUser('user-1');
    expect(results[0].matchScore).toBeGreaterThanOrEqual(results[1].matchScore);
  });
});
