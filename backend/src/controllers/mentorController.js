const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, ConflictError, ForbiddenError, BadRequestError } = require('../utils/errors');

/**
 * POST /api/v1/mentors/apply
 * A logged-in USER (or MENTOR-role account without a profile yet) submits a
 * mentor application. Goes to PENDING until an admin approves it.
 */
const applyAsMentor = asyncHandler(async (req, res) => {
  const existing = await prisma.mentorProfile.findUnique({ where: { userId: req.user.id } });
  if (existing) throw new ConflictError('You have already submitted a mentor application');

  const { expertiseSkillIds, ...fields } = req.body;

  const profile = await prisma.mentorProfile.create({
    data: {
      userId: req.user.id,
      ...fields,
      status: 'PENDING',
      expertise: { create: expertiseSkillIds.map((skillId) => ({ skillId })) },
    },
    include: { expertise: { include: { skill: true } } },
  });

  res.status(201).json({ success: true, data: { mentorProfile: profile } });
});

/**
 * GET /api/v1/mentors
 * Public directory — only APPROVED mentors are listed.
 */
const listMentors = asyncHandler(async (req, res) => {
  const { skillId, page = 1, limit = 20 } = req.query;

  const where = {
    status: 'APPROVED',
    ...(skillId ? { expertise: { some: { skillId } } } : {}),
  };

  const mentors = await prisma.mentorProfile.findMany({
    where,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      expertise: { include: { skill: true } },
    },
    orderBy: { yearsExperience: 'desc' },
  });

  res.status(200).json({ success: true, data: { mentors } });
});

/**
 * GET /api/v1/mentors/:id
 */
const getMentor = asyncHandler(async (req, res) => {
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, createdAt: true } },
      expertise: { include: { skill: true } },
    },
  });
  if (!mentor || mentor.status !== 'APPROVED') throw new NotFoundError('Mentor not found');
  res.status(200).json({ success: true, data: { mentor } });
});

/**
 * GET /api/v1/mentors/applications/pending — Admin only
 */
const listPendingApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.mentorProfile.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { id: true, name: true, email: true } }, expertise: { include: { skill: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.status(200).json({ success: true, data: { applications } });
});

/**
 * PATCH /api/v1/mentors/:id/review — Admin only: approve or reject a mentor application
 */
const reviewMentorApplication = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  const mentor = await prisma.mentorProfile.update({
    where: { id: req.params.id },
    data: {
      status,
      verifiedAt: status === 'APPROVED' ? new Date() : null,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    },
  });

  await prisma.auditLog.create({
    data: { actorId: req.user.id, action: `MENTOR_${status}`, targetType: 'MENTOR_PROFILE', targetId: mentor.id },
  });

  await prisma.notification.create({
    data: {
      userId: mentor.userId,
      title: status === 'APPROVED' ? 'Mentor application approved' : 'Mentor application update',
      body:
        status === 'APPROVED'
          ? 'Congratulations! Your mentor application has been approved. You can now appear in the mentor directory.'
          : `Your mentor application was not approved. Reason: ${rejectionReason || 'Not specified'}`,
    },
  });

  res.status(200).json({ success: true, data: { mentor } });
});

/**
 * GET /api/v1/mentors/me/mentees — Mentor dashboard: engagement across questions + sessions
 */
const getMyMenteeEngagement = asyncHandler(async (req, res) => {
  const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId: req.user.id } });
  if (!mentorProfile) throw new NotFoundError('Mentor profile not found');

  const [questions, sessions] = await Promise.all([
    prisma.question.findMany({
      where: { mentorId: mentorProfile.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mentorshipSession.findMany({
      where: { mentorId: mentorProfile.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'desc' },
    }),
  ]);

  const uniqueMenteeIds = new Set([...questions.map((q) => q.userId), ...sessions.map((s) => s.userId)]);

  res.status(200).json({
    success: true,
    data: {
      totalMentees: uniqueMenteeIds.size,
      unansweredQuestions: questions.filter((q) => !q.answer).length,
      upcomingSessions: sessions.filter((s) => s.status === 'SCHEDULED' && s.scheduledAt > new Date()).length,
      questions,
      sessions,
    },
  });
});

// -------------------- Q&A --------------------

/**
 * POST /api/v1/questions — a USER asks a question, optionally targeted at a specific mentor
 */
const askQuestion = asyncHandler(async (req, res) => {
  const question = await prisma.question.create({
    data: { userId: req.user.id, ...req.body },
  });
  res.status(201).json({ success: true, data: { question } });
});

/**
 * GET /api/v1/questions/mine
 */
const listMyQuestions = asyncHandler(async (req, res) => {
  const questions = await prisma.question.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { questions } });
});

/**
 * PATCH /api/v1/questions/:id/answer — Mentor answers a question directed at them (or unclaimed)
 */
const answerQuestion = asyncHandler(async (req, res) => {
  const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId: req.user.id } });
  if (!mentorProfile || mentorProfile.status !== 'APPROVED') {
    throw new ForbiddenError('Only approved mentors can answer questions');
  }

  const question = await prisma.question.findUnique({ where: { id: req.params.id } });
  if (!question) throw new NotFoundError('Question not found');
  if (question.mentorId && question.mentorId !== mentorProfile.id) {
    throw new ForbiddenError('This question was directed at a different mentor');
  }

  const updated = await prisma.question.update({
    where: { id: req.params.id },
    data: { answer: req.body.answer, answeredAt: new Date(), mentorId: mentorProfile.id },
  });

  await prisma.notification.create({
    data: { userId: question.userId, title: 'Your question was answered', body: `"${question.title}" has a new answer.` },
  });

  res.status(200).json({ success: true, data: { question: updated } });
});

// -------------------- Mentorship Sessions --------------------

/**
 * POST /api/v1/sessions — USER requests a session with an approved mentor
 */
const requestSession = asyncHandler(async (req, res) => {
  const mentor = await prisma.mentorProfile.findUnique({ where: { id: req.body.mentorId } });
  if (!mentor || mentor.status !== 'APPROVED') throw new BadRequestError('Selected mentor is not available');

  const session = await prisma.mentorshipSession.create({
    data: { userId: req.user.id, ...req.body },
  });

  res.status(201).json({ success: true, data: { session } });
});

/**
 * PATCH /api/v1/sessions/:id — Mentor updates session status (confirm/complete/cancel)
 */
const updateSession = asyncHandler(async (req, res) => {
  const mentorProfile = await prisma.mentorProfile.findUnique({ where: { userId: req.user.id } });
  const session = await prisma.mentorshipSession.findUnique({ where: { id: req.params.id } });

  if (!session) throw new NotFoundError('Session not found');
  if (!mentorProfile || session.mentorId !== mentorProfile.id) {
    throw new ForbiddenError('You can only update your own sessions');
  }

  const updated = await prisma.mentorshipSession.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).json({ success: true, data: { session: updated } });
});

/**
 * GET /api/v1/sessions/mine — for the logged-in USER
 */
const listMySessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.mentorshipSession.findMany({
    where: { userId: req.user.id },
    include: { mentor: { include: { user: { select: { name: true } } } } },
    orderBy: { scheduledAt: 'desc' },
  });
  res.status(200).json({ success: true, data: { sessions } });
});

module.exports = {
  applyAsMentor,
  listMentors,
  getMentor,
  listPendingApplications,
  reviewMentorApplication,
  getMyMenteeEngagement,
  askQuestion,
  listMyQuestions,
  answerQuestion,
  requestSession,
  updateSession,
  listMySessions,
};
