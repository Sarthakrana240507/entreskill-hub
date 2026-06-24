const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EntreSkill Hub API',
      version: '1.0.0',
      description:
        'REST API for the EntreSkill Hub Skill-to-Startup Enablement Platform. ' +
        'Provides skill/interest profiling, business idea recommendations, business roadmaps, ' +
        'learning resources, mentorship, and admin moderation.',
      contact: { name: 'EntreSkill Hub Engineering' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: '/api/v1', description: 'Current server (relative)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'BAD_REQUEST' },
                message: { type: 'string', example: 'Validation failed' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

const baseSpec = swaggerJsdoc(options);

// Merge in the hand-written path definitions (more maintainable than scattering
// JSDoc annotations across every route file for a project of this size).
const pathsFile = path.join(__dirname, '..', 'docs', 'paths.yaml');
const pathsDoc = yaml.load(fs.readFileSync(pathsFile, 'utf8'));
baseSpec.paths = { ...baseSpec.paths, ...pathsDoc.paths };

module.exports = baseSpec;
