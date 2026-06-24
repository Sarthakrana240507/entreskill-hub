const { z } = require('zod');

const createResourceSchema = z.object({
  title: z.string().trim().min(3).max(150),
  type: z.enum(['VIDEO', 'ARTICLE', 'CHECKLIST']),
  url: z.string().trim().url('Must be a valid URL'),
  description: z.string().trim().max(1000).optional(),
  businessIdeaId: z.string().uuid().optional(),
});

const resourceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['VIDEO', 'ARTICLE', 'CHECKLIST']).optional(),
  businessIdeaId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

const mentorApplicationSchema = z.object({
  headline: z.string().trim().min(5).max(150),
  bio: z.string().trim().min(30).max(2000),
  yearsExperience: z.number().int().min(0).max(60),
  linkedinUrl: z.string().trim().url().optional(),
  expertiseSkillIds: z.array(z.string().uuid()).min(1, 'Select at least one area of expertise'),
});

const mentorReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().trim().max(500).optional(),
});

const questionSchema = z.object({
  title: z.string().trim().min(5).max(150),
  body: z.string().trim().min(10).max(3000),
  mentorId: z.string().uuid().optional(),
});

const answerSchema = z.object({
  answer: z.string().trim().min(5).max(5000),
});

const sessionRequestSchema = z.object({
  mentorId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
  durationMin: z.number().int().min(15).max(180).default(30),
  notes: z.string().trim().max(500).optional(),
});

const sessionUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().trim().max(500).optional(),
});

const feedbackSchema = z.object({
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(5).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

const reportSchema = z.object({
  targetType: z.enum(['USER', 'MENTOR', 'RESOURCE', 'QUESTION']),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(10).max(1000),
});

const reportReviewSchema = z.object({
  status: z.enum(['IN_REVIEW', 'RESOLVED', 'DISMISSED']),
  resolutionNote: z.string().trim().max(1000).optional(),
});

module.exports = {
  createResourceSchema,
  resourceQuerySchema,
  mentorApplicationSchema,
  mentorReviewSchema,
  questionSchema,
  answerSchema,
  sessionRequestSchema,
  sessionUpdateSchema,
  feedbackSchema,
  reportSchema,
  reportReviewSchema,
};
