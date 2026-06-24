const request = require('supertest');

const hasDb = Boolean(process.env.DATABASE_URL);
const describeOrSkip = hasDb ? describe : describe.skip;

/**
 * End-to-end test: simulates a brand-new aspiring entrepreneur going through
 * the full core journey the platform promises —
 *   register -> build skill profile -> get recommendations -> bookmark an idea
 *   -> start its roadmap -> complete a step -> see updated progress on the dashboard.
 */
describeOrSkip('Core user journey (end-to-end)', () => {
  let app;
  let prisma;
  let accessToken;
  let userId;
  let tailoringSkillId;
  let homeInterestId;
  let firstIdeaId;
  let firstRoadmapId;
  let userRoadmapId;
  let firstStepId;

  const journeyUser = { name: 'Journey User', email: `journey_${Date.now()}@example.com`, password: 'StrongPass1' };

  beforeAll(async () => {
    app = require('../app');
    prisma = require('../config/prisma');

    const registerRes = await request(app).post('/api/v1/auth/register').send(journeyUser);
    accessToken = registerRes.body.data.accessToken;
    userId = registerRes.body.data.user.id;

    const skill = await prisma.skill.findFirst({ where: { name: { contains: 'Tailoring' } } });
    const interest = await prisma.interest.findFirst({ where: { name: { contains: 'home' } } });
    tailoringSkillId = skill?.id;
    homeInterestId = interest?.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: journeyUser.email } });
    await prisma.$disconnect();
  });

  test('Step 1: builds a skill profile', async () => {
    if (!tailoringSkillId) return; // seed data not present in this environment
    const res = await request(app)
      .put('/api/v1/profile/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        experienceLevel: 'BEGINNER',
        availableHours: 10,
        budgetRange: 'UNDER_5000',
        skills: [{ skillId: tailoringSkillId, proficiency: 4 }],
        interestIds: homeInterestId ? [homeInterestId] : [],
      });

    expect(res.status).toBe(200);
    expect(res.body.data.profile.skills.length).toBeGreaterThan(0);
  });

  test('Step 2: receives personalized recommendations', async () => {
    const res = await request(app).get('/api/v1/ideas?recommended=true').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.ideas)).toBe(true);

    if (res.body.data.ideas.length > 0) {
      firstIdeaId = res.body.data.ideas[0].id;
    }
  });

  test('Step 3: bookmarks the top recommended idea', async () => {
    if (!firstIdeaId) return;
    const res = await request(app)
      .post(`/api/v1/ideas/${firstIdeaId}/bookmark`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect([200, 201]).toContain(res.status);
  });

  test('Step 4: fetches the idea detail including its roadmap', async () => {
    if (!firstIdeaId) return;
    const res = await request(app).get(`/api/v1/ideas/${firstIdeaId}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    if (res.body.data.idea.roadmap) {
      firstRoadmapId = res.body.data.idea.roadmap.id;
      firstStepId = res.body.data.idea.roadmap.steps[0]?.id;
    }
  });

  test('Step 5: starts the roadmap', async () => {
    if (!firstRoadmapId) return;
    const res = await request(app)
      .post(`/api/v1/roadmaps/${firstRoadmapId}/start`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    userRoadmapId = res.body.data.userRoadmap.id;
  });

  test('Step 6: completes the first roadmap step and sees progress update', async () => {
    if (!userRoadmapId || !firstStepId) return;
    const res = await request(app)
      .patch(`/api/v1/roadmaps/progress/${userRoadmapId}/steps/${firstStepId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isComplete: true });

    expect(res.status).toBe(200);
    expect(res.body.data.userRoadmap.progressPct).toBeGreaterThan(0);
  });

  test('Step 7: progress dashboard reflects the started roadmap', async () => {
    if (!userRoadmapId) return;
    const res = await request(app).get('/api/v1/roadmaps/progress/mine').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const match = res.body.data.userRoadmaps.find((ur) => ur.id === userRoadmapId);
    expect(match).toBeDefined();
    expect(match.status).not.toBe('NOT_STARTED');
  });
});
