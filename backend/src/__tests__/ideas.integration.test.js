const request = require('supertest');

const hasDb = Boolean(process.env.DATABASE_URL);
const describeOrSkip = hasDb ? describe : describe.skip;

describeOrSkip('Business Ideas API (integration)', () => {
  let app;
  let prisma;
  let accessToken;
  let adminToken;
  let createdIdeaId;

  const user = { name: 'Idea Tester', email: `idea_test_${Date.now()}@example.com`, password: 'StrongPass1' };
  const admin = { name: 'Idea Admin', email: `idea_admin_${Date.now()}@example.com`, password: 'StrongPass1', role: 'ADMIN' };

  beforeAll(async () => {
    app = require('../app');
    prisma = require('../config/prisma');

    const userRes = await request(app).post('/api/v1/auth/register').send(user);
    accessToken = userRes.body.data.accessToken;

    // Directly elevate a registered account to ADMIN for this test only,
    // since the public register endpoint intentionally cannot create admins.
    const registeredAdmin = await request(app).post('/api/v1/auth/register').send({ ...admin, role: 'USER' });
    await prisma.user.update({ where: { email: admin.email }, data: { role: 'ADMIN' } });
    const adminLogin = await request(app).post('/api/v1/auth/login').send({ email: admin.email, password: admin.password });
    adminToken = adminLogin.body.data.accessToken;
  });

  afterAll(async () => {
    if (createdIdeaId) await prisma.businessIdea.delete({ where: { id: createdIdeaId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { in: [user.email, admin.email] } } });
    await prisma.$disconnect();
  });

  test('GET /api/v1/ideas returns a public, paginated list', async () => {
    const res = await request(app).get('/api/v1/ideas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.ideas)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  test('POST /api/v1/ideas is rejected for a non-admin user', async () => {
    const res = await request(app)
      .post('/api/v1/ideas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Unauthorized Idea',
        summary: 'Should not be created',
        description: 'This request should fail authorization checks.',
        difficulty: 'BEGINNER',
        estimatedCostMin: 100,
        estimatedCostMax: 200,
        category: 'Test',
      });
    expect(res.status).toBe(403);
  });

  test('POST /api/v1/ideas succeeds for an admin and returns the created idea', async () => {
    const res = await request(app)
      .post('/api/v1/ideas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Test Idea ${Date.now()}`,
        summary: 'A short summary of at least ten characters.',
        description: 'A longer description of the business idea for testing purposes.',
        difficulty: 'BEGINNER',
        estimatedCostMin: 1000,
        estimatedCostMax: 5000,
        category: 'Test',
        skillIds: [],
        interestIds: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.idea.id).toBeDefined();
    createdIdeaId = res.body.data.idea.id;
  });

  test('GET /api/v1/ideas/:id returns 404 for a non-existent idea', async () => {
    const res = await request(app).get('/api/v1/ideas/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/ideas/:id/bookmark toggles a bookmark for the caller', async () => {
    const addRes = await request(app)
      .post(`/api/v1/ideas/${createdIdeaId}/bookmark`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.bookmarked).toBe(true);

    const removeRes = await request(app)
      .post(`/api/v1/ideas/${createdIdeaId}/bookmark`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.bookmarked).toBe(false);
  });

  test('GET /api/v1/ideas?recommended=true returns personalized results for an authenticated user', async () => {
    const res = await request(app).get('/api/v1/ideas?recommended=true').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.personalized).toBe(true);
  });
});
