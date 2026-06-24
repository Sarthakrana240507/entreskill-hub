const { z } = require('zod');

const ideaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  search: z.string().trim().optional(),
  recommended: z.coerce.boolean().optional().default(false),
});

const createIdeaBaseSchema = z.object({
  title: z.string().trim().min(3).max(150),
  summary: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedCostMin: z.number().int().min(0),
  estimatedCostMax: z.number().int().min(0),
  timeToLaunchDays: z.number().int().min(1).default(30),
  category: z.string().trim().min(2).max(60),
  skillIds: z.array(z.object({ skillId: z.string().uuid(), weight: z.number().int().min(1).max(5).default(3) })).default([]),
  interestIds: z.array(z.string().uuid()).default([]),
  isPublished: z.boolean().default(true),
});

const createIdeaSchema = createIdeaBaseSchema.refine((data) => data.estimatedCostMax >= data.estimatedCostMin, {
  message: 'estimatedCostMax must be greater than or equal to estimatedCostMin',
  path: ['estimatedCostMax'],
});

const updateIdeaSchema = createIdeaBaseSchema.partial().refine((data) => {
  if (data.estimatedCostMax !== undefined && data.estimatedCostMin !== undefined) {
    return data.estimatedCostMax >= data.estimatedCostMin;
  }
  return true;
}, {
  message: 'estimatedCostMax must be greater than or equal to estimatedCostMin',
  path: ['estimatedCostMax'],
});

const roadmapStepSchema = z.object({
  order: z.number().int().min(1),
  phase: z.enum(['VALIDATION', 'SKILLS_TOOLS', 'LEGAL', 'COST', 'MARKETING', 'LAUNCH']),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10),
  estDays: z.number().int().min(1).default(3),
});

const createRoadmapSchema = z.object({
  title: z.string().trim().min(3).max(150),
  steps: z.array(roadmapStepSchema).min(1, 'A roadmap must have at least one step'),
});

const updateStepProgressSchema = z.object({
  isComplete: z.boolean(),
});

module.exports = {
  ideaQuerySchema,
  createIdeaSchema,
  updateIdeaSchema,
  createRoadmapSchema,
  roadmapStepSchema,
  updateStepProgressSchema,
};
