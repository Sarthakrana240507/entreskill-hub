/**
 * Integration tests for the Auth API.
 *
 * These tests run against the real Express app and a real test database
 * (set TEST_DATABASE_URL / DATABASE_URL to a disposable Postgres schema before
 * running, e.g. `entreskill_hub_test`). See docs/TESTING.md for setup.
 *
 * They are intentionally skipped in environments with no DATABASE_URL configured
 * (e.g. a bare CI checkout before the database service is provisioned) so the
 * suite fails loudly only when it should, rather than erroring on missing infra.
 */
const request = require('supertest');

const hasDb = Boolean(process.env.DATABASE_URL);
const describeOrSkip = hasDb ? describe : describe.skip;

describeOrSkip('Auth API (integration)', () => {
  let app;
  let prisma;

  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'StrongPass1',
  };

  beforeAll(() => {
    app = require('../app');
    prisma = require('../config/prisma');
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  test('POST /api/v1/auth/register creates a new account and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('POST /api/v1/auth/register rejects a duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('POST /api/v1/auth/register rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: `weak_${Date.now()}@example.com`, password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/auth/login succeeds with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('POST /api/v1/auth/login fails with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/auth/me returns the caller profile with a valid token', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const { accessToken } = loginRes.body.data;

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });
});
