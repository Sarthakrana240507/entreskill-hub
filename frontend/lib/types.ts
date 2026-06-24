export type Role = "USER" | "MENTOR" | "ADMIN";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ResourceType = "VIDEO" | "ARTICLE" | "CHECKLIST";
export type RoadmapStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type MentorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface MatchBreakdown {
  skillMatchPct: number;
  interestMatchPct: number;
  feasibilityPct: number;
}

export interface BusinessIdea {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  difficulty: Difficulty;
  estimatedCostMin: number;
  estimatedCostMax: number;
  timeToLaunchDays: number;
  category: string;
  isPublished: boolean;
  createdAt: string;
  matchScore?: number | null;
  matchBreakdown?: MatchBreakdown | null;
  isBookmarked?: boolean;
  ideaSkills?: Array<{ skill: Skill; weight: number }>;
  ideaInterests?: Array<{ interest: Interest }>;
  roadmap?: Roadmap;
  resources?: Resource[];
}

export interface RoadmapStep {
  id: string;
  order: number;
  phase: "VALIDATION" | "SKILLS_TOOLS" | "LEGAL" | "COST" | "MARKETING" | "LAUNCH";
  title: string;
  description: string;
  estDays: number;
}

export interface Roadmap {
  id: string;
  title: string;
  businessIdeaId: string;
  steps: RoadmapStep[];
  businessIdea?: BusinessIdea;
}

export interface UserStepProgress {
  id: string;
  roadmapStepId: string;
  isComplete: boolean;
  roadmapStep?: RoadmapStep;
}

export interface UserRoadmap {
  id: string;
  status: RoadmapStatus;
  progressPct: number;
  startedAt: string;
  roadmap: Roadmap;
  stepProgress: UserStepProgress[];
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  description?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  businessIdeaId?: string | null;
  createdAt: string;
}

export interface MentorProfile {
  id: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  status: MentorStatus;
  user: { id: string; name: string; avatarUrl?: string | null };
  expertise: Array<{ skill: Skill }>;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  answer?: string | null;
  answeredAt?: string | null;
  createdAt: string;
  user?: { id: string; name: string };
}

export interface MentorshipSession {
  id: string;
  scheduledAt: string;
  durationMin: number;
  status: "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  mentor?: { user: { name: string } };
}

export interface SkillProfile {
  id: string;
  experienceLevel: Difficulty;
  availableHours: number;
  budgetRange: string;
  location?: string | null;
  bio?: string | null;
  skills: Array<{ skill: Skill; proficiency: number }>;
  interests: Array<{ interest: Interest }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
