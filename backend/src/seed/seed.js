/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function main() {
  console.log('Seeding database...');

  // ---- Skills ----
  const skillData = [
    { name: 'Tailoring & Stitching', category: 'Apparel' },
    { name: 'Embroidery', category: 'Craft' },
    { name: 'Baking', category: 'Food' },
    { name: 'Home Cooking', category: 'Food' },
    { name: 'Mobile Repair', category: 'Repair' },
    { name: 'Graphic Design', category: 'Digital' },
    { name: 'Social Media Management', category: 'Digital' },
    { name: 'Candle & Soap Making', category: 'Craft' },
  ];
  const skills = {};
  for (const s of skillData) {
    skills[s.name] = await prisma.skill.upsert({ where: { name: s.name }, create: s, update: {} });
  }

  // ---- Interests ----
  const interestNames = ['Working from home', 'Selling online', 'Working with hands', 'Helping the local community', 'Flexible hours'];
  const interests = {};
  for (const name of interestNames) {
    interests[name] = await prisma.interest.upsert({ where: { name }, create: { name }, update: {} });
  }

  // ---- Users ----
  const passwordHash = await bcrypt.hash('Password1', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@entreskillhub.com' },
    create: { name: 'Platform Admin', email: 'admin@entreskillhub.com', passwordHash, role: 'ADMIN', isEmailVerified: true },
    update: {},
  });

  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@entreskillhub.com' },
    create: { name: 'Priya Sharma', email: 'mentor@entreskillhub.com', passwordHash, role: 'MENTOR', isEmailVerified: true },
    update: {},
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@entreskillhub.com' },
    create: { name: 'Ravi Kumar', email: 'user@entreskillhub.com', passwordHash, role: 'USER', isEmailVerified: true },
    update: {},
  });

  // ---- Mentor Profile ----
  const mentorProfile = await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    create: {
      userId: mentorUser.id,
      headline: 'Boutique owner & textile entrepreneur, 12 years',
      bio: 'I started a home-based tailoring business in 2012 and grew it into a 3-person boutique. I love helping new tailors price their work and find their first customers.',
      yearsExperience: 12,
      status: 'APPROVED',
      verifiedAt: new Date(),
      expertise: { create: [{ skillId: skills['Tailoring & Stitching'].id }, { skillId: skills['Embroidery'].id }] },
    },
    update: {},
  });

  // ---- Demo user skill profile ----
  const skillProfile = await prisma.skillProfile.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      experienceLevel: 'BEGINNER',
      availableHours: 15,
      budgetRange: 'UNDER_5000',
      location: 'Jaipur, Rajasthan',
      bio: 'I know basic tailoring from helping my mother and want to start something small from home.',
      skills: { create: [{ skillId: skills['Tailoring & Stitching'].id, proficiency: 3 }] },
      interests: { create: [{ interestId: interests['Working from home'].id }, { interestId: interests['Selling online'].id }] },
    },
    update: {},
  });

  // ---- Business Ideas ----
  const ideasData = [
    {
      title: 'Home-Based Tailoring & Alterations Service',
      slug: 'home-tailoring-alterations',
      summary: 'Offer stitching, alterations, and custom clothing from a home workspace.',
      description:
        'Start by offering alteration services (hemming, resizing) to neighbors and local shops, then expand into custom stitching for blouses, kurtas, and school uniforms. Low starting investment if you already own a sewing machine.',
      difficulty: 'BEGINNER',
      estimatedCostMin: 3000,
      estimatedCostMax: 15000,
      timeToLaunchDays: 14,
      category: 'Apparel',
      skillKeys: [{ key: 'Tailoring & Stitching', weight: 5 }, { key: 'Embroidery', weight: 2 }],
      interestKeys: ['Working from home', 'Working with hands'],
    },
    {
      title: 'Home Bakery — Cakes & Snacks on Order',
      slug: 'home-bakery-cakes-snacks',
      summary: 'Sell baked goods on order via WhatsApp and Instagram from your home kitchen.',
      description:
        'Begin with a small menu (2-3 cake flavors, one snack item) and take pre-orders. Use social media and word-of-mouth for your first 20 customers. Requires an FSSAI basic registration in most regions.',
      difficulty: 'BEGINNER',
      estimatedCostMin: 5000,
      estimatedCostMax: 25000,
      timeToLaunchDays: 21,
      category: 'Food',
      skillKeys: [{ key: 'Baking', weight: 5 }, { key: 'Social Media Management', weight: 2 }],
      interestKeys: ['Working from home', 'Selling online'],
    },
    {
      title: 'Mobile Phone Repair Kiosk',
      slug: 'mobile-repair-kiosk',
      summary: 'Set up a small kiosk or table-based service repairing phone screens and batteries.',
      description:
        'Start with the most common repairs (screen replacement, battery swap, charging port) for popular phone brands in your area. A small toolkit and a steady supply of spare parts are the main upfront costs.',
      difficulty: 'INTERMEDIATE',
      estimatedCostMin: 15000,
      estimatedCostMax: 60000,
      timeToLaunchDays: 30,
      category: 'Repair',
      skillKeys: [{ key: 'Mobile Repair', weight: 5 }],
      interestKeys: ['Working with hands', 'Helping the local community'],
    },
    {
      title: 'Freelance Social Media Management for Local Shops',
      slug: 'freelance-social-media-local-shops',
      summary: 'Manage Instagram/Facebook pages for local shops that have no online presence.',
      description:
        'Approach 5-10 local businesses (salons, boutiques, restaurants) offering a simple monthly package: weekly posts, basic design, and reply management. No physical inventory required — just a laptop/phone and design tools.',
      difficulty: 'BEGINNER',
      estimatedCostMin: 0,
      estimatedCostMax: 5000,
      timeToLaunchDays: 10,
      category: 'Digital',
      skillKeys: [{ key: 'Social Media Management', weight: 5 }, { key: 'Graphic Design', weight: 3 }],
      interestKeys: ['Working from home', 'Flexible hours', 'Selling online'],
    },
    {
      title: 'Handmade Candles & Soaps Business',
      slug: 'handmade-candles-soaps',
      summary: 'Craft and sell scented candles and natural soaps online and at local markets.',
      description:
        'Start with 3-4 candle scents and 2 soap variants. Sell via Instagram, local craft fairs, and word of mouth. Packaging and presentation matter a lot for repeat sales in this category.',
      difficulty: 'BEGINNER',
      estimatedCostMin: 4000,
      estimatedCostMax: 20000,
      timeToLaunchDays: 18,
      category: 'Craft',
      skillKeys: [{ key: 'Candle & Soap Making', weight: 5 }],
      interestKeys: ['Working with hands', 'Selling online'],
    },
  ];

  for (const idea of ideasData) {
    const { skillKeys, interestKeys, ...fields } = idea;
    const created = await prisma.businessIdea.upsert({
      where: { slug: idea.slug },
      create: {
        ...fields,
        createdById: admin.id,
        ideaSkills: { create: skillKeys.map((s) => ({ skillId: skills[s.key].id, weight: s.weight })) },
        ideaInterests: { create: interestKeys.map((k) => ({ interestId: interests[k].id })) },
      },
      update: {},
    });

    // Attach a roadmap if one doesn't already exist for this idea
    const existingRoadmap = await prisma.roadmap.findUnique({ where: { businessIdeaId: created.id } });
    if (!existingRoadmap) {
      await prisma.roadmap.create({
        data: {
          businessIdeaId: created.id,
          title: `Launch Roadmap: ${created.title}`,
          steps: {
            create: [
              { order: 1, phase: 'VALIDATION', title: 'Validate demand', description: 'Talk to 10 potential customers in your area to confirm interest and acceptable pricing.', estDays: 5 },
              { order: 2, phase: 'SKILLS_TOOLS', title: 'List required skills & tools', description: 'Identify the core skill gaps and the minimum toolkit needed to deliver your first order.', estDays: 3 },
              { order: 3, phase: 'LEGAL', title: 'Complete basic registration', description: 'Register under Udyam (MSME) and any category-specific license (e.g. FSSAI for food businesses).', estDays: 7 },
              { order: 4, phase: 'COST', title: 'Build a starter budget', description: 'List one-time setup costs and recurring monthly costs; decide your starting price per unit/service.', estDays: 2 },
              { order: 5, phase: 'MARKETING', title: 'Set up your first sales channel', description: 'Create a WhatsApp Business profile or Instagram page and announce to your existing network.', estDays: 4 },
              { order: 6, phase: 'LAUNCH', title: 'Deliver your first 5 orders', description: 'Fulfil your first five orders carefully and collect feedback/testimonials for future marketing.', estDays: 10 },
            ],
          },
        },
      });
    }
  }

  // ---- Sample resource ----
  const firstIdea = await prisma.businessIdea.findUnique({ where: { slug: 'home-tailoring-alterations' } });
  await prisma.resource.upsert({
    where: { id: 'seed-resource-1' },
    create: {
      id: 'seed-resource-1',
      title: 'Pricing Your Alteration Services: A Beginner Checklist',
      type: 'CHECKLIST',
      url: 'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs',
      description: 'A simple checklist for setting your first price list as a home tailor.',
      businessIdeaId: firstIdea.id,
      uploadedById: mentorUser.id,
      status: 'APPROVED',
    },
    update: {},
  });

  // ---- Sample roadmap progress for demo user ----
  const tailoringRoadmap = await prisma.roadmap.findUnique({ where: { businessIdeaId: firstIdea.id }, include: { steps: true } });
  const userRoadmap = await prisma.userRoadmap.upsert({
    where: { userId_roadmapId: { userId: demoUser.id, roadmapId: tailoringRoadmap.id } },
    create: {
      userId: demoUser.id,
      roadmapId: tailoringRoadmap.id,
      status: 'IN_PROGRESS',
      progressPct: 33,
      stepProgress: {
        create: tailoringRoadmap.steps.map((s) => ({ roadmapStepId: s.id, isComplete: s.order <= 2 })),
      },
    },
    update: {},
  });

  console.log('Seed complete.');
  console.log('---');
  console.log('Demo accounts (password for all: Password1):');
  console.log('  Admin:  admin@entreskillhub.com');
  console.log('  Mentor: mentor@entreskillhub.com');
  console.log('  User:   user@entreskillhub.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
