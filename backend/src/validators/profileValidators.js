const { z } = require('zod');

const upsertProfileSchema = z.object({
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  availableHours: z.number().int().min(1).max(168).optional(),
  budgetRange: z.enum(['UNDER_5000', '5000_25000', '25000_100000', 'ABOVE_100000']).optional(),
  location: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(1000).optional(),
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid(),
        proficiency: z.number().int().min(1).max(5).default(1),
      })
    )
    .optional(),
  interestIds: z.array(z.string().uuid()).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { upsertProfileSchema, paginationSchema };
