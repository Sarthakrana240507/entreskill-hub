const express = require('express');
const ctrl = require('../controllers/mentorController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  mentorApplicationSchema,
  mentorReviewSchema,
} = require('../validators/miscValidators');

const router = express.Router();

// Mentor directory & profile
router.get('/', ctrl.listMentors);
router.get('/applications/pending', authenticate, requireRole('ADMIN'), ctrl.listPendingApplications);
router.get('/me/mentees', authenticate, requireRole('MENTOR'), ctrl.getMyMenteeEngagement);
router.get('/:id', ctrl.getMentor);

router.post('/apply', authenticate, validate({ body: mentorApplicationSchema }), ctrl.applyAsMentor);
router.patch('/:id/review', authenticate, requireRole('ADMIN'), validate({ body: mentorReviewSchema }), ctrl.reviewMentorApplication);

module.exports = router;
