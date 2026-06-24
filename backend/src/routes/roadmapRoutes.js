const express = require('express');
const ctrl = require('../controllers/roadmapController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createRoadmapSchema, updateStepProgressSchema } = require('../validators/ideaValidators');

const router = express.Router();

router.get('/progress/mine', authenticate, ctrl.listMyProgress);
router.get('/:roadmapId', ctrl.getRoadmap);

router.patch('/:roadmapId', authenticate, requireRole('ADMIN'), validate({ body: createRoadmapSchema }), ctrl.updateRoadmap);

router.post('/:roadmapId/start', authenticate, ctrl.startRoadmap);
router.patch(
  '/progress/:userRoadmapId/steps/:stepId',
  authenticate,
  validate({ body: updateStepProgressSchema }),
  ctrl.updateStepProgress
);

module.exports = router;
