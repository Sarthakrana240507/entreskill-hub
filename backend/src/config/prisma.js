const { PrismaClient } = require('@prisma/client');
const config = require('../config/env');

const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.isProduction ? ['error', 'warn'] : ['warn', 'error'],
  });

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
