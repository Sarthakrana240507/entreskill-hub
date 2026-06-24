const express = require('express');
const ideaCtrl = require('../controllers/ideaController');
const roadmapCtrl = require('../controllers/roadmapController');
const validate = require('../middleware/validate');
const { authenticate, attachUserIfPresent } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { ideaQuerySchema, createIdeaSchema, updateIdeaSchema, createRoadmapSchema } = require('../validators/ideaValidators');

const router = express.Router();

// Public + personalized listing
router.get('/', attachUserIfPresent, validate({ query: ideaQuerySchema }), ideaCtrl.listIdeas);
router.get('/bookmarks/mine', authenticate, ideaCtrl.listMyBookmarks);
router.get('/:id', attachUserIfPresent, ideaCtrl.getIdea);

// Admin curation
router.post('/', authenticate, requireRole('ADMIN'), validate({ body: createIdeaSchema }), ideaCtrl.createIdea);
router.patch('/:id', authenticate, requireRole('ADMIN'), validate({ body: updateIdeaSchema }), ideaCtrl.updateIdea);
router.delete('/:id', authenticate, requireRole('ADMIN'), ideaCtrl.deleteIdea);

// Bookmarks
router.post('/:id/bookmark', authenticate, ideaCtrl.toggleBookmark);

// Roadmap nested under idea
router.post(
  '/:ideaId/roadmap',
  authenticate,
  requireRole('ADMIN'),
  validate({ body: createRoadmapSchema }),
  roadmapCtrl.createRoadmap
);

module.exports = router;
